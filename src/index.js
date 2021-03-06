import React, { Component } from 'react'
import PropTypes from 'prop-types'
import memoize from "memoize-one";
import * as d3 from "d3"

import styles from './styles.css'
import sankeyFunction from "./sankey.js"


export default class Sankey extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,

    iterations: PropTypes.number,
    onLinkMouseOverHandler: PropTypes.func,
    onLinkClickHandler: PropTypes.func,
    onNodeMouseDownHandler: PropTypes.func,
    onNodeDragHandler: PropTypes.func,
    onNodeMouseUpHandler: PropTypes.func,
    height: PropTypes.number,
    textPaddingX: PropTypes.number,
    textDy: PropTypes.string,
    linkStroke: PropTypes.string,
    getLinkTitle: PropTypes.func,
    nodeStroke: PropTypes.string,
    nodeStrokeWidth: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    nodeWidth: PropTypes.number,
    nodePadding: PropTypes.number,
    getNodeTitle: PropTypes.func,
  }

  static defaultProps = {
    iterations: 40,
    onLinkMouseOverHandler: function(e, link) {},
    onLinkClickHandler: function(e, link) {},
    onNodeMouseDownHandler: function(e, node) {},
    onNodeDragHandler: function(e, dragNodeIndex, dragStartNodeY, dragStartMouseY) {},
    onNodeMouseUpHandler: function(e) {},
    height: 500,
    textPaddingX: 6,
    textDy: ".35em",
    linkStroke: "#000",
    getLinkTitle: link => link.source.label + " → " +  link.target.label + "\nlink has " + link.value + " units",
    nodeStroke: "gray",
    nodeStrokeWidth: 2,
    nodeWidth: 36,
    nodePadding: 40,
    getNodeTitle: node => node.label + "\nnode has " + node.value + " units"
  }

  constructor(props) {
    super(props)

    this.state = {
      width: 500,
    };

    this.dragNodeIndex = null;
    this.dragStartNodeY = null;
    this.dragStartMouseY = null;

    this.ref = React.createRef();
  }

  componentDidMount() {
    window.addEventListener("resize", this.resize); //add resize listener
    this.resize();
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.resize); //remove resize listener
  }

  //this function sets the new width that the viz can take up
  resize = e => {
    if(this.ref.current) {
      this.setState({width: this.ref.current.clientWidth});
    }
  }

  processData = () => {
    const {
      data,

      iterations,
      height,
      nodeStrokeWidth,
      nodeWidth,
      nodePadding,
    } = this.props

    const yValues = data.nodes.map(n => n.y); //preserve the y values of the data nodes

    // Set the sankey diagram properties
    const nodeStrokeWidthPadding = parseInt(nodeStrokeWidth)+1 || 0;
    const width = this.ref.current ? this.ref.current.clientWidth : this.state.width;
    const sankey = sankeyFunction().nodeWidth(nodeWidth).nodePadding(nodePadding).size([width-nodeStrokeWidthPadding, height-nodeStrokeWidthPadding]);

    const path = sankey.link();

    sankey.nodes(data.nodes).links(data.links).layout(iterations);

    //if there were nodes AND there were valid y values, preserve the y values even after resizing
    if(yValues.length>0 && !isNaN(parseInt(yValues[0]))) {
      data.nodes.forEach((n,i) => n.y=yValues[i])
    }

    return {path: path, sankey: sankey, width: width};
  }

  getSankeyData = memoize(
    (propsData, stateWidth) => this.processData()
  );

  //begin dragging the rectangle
  startDrag = (e, nodeIndex) => {
    this.dragNodeIndex = nodeIndex; //mark which node we are dragging
    this.dragStartNodeY = this.props.data.nodes[nodeIndex].y; //mark where the node started off
    this.dragStartMouseY = e.screenY; //mark where our mouse started off

    this.props.onNodeMouseDownHandler(e, nodeIndex)
  }

  //end dragging the rectangle (mouse up in svg, mouse leaves svg)
  endDrag = e => {
    if(this.dragNodeIndex!==null && this.dragStartNodeY!==null && this.dragStartMouseY!==null) {
      this.props.onNodeMouseUpHandler(e)

    }

    this.dragNodeIndex = null;
    this.dragStartNodeY = null;
    this.dragStartMouseY = null;
  }

  onMouseMove = e => {
    //if we are in the middle of dragging
    if(this.dragNodeIndex!==null && this.dragStartNodeY!==null && this.dragStartMouseY!==null) {
      const desiredPosition = this.dragStartNodeY + e.screenY - this.dragStartMouseY; //the desired new node position is where it was originally placed, plus the difference in starting and current mouse positions

      //restrict the dragging so that the node must remain within the svg
      this.props.data.nodes[this.dragNodeIndex].y = Math.max( Math.min(desiredPosition, this.props.height-this.props.data.nodes[this.dragNodeIndex].dy), 0); //node must not exceed top of svg (y=0) or bottom of svg (y=height-node.dy)

      this.props.onNodeDragHandler(e, this.dragNodeIndex, this.dragStartNodeY, this.dragStartMouseY)

      this.forceUpdate()
    }
  }



  render() {
    const {
      data,

      onLinkMouseOverHandler,
      onLinkClickHandler,
      onNodeDragHandler,
      height,
      textPaddingX,
      textDy,
      linkStroke,
      getLinkTitle,
      nodeStroke,
      nodeStrokeWidth,
      getNodeTitle,

    } = this.props

    const {
      path,
      sankey,
      width
    } = this.getSankeyData(data, this.state.width); //this is necessary in case the data from the parent changes OR the screen is resized
    sankey.relayout(); //this is necessary to drag a node vertically

    return (
      <div ref={this.ref}>
        <svg width={width} height={height} onMouseMove={this.onMouseMove} onMouseUp={this.endDrag} onMouseLeave={this.endDrag}>
          <g transform={"translate("+(nodeStrokeWidth/2)+","+(nodeStrokeWidth/2)+")"}>
            {data.links.sort(function(a, b) { return b.dy - a.dy; }).map((link, i) => {
              const pathDetails = path(link)
              const x = (pathDetails.x0 + pathDetails.x1)/2
              const y = (pathDetails.y0 + pathDetails.y1)/2

              return (
                <g key={i}>
                  <path
                    className={styles.path}
                    d={pathDetails.d}
                    strokeWidth={Math.max(1, link.dy)}
                    stroke={linkStroke}
                    onMouseOver={e => onLinkMouseOverHandler(e, link)}
                    onClick={e => onLinkClickHandler(e, link)}
                  >
                    <title>{getLinkTitle(link)}</title>
                  </path>

                  <text
                    className={styles.nodeText}
                    x={x}
                    y={y}
                    dx={link.labelDx}
                    dy={textDy}
                    textAnchor="middle"
                    transform={"rotate("+Math.tan((pathDetails.y1-pathDetails.y0)/(pathDetails.x1-pathDetails.x0))*180/2+","+x+","+y+")"}
                  >
                    {link.label}
                  </text>
                </g>
              );
            })}

            {data.nodes.map((node, i) => {
              const right = node.x < width/2; //true if the text should be to the right of the rect, else should be to left

              return(
                <g key={i} transform={"translate(" + node.x + "," + node.y + ")"}>
                  <rect className={styles.nodeRect} height={node.dy} width={sankey.nodeWidth()} fill={node.color} stroke={nodeStroke} strokeWidth={nodeStrokeWidth} onMouseDown={e => this.startDrag(e, i)}>
                    <title>{getNodeTitle(node)}</title>
                  </rect>

                  <text className={styles.nodeText} x={right ? textPaddingX+sankey.nodeWidth() : -textPaddingX} y={node.dy/2} dy={textDy} textAnchor={right ? "start" : "end"}>{node.label}</text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    )
  }
}

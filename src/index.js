import React, { Component } from 'react'
import PropTypes from 'prop-types'

import styles from './styles.css'

import * as d3 from "d3"
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
    formatValue: PropTypes.func,
    height: PropTypes.number,
    textPaddingX: PropTypes.number,
    textDy: PropTypes.string,
    linkStroke: PropTypes.string,
    nodeStroke: PropTypes.string,
    nodeStrokeWidth: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    nodeWidth: PropTypes.number,
    nodePadding: PropTypes.number,
  }

  static defaultProps = {
    iterations: 40,
    onLinkMouseOverHandler: function(e, link) {},
    onLinkClickHandler: function(e, link) {},
    onNodeMouseDownHandler: function(e, node) {},
    onNodeDragHandler: function(e, dragNodeIndex, dragStartNodeY, dragStartMouseY) {},
    onNodeMouseUpHandler: function(e) {},
    formatValue: function(d) {return d},
    height: 500,
    textPaddingX: 6,
    textDy: ".35em",
    linkStroke: "#000",
    nodeStroke: "gray",
    nodeStrokeWidth: 2,
    nodeWidth: 36,
    nodePadding: 40,
  }

  constructor(props) {
    super(props)

    this.state = {width: 500};
    const results = this.processData();
    this.state.path = results.path;
    this.state.sankey = results.sankey;

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

  componentDidUpdate(prevProps, prevState) {
    //TODO incorrectly removes any mouse move changes
    if (prevProps.data!==this.props.data || prevState.width!==this.state.width) {
      this.setState(this.processData());
    }
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
      nodeWidth,
      nodePadding,
      nodeStrokeWidth
    } = this.props
    const nodeStrokeWidthPadding = parseInt(nodeStrokeWidth)+1 || 0;


    // Set the sankey diagram properties
    const sankey = sankeyFunction().nodeWidth(nodeWidth).nodePadding(nodePadding).size([this.state.width-nodeStrokeWidthPadding, height-nodeStrokeWidthPadding]);

    const path = sankey.link();

    sankey.nodes(data.nodes).links(data.links).layout(iterations);

    return {path: path, sankey: sankey};
  }

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

      this.setState({sankey: this.state.sankey.relayout()}); //set state to sankey after relayout

      this.props.onNodeDragHandler(e, this.dragNodeIndex, this.dragStartNodeY, this.dragStartMouseY)
    }
  }



  render() {
    const {
      data,

      height,
      formatValue,
      textPaddingX,
      textDy,
      linkStroke,
      nodeStroke,
      nodeStrokeWidth,
    } = this.props

    return (
      <div ref={this.ref}>
        <svg width={this.state.width} height={height} onMouseMove={this.onMouseMove} onMouseUp={this.endDrag} onMouseLeave={this.endDrag}>
          <g transform={"translate("+(nodeStrokeWidth/2)+","+(nodeStrokeWidth/2)+")"}>
            {data.links.sort(function(a, b) { return b.dy - a.dy; }).map((link, i) => {
              return (
                <path
                  key={i}
                  className={styles.path}
                  d={this.state.path(link)}
                  strokeWidth={Math.max(1, link.dy)}
                  stroke={linkStroke}
                  onMouseOver={e => this.props.onLinkMouseOverHandler(e, link)}
                  onClick={e => this.props.onLinkClickHandler(e, link)}
                >
                  <title>{link.source.name + " → " +  link.target.name + "\nlink has " + formatValue(link.value)}</title>
                </path>
              );
            })}

            {data.nodes.map((node, i) => {
              const right = node.x < this.state.width/2; //true if the text should be to the right of the rect, else should be to left

              return(
                <g key={i} transform={"translate(" + node.x + "," + node.y + ")"}>
                  <rect className={styles.nodeRect} height={node.dy} width={this.state.sankey.nodeWidth()} fill={node.color} stroke={nodeStroke} strokeWidth={nodeStrokeWidth} onMouseDown={e => this.startDrag(e, i)}>
                    <title>{node.name + "\nnode has " + formatValue(node.value)}</title>
                  </rect>

                  <text className={styles.nodeText} x={right ? textPaddingX+this.state.sankey.nodeWidth() : -textPaddingX} y={node.dy/2} dy={textDy} textAnchor={right ? "start" : "end"}>{node.name}</text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    )
  }
}

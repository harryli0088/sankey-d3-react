import React, { Component } from 'react'
import PropTypes from 'prop-types'

import styles from './styles.css'

import * as d3 from "d3"
import sankeyFunction from "./sankey.js"

//based off of this example: https://bl.ocks.org/GerardoFurtado/ff2096ed1aa29bb74fa151a39e9c1387
export default class Sankey extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,

    width: PropTypes.number,
    height: PropTypes.number,
    nodeWidth: PropTypes.number,
    nodePadding: PropTypes.number,
    iterations: PropTypes.number,
    format: PropTypes.func,
    textPaddingX: PropTypes.number,
    textDy: PropTypes.string,
  }

  constructor(props) {
    super(props)

    this.state = this.processData();

    this.dragNodeIndex = null;
    this.dragStartNodeY = null;
    this.dragStartMouseY = null;

    this.startDrag = this.startDrag.bind(this);
    this.endDrag = this.endDrag.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  processData() {
    const {
      data,

      width=700,
      height=500,
      nodeWidth=36,
      nodePadding=40,
      iterations=40,
    } = this.props


    // Set the sankey diagram properties
    const sankey = sankeyFunction().nodeWidth(nodeWidth).nodePadding(nodePadding).size([width, height]);

    const path = sankey.link();

    sankey.nodes(data.nodes).links(data.links).layout(iterations);

    return {path: path, sankey: sankey};
  }

  //begin dragging the rectangle
  startDrag(e, nodeIndex) {
    this.dragNodeIndex = nodeIndex; //mark which node we are dragging
    this.dragStartNodeY = this.props.data.nodes[nodeIndex].y; //mark where the node started off
    this.dragStartMouseY = e.screenY; //mark where our mouse started off
  }

  //end dragging the rectangle (mouse up in svg, mouse leaves svg)
  endDrag(e) {
    this.dragNodeIndex = null;
    this.dragStartNodeY = null;
    this.dragStartMouseY = null;
  }

  onMouseMove(e) {
    //if we are in the middle of dragging
    if(this.dragNodeIndex!==null && this.dragStartNodeY!==null && this.dragStartMouseY!==null) {
      const desiredPosition = this.dragStartNodeY + e.screenY - this.dragStartMouseY; //the desired new node position is where it was originally placed, plus the difference in starting and current mouse positions

      //restrict the dragging so that the node must remain within the svg
      this.props.data.nodes[this.dragNodeIndex].y = Math.max( Math.min(desiredPosition, this.props.height-this.props.data.nodes[this.dragNodeIndex].dy), 0); //node must not exceed top of svg (y=0) or bottom of svg (y=height-node.dy)

      this.setState({sankey: this.state.sankey.relayout()}); //set state to sankey after relayout
    }
  }



  render() {
    const {
      data,

      width=700,
      height=500,
      format=(d) => {return d},
      textPaddingX=6,
      textDy=".35em"
    } = this.props

    console.log(data);


    return (
      <svg width={width} height={height} onMouseMove={this.onMouseMove} onMouseUp={this.endDrag} onMouseLeave={this.endDrag}>
        <g>
          {data.links.sort(function(a, b) { return b.dy - a.dy; }).map((link, i) => {
            return (
              <path key={i} className={styles.path} d={this.state.path(link)} strokeWidth={Math.max(1, link.dy)}>
                <title>{link.source.name + " → " +  link.target.name + "\nlink has " + format(link.value)}</title>
              </path>
            );
          })}

          {data.nodes.map((node, i) => {
            const right = node.x < width/2; //true if the text should be to the right of the rect, else should be to left

            return(
              <g key={i} transform={"translate(" + node.x + "," + node.y + ")"}>
                <rect className={styles.nodeRect} height={node.dy} width={this.state.sankey.nodeWidth()} fill={node.color} stroke="gray" onMouseDown={e => this.startDrag(e, i)}>
                  <title>{node.name + "\nnode has " + format(node.value)}</title>
                </rect>

                <text className={styles.nodeText} x={right ? textPaddingX+this.state.sankey.nodeWidth() : -textPaddingX} y={node.dy/2} dy={textDy} textAnchor={right ? "start" : "end"}>{node.name}</text>
              </g>
            );
          })}
        </g>
      </svg>
    )
  }
}

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import styles from './styles.css'

import * as d3 from "d3"
import sankeyFunction from "./sankey.js"

export default class ExampleComponent extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number,
  }

  render() {
    const {
      data,
      width,
      height
    } = this.props


    var units = "Widgets";

    // format variables
    var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d) + " " + units; };


    // Set the sankey diagram properties
    var sankey = sankeyFunction()
    .nodeWidth(36)
    .nodePadding(40)
    .size([width, height]);

    var path = sankey.link();

    sankey
    .nodes(data.nodes)
    .links(data.links)
    .layout(32);


    return (
      <svg width={width} height={height}>
        <g>
          {data.links.sort(function(a, b) { return b.dy - a.dy; }).map((link, i) => {
            return (
              <path key={i} className={styles.path} d={path(link)} strokeWidth={Math.max(1, link.dy)}>
                <title>{link.source.name + " → " +  link.target.name + "\node" + format(link.value)}</title>
              </path>
            );
          })}

          {data.nodes.map((node, i) => {
            const right = node.x < width/2; //true if the text should be to the right of the rect, else should be to left

            return(
              <g key={i} transform={"translate(" + node.x + "," + node.y + ")"}>
                <rect className={styles.nodeRect} height={node.dy} width={sankey.nodeWidth()} fill={node.color} stroke="gray">
                  <title>{node.name + "\node" + format(node.value)}</title>
                </rect>

                <text className={styles.nodeText} x={right ? 6+sankey.nodeWidth() : -6} y={node.dy/2} dy=".35em" textAnchor={right ? "start" : "end"}>{node.name}</text>
              </g>
            );
          })}
        </g>
      </svg>
    )
  }
}

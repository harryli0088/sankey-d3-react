import React, { Component } from 'react'

import Sankey from 'sankey-d3-react'

const data = {
  "nodes":[
    {"node":0,"name":"node0",color:"blue"},
    {"node":1,"name":"node1",color:"green"},
    {"node":2,"name":"node2",color:"red"},
    {"node":3,"name":"node3",color:"orange"},
    {"node":4,"name":"node4",color:"yellow"}
  ],
  "links":[
    {"source":0,"target":2,"value":2},
    {"source":1,"target":2,"value":2},
    {"source":1,"target":3,"value":2},
    {"source":0,"target":4,"value":2},
    {"source":2,"target":3,"value":2},
    {"source":2,"target":4,"value":2},
    {"source":3,"target":4,"value":4}
  ]
};


const format = function(d) { return d + " units"; };


export default class App extends Component {
  render () {
    return (
      <div>
        <Sankey
          data={data}
          width={700}
          height={300}
          nodeWidth={36}
          nodePadding={40} //padding top and bottom between the nodes
          iterations={40} //number of iterations to calculate sankey
          format={format}
          textPaddingX={6} //padding horizontally between node and text
          textDy=".35em" 
        />
      </div>
    )
  }
}

import React from 'react'

import Sankey from 'sankey-d3-react'

let data = {
  nodes:[
    {node:0,label:"Node 0",color:"blue"},
    {node:1,label:"Node 1",color:"green"},
    {node:2,label:"Node 2",color:"red"},
    {node:3,label:"Node 3",color:"orange"},
    {node:4,label:"Node 4",color:"yellow"}
  ],
  links:[
    {source:0,target:2,value:2},
    {source:1,target:2,value:2},
    {source:1,target:3,value:3},
    {source:0,target:4,value:2},
    {source:2,target:3,value:2},
    {source:2,target:4,value:2},
    {source:3,target:4,value:4}
  ]
};
data.links.forEach(l => l.label=l.value + " ⟶")


export default class App extends React.Component {
  state = {
    data: data
  }

  render() {
    console.log(this.state.data);
  return (
    <div>
      <Sankey
        data={this.state.data} //only required prop, should be object with fields nodes and links

        iterations={40} //default 40, number of iterations to calculate sankey
        onLinkMouseOverHandler={function(e, link) {}}
        onLinkClickHandler={function(e, link) {}}
        onNodeMouseDownHandler={function(e, node) {}}
        onNodeDragHandler={function(e, dragNodeIndex, dragStartNodeY, dragStartMouseY) {}}
        onNodeMouseUpHandler={function(e) {}}
        height={500}
        textPaddingX={6} //padding horizontally between node and text
        textDy=".35em"
        linkStroke="#000"
        nodeStroke="gray"
        nodeStrokeWidth={2} //or string
        nodeWidth={36}
        nodePadding={40} //padding top and bottom between the nodes
      />

      <button onClick={e => {
        this.setState({data: {nodes:[
          {node:0,label:"Node 0",color:"blue"},
          {node:1,label:"Node 1",color:"green"},
          {node:2,label:"Node 2",color:"red"},
        ], links:[
          {source:0,target:1,value:2},
          {source:1,target:2,value:2},
        ]}})
      }}
      >
        Test
      </button>
    </div>

  )
}
}

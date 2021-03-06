# sankey-d3-react

> sankey-d3-react

![Demo](/example/sankey-d3-react.gif)

GIF created using https://ezgif.com/video-to-gif

Based off of this example: https://bl.ocks.org/GerardoFurtado/ff2096ed1aa29bb74fa151a39e9c1387

## Development

To get started, in one tab, run:
```bash
npm start
```

And in another tab, run the create-react-app dev server:
```bash
cd example && npm start
```


## Install

```bash
npm install --save harryli0088/sankey-d3-react
```

## Peer Dependencies
The following packages are peer dependencies that you must install yourself

- d3

- memoize-one

- prop-types


## Usage

```jsx
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
    {source:0,target:2,value:2,labelDx:0},
    {source:1,target:2,value:2,labelDx:0},
    {source:1,target:3,value:3,labelDx:0},
    {source:0,target:4,value:2,labelDx:0},
    {source:2,target:3,value:2,labelDx:0},
    {source:2,target:4,value:2,labelDx:0},
    {source:3,target:4,value:4,labelDx:0}
  ]
};
data.links.forEach(l => l.label=l.value + " ⟶")


export default class App extends React.Component {
  state = {
    data: data
  }

  render() {
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
      </div>

    )
  }
}

```

### Props
- `data` {Object} Required object of nodes and links

Optional props
- `iterations` {Number} number of iterations to calculate sankey, defaults to `40`
- `onLinkMouseOverHandler` {Function} defaults to `function(e, link) {}`
- `onLinkClickHandler` {Function} defaults to `function(e, link) {}`
- `onNodeMouseDownHandler` {Function} defaults to `function(e, node) {}`
- `onNodeDragHandler` {Function} defaults to `function(e, dragNodeIndex, dragStartNodeY, dragStartMouseY) {}`
- `onNodeMouseUpHandler` {Function} defaults to `function(e) {}`
- `height` {Number} defaults to `500`
- `textPaddingX` {Number} defaults to `6`
- `textDy` {String} defaults to `.35em`
- `linkStroke` {String} defaults to `#000`
- `getLinkTitle` {Function} defaults to `link => link.source.label + " → " +  link.target.label + "\nlink has " + link.value + " units"`
- `nodeStroke` {String} defaults to `gray`
- `nodeStrokeWidth` {Number | String} defaults to `2`
- `nodeWidth` {Number} defaults to `36`
- `nodePadding` {Number} defaults to `40`
- `getNodeTitle` {Function} defaults to `node => node.label + "\nnode has " + node.value + " units"`

## Acknowledgements
Based off of this example: https://bl.ocks.org/GerardoFurtado/ff2096ed1aa29bb74fa151a39e9c1387

## License

MIT © [harryli0088](https://github.com/harryli0088)

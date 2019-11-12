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


export default function App() {
  return (
    <Sankey
      data={data} //only required prop, should be object with fields nodes and links

      iterations={40} //default 40, number of iterations to calculate sankey
      onLinkMouseOverCallback={function(e, link) {}}
      onLinkClickCallback={function(e, link) {}}
      onNodeMouseDownCallback={function(e, node) {}}
      onNodeDragCallback={function(e, dragNodeIndex, dragStartNodeY, dragStartMouseY) {}}
      onNodeMouseUpCallback={function(e) {}}
      formatValue={format} //default (d) => {return d}
      height={500}
      textPaddingX={6} //padding horizontally between node and text
      textDy=".35em"
      linkStroke="#000"
      nodeStroke="gray"
      nodeStrokeWidth={2} //or string
      nodeWidth={36}
      nodePadding={40} //padding top and bottom between the nodes
    />
  )
}
```

### Props
- `data` {Object} Required object of nodes and links

Optional props
- `iterations` {Number} number of iterations to calculate sankey, defaults to `40`
- `onLinkMouseOverCallback` {Function} defaults to `function(e, link) {}`
- `onLinkClickCallback` {Function} defaults to `function(e, link) {}`
- `onNodeMouseDownCallback` {Function} defaults to `function(e, node) {}`
- `onNodeDragCallback` {Function} defaults to `function(e, dragNodeIndex, dragStartNodeY, dragStartMouseY) {}`
- `onNodeMouseUpCallback` {Function} defaults to `function(e) {}`
- `formatValue` {Function} defaults to `function (d) {return d}`
- `height` {Number} defaults to `500`
- `textPaddingX` {Number} defaults to `6`
- `textDy` {String} defaults to `.35em`
- `linkStroke` {String} defaults to `#000`
- `nodeStroke` {String} defaults to `gray`
- `nodeStrokeWidth` {Number | String} defaults to `2`
- `nodeWidth` {Number} defaults to `36`
- `nodePadding` {Number} defaults to `40`

## Acknowledgements
Based off of this example: https://bl.ocks.org/GerardoFurtado/ff2096ed1aa29bb74fa151a39e9c1387

## License

MIT © [harryli0088](https://github.com/harryli0088)

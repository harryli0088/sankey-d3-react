# sankey-d3-react

> sankey-d3-react

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
npm install --save sankey-d3-react
```

## Usage

```jsx
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
}


export default class App extends Component {
  render () {
    return (
      <div>
        <Sankey
          data={data}
          width={700}
          height={300}
        />
      </div>
    )
  }
}

```

## License

MIT © [harryli0088](https://github.com/harryli0088)
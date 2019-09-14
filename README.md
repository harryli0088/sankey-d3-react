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
  constructor(props) {
    super(props);

    this.state = {
      width: 700
    }

    this.ref = React.createRef();

    this.resize = this.resize.bind(this);
  }

  componentDidMount() {
    window.addEventListener("resize", this.resize); //add resize listener

    this.resize();
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.resize); //remove resize listener
  }

  //this function sets the new width that the viz can take up
  resize() {
    if(this.ref.current) {
      this.setState({width: this.ref.current.clientWidth});
    }
  }



  render () {
    return (
      <div ref={this.ref}>
        <Sankey
          data={data} //only required prop, should be object with fields nodes and links

          width={this.state.width} //default 700
          height={500} //default 500
          nodeWidth={36} //default 36
          nodePadding={40} //default 40, padding top and bottom between the nodes
          iterations={40} //default 40, number of iterations to calculate sankey
          format={format} //default (d) => {return d}
          textPaddingX={6} //default 6, padding horizontally between node and text
          textDy=".35em" //default ".35em"
        />
      </div>
    )
  }
}
```

## License

MIT © [harryli0088](https://github.com/harryli0088)

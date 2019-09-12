import { interpolateNumber, sum, min, nest, ascending } from 'd3';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = "/* add css styles here (optional) */\n\n.styles_nodeRect__1q5YV {\n  cursor: ns-resize; \n  fill-opacity: .9;\n  shape-rendering: crispEdges;\n}\n\n.styles_nodeText__3Wpsg {\n  pointer-events: none;\n  text-shadow: 0 1px 0 #fff;\n}\n\n.styles_path__nv3k2 {\n  fill: none;\n  stroke: #000;\n  stroke-opacity: .2;\n}\n\n.styles_path__nv3k2:hover {\n  stroke-opacity: .5;\n}\n";
var styles = { "nodeRect": "styles_nodeRect__1q5YV", "nodeText": "styles_nodeText__3Wpsg", "path": "styles_path__nv3k2" };
styleInject(css);

function sankey() {
  var sankey = {},
      nodeWidth = 24,
      nodePadding = 8,
      size = [1, 1],
      nodes = [],
      links = [];

  sankey.nodeWidth = function (_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function (_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  sankey.nodes = function (_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  sankey.links = function (_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  sankey.size = function (_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };

  sankey.layout = function (iterations) {
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sankey;
  };

  sankey.relayout = function () {
    computeLinkDepths();
    return sankey;
  };

  sankey.link = function () {
    var curvature = .5;

    function link(d) {
      var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.source.y + d.sy + d.dy / 2,
          y1 = d.target.y + d.ty + d.dy / 2;
      return "M" + x0 + "," + y0 + "C" + x2 + "," + y0 + " " + x3 + "," + y1 + " " + x1 + "," + y1;
    }

    link.curvature = function (_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodes.forEach(function (node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    links.forEach(function (link) {
      var source = link.source,
          target = link.target;
      if (typeof source === "number") source = link.source = nodes[link.source];
      if (typeof target === "number") target = link.target = nodes[link.target];
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
  }

  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
    nodes.forEach(function (node) {
      node.value = Math.max(sum(node.sourceLinks, value), sum(node.targetLinks, value));
    });
  }

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  function computeNodeBreadths() {
    var remainingNodes = nodes,
        nextNodes,
        x = 0;

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function (node) {
        node.x = x;
        node.dx = nodeWidth;
        node.sourceLinks.forEach(function (link) {
          if (nextNodes.indexOf(link.target) < 0) {
            nextNodes.push(link.target);
          }
        });
      });
      remainingNodes = nextNodes;
      ++x;
    }

    //
    moveSinksRight(x);
    scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
  }

  function moveSinksRight(x) {
    nodes.forEach(function (node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function (node) {
      node.x *= kx;
    });
  }

  function computeNodeDepths(iterations) {
    var nodesByBreadth = nest().key(function (d) {
      return d.x;
    }).sortKeys(ascending).entries(nodes).map(function (d) {
      return d.values;
    });

    //
    initializeNodeDepth();
    resolveCollisions();
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    function initializeNodeDepth() {
      var ky = min(nodesByBreadth, function (nodes) {
        return (size[1] - (nodes.length - 1) * nodePadding) / sum(nodes, value);
      });

      nodesByBreadth.forEach(function (nodes) {
        nodes.forEach(function (node, i) {
          node.y = i;
          node.dy = node.value * ky;
        });
      });

      links.forEach(function (link) {
        link.dy = link.value * ky;
      });
    }

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function (nodes, breadth) {
        nodes.forEach(function (node) {
          if (node.targetLinks.length) {
            var y = sum(node.targetLinks, weightedSource) / sum(node.targetLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth.slice().reverse().forEach(function (nodes) {
        nodes.forEach(function (node) {
          if (node.sourceLinks.length) {
            var y = sum(node.sourceLinks, weightedTarget) / sum(node.sourceLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function (nodes) {
        var node,
            dy,
            y0 = 0,
            n = nodes.length,
            i;

        // Push any overlapping nodes down.
        nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
          y0 = node.y + node.dy + nodePadding;
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - size[1];
        if (dy > 0) {
          y0 = node.y -= dy;

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y + node.dy + nodePadding - y0;
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }

    function ascendingDepth(a, b) {
      return a.y - b.y;
    }
  }

  function computeLinkDepths() {
    nodes.forEach(function (node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function (node) {
      var sy = 0,
          ty = 0;
      node.sourceLinks.forEach(function (link) {
        link.sy = sy;
        sy += link.dy;
      });
      node.targetLinks.forEach(function (link) {
        link.ty = ty;
        ty += link.dy;
      });
    });

    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  function center(node) {
    return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value;
  }

  return sankey;
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

//based off of this example: https://bl.ocks.org/GerardoFurtado/ff2096ed1aa29bb74fa151a39e9c1387

var Sankey = function (_Component) {
  inherits(Sankey, _Component);

  function Sankey(props) {
    classCallCheck(this, Sankey);

    var _this = possibleConstructorReturn(this, (Sankey.__proto__ || Object.getPrototypeOf(Sankey)).call(this, props));

    _this.state = _this.processData();

    _this.dragNodeIndex = null;
    _this.dragStartNodeY = null;
    _this.dragStartMouseY = null;

    _this.startDrag = _this.startDrag.bind(_this);
    _this.endDrag = _this.endDrag.bind(_this);
    _this.onMouseMove = _this.onMouseMove.bind(_this);
    return _this;
  }

  createClass(Sankey, [{
    key: 'processData',
    value: function processData() {
      var _props = this.props,
          data = _props.data,
          _props$width = _props.width,
          width = _props$width === undefined ? 700 : _props$width,
          _props$height = _props.height,
          height = _props$height === undefined ? 500 : _props$height,
          _props$nodeWidth = _props.nodeWidth,
          nodeWidth = _props$nodeWidth === undefined ? 36 : _props$nodeWidth,
          _props$nodePadding = _props.nodePadding,
          nodePadding = _props$nodePadding === undefined ? 40 : _props$nodePadding,
          _props$iterations = _props.iterations,
          iterations = _props$iterations === undefined ? 40 : _props$iterations;

      // Set the sankey diagram properties

      var sankey$$1 = sankey().nodeWidth(nodeWidth).nodePadding(nodePadding).size([width, height]);

      var path = sankey$$1.link();

      sankey$$1.nodes(data.nodes).links(data.links).layout(iterations);

      return { path: path, sankey: sankey$$1 };
    }

    //begin dragging the rectangle

  }, {
    key: 'startDrag',
    value: function startDrag(e, nodeIndex) {
      this.dragNodeIndex = nodeIndex; //mark which node we are dragging
      this.dragStartNodeY = this.props.data.nodes[nodeIndex].y; //mark where the node started off
      this.dragStartMouseY = e.screenY; //mark where our mouse started off
    }

    //end dragging the rectangle (mouse up in svg, mouse leaves svg)

  }, {
    key: 'endDrag',
    value: function endDrag(e) {
      this.dragNodeIndex = null;
      this.dragStartNodeY = null;
      this.dragStartMouseY = null;
    }
  }, {
    key: 'onMouseMove',
    value: function onMouseMove(e) {
      //if we are in the middle of dragging
      if (this.dragNodeIndex !== null && this.dragStartNodeY !== null && this.dragStartMouseY !== null) {
        var desiredPosition = this.dragStartNodeY + e.screenY - this.dragStartMouseY; //the desired new node position is where it was originally placed, plus the difference in starting and current mouse positions

        //restrict the dragging so that the node must remain within the svg
        this.props.data.nodes[this.dragNodeIndex].y = Math.max(Math.min(desiredPosition, this.props.height - this.props.data.nodes[this.dragNodeIndex].dy), 0); //node must not exceed top of svg (y=0) or bottom of svg (y=height-node.dy)

        this.setState({ sankey: this.state.sankey.relayout() }); //set state to sankey after relayout
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props2 = this.props,
          data = _props2.data,
          _props2$width = _props2.width,
          width = _props2$width === undefined ? 700 : _props2$width,
          _props2$height = _props2.height,
          height = _props2$height === undefined ? 500 : _props2$height,
          _props2$format = _props2.format,
          format = _props2$format === undefined ? function (d) {
        return d;
      } : _props2$format,
          _props2$textPaddingX = _props2.textPaddingX,
          textPaddingX = _props2$textPaddingX === undefined ? 6 : _props2$textPaddingX,
          _props2$textDy = _props2.textDy,
          textDy = _props2$textDy === undefined ? ".35em" : _props2$textDy;


      return React.createElement(
        'svg',
        { width: width, height: height, onMouseMove: this.onMouseMove, onMouseUp: this.endDrag, onMouseLeave: this.endDrag },
        React.createElement(
          'g',
          null,
          data.links.sort(function (a, b) {
            return b.dy - a.dy;
          }).map(function (link, i) {
            return React.createElement(
              'path',
              { key: i, className: styles.path, d: _this2.state.path(link), strokeWidth: Math.max(1, link.dy) },
              React.createElement(
                'title',
                null,
                link.source.name + " → " + link.target.name + "\nlink has " + format(link.value)
              )
            );
          }),
          data.nodes.map(function (node, i) {
            var right = node.x < width / 2; //true if the text should be to the right of the rect, else should be to left

            return React.createElement(
              'g',
              { key: i, transform: "translate(" + node.x + "," + node.y + ")" },
              React.createElement(
                'rect',
                { className: styles.nodeRect, height: node.dy, width: _this2.state.sankey.nodeWidth(), fill: node.color, stroke: 'gray', onMouseDown: function onMouseDown(e) {
                    return _this2.startDrag(e, i);
                  } },
                React.createElement(
                  'title',
                  null,
                  node.name + "\nnode has " + format(node.value)
                )
              ),
              React.createElement(
                'text',
                { className: styles.nodeText, x: right ? textPaddingX + _this2.state.sankey.nodeWidth() : -textPaddingX, y: node.dy / 2, dy: textDy, textAnchor: right ? "start" : "end" },
                node.name
              )
            );
          })
        )
      );
    }
  }]);
  return Sankey;
}(Component);

Sankey.propTypes = {
  data: PropTypes.object.isRequired,

  width: PropTypes.number,
  height: PropTypes.number,
  nodeWidth: PropTypes.number,
  nodePadding: PropTypes.number,
  iterations: PropTypes.number,
  format: PropTypes.func,
  textPaddingX: PropTypes.number,
  textDy: PropTypes.string
};

export default Sankey;
//# sourceMappingURL=index.es.js.map

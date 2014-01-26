var Graph = require('./graph');

function groupDependencies(deps) {
  var graph = new Graph();

  Object.keys(deps).map(function(parent) {
    graph.addNode(parent);

    // related children to the parent
    var children = deps[parent];
    children.forEach(graph.relateNodes.bind(graph, parent));
  });

  return graph.consume();
}

module.exports = groupDependencies;

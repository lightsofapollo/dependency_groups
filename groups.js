function Node(name) {
  this.name = name;

  this.dependencies = [];
  this.dependents = [];
}

function Groups() {
  this.nodes = {};
  this.root = new Node('$root');
}

function findEdges(edges, seen, node) {
  if (seen[node.name]) return;
  seen[node.name] = true;

  if (!node.dependencies.length) {
    edges.push(node);
    return;
  }

  node.dependencies.forEach(
    findEdges.bind(this, edges, seen)
  );

  return edges;
}

function createOrGetNode(context, name) {
  if (!context.nodes[name]) {
    return context.nodes[name] = new Node(name);
  }
  return context.nodes[name];
}

Groups.prototype = {
  addNode: function(name, parentName) {
    var childNode = createOrGetNode(this, name);
    var parentNode;
    if (parentName) {
      parentNode = createOrGetNode(this, parentName);
    } else {
      parentNode = this.root;
    }

    parentNode.dependencies.push(childNode);
    childNode.dependents.push(parentNode);
  },

  group: function() {
    // get the current edges
    var edges = findEdges([], {}, this.root);
  }
};

module.exports = Groups;

function Node(name) {
  this.name = name;
  this.dependencies = [];
  this.dependents = [];
}

function Groups() {
  this.nodes = {};
}

function createOrGetNode(context, name) {
  if (!context.nodes[name]) {
    return context.nodes[name] = new Node(name);
  }
  return context.nodes[name];
}

Groups.prototype = {
  addNode: function(name) {
    createOrGetNode(this, name);
  },

  hasNode: function(name) {
    return !!this.nodes[name];
  },

  relateNodes: function(parent, child) {
    if (!this.hasNode(parent)) {
      throw new Error('Cannot relate node without a parent');
    }

    var childNode = createOrGetNode(this, child);
    var parentNode = this.nodes[parent];

    parentNode.dependencies.push(childNode);
  },

  findEdges: function(edges, seen, node) {
    if (node.resolved || seen[node.name]) return edges;
    seen[node.name] = true;

    var hasDeps = false;
    node.dependencies.forEach(function(depNode) {
      if (depNode.resolved) return;
      this.findEdges(edges, seen, depNode);
      hasDeps = true;
    }, this);

    if (!hasDeps) {
      edges.push(node.name);
    }

    return edges;
  },

  dependencies: function(name) {
    var nodes = this.nodes;
    function markResolved(group) {
      group.forEach(function(name) {
        nodes[name].resolved = true;
      });
    }

    var root = nodes[name];
    var groups = [];
    var curGroup;
    while (
      (curGroup = this.findEdges([], {}, root)) &&
      curGroup && curGroup.length
    ) {
      markResolved(curGroup);
      groups.push(curGroup);
    }

    return groups;
  }
};

module.exports = Groups;

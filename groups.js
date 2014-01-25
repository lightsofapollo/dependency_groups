function Node(name) {
  this.name = name;
  this.dependencies = [];
}

function Groups() {
  this.nodes = {};
  this.root = new Node('$root');
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

  group: function() {
    var nodes = this.nodes;
    function markResolved(group) {
      group.forEach(function(name) {
        nodes[name].resolved = true;
      });
    }

    var groups = [];
    var curGroup;
    while (
      (curGroup = this.findEdges([], {}, this.root)) &&
      curGroup && curGroup.length
    ) {
      if (curGroup[0] === this.root.name) return groups;
      markResolved(curGroup);
      groups.push(curGroup);
    }

  }
};

module.exports = Groups;

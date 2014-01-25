function Node(name) {
  this.name = name;

  this.dependencies = [];
  this.dependents = [];
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
    childNode.dependents.push(parentNode);
  },

  findEdges: function(edges, seen, node) {
    if (node.resolved || seen[node.name]) return edges;
    seen[node.name] = true;

    var hasDeps = false;
    node.dependencies.forEach(function(depNode) {
      if (depNode.resolved) return;
      hasDeps = true;
      this.findEdges(edges, seen, depNode);
    }, this);

    if (!hasDeps) {
      edges.push(node);
    }

    return edges;
  },

  group: function() {
    function nameify(group) {
      return group.map(function(item) {
        return item.name;
      });
    }

    function markResolved(group) {
      group.forEach(function(item) {
        item.resolved = true;
      });
    }

    var groups = [];
    var curGroup;
    while (
      (curGroup = this.findEdges([], {}, this.root)) &&
      curGroup && curGroup.length
    ) {
      markResolved(curGroup);
      groups.push(nameify(curGroup));
    }

    groups.pop();
    return groups;
  }
};

module.exports = Groups;

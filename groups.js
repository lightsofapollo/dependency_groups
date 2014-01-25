function createSearch(edges) {
  return function dfs(name, seen, target, resolved) {
    if (seen[name] || resolved[name]) return;
    seen[name] = true;

    var hasEdges = false;
    edges[name].forEach(function(subname) {
      if (resolved[subname]) return;
      hasEdges = true;
      dfs(subname, seen, target, resolved);
    });

    if (!hasEdges) {
      target.push(name);
    }
  }
}

function resolveGroup(resolved, group) {
  var len = group.length;
  var i = 0;
  for (; i < len; i++) resolved[group[i]] = true;
}

function appendIfNotExists(array, item) {
  if (array.indexOf(item) !== -1) return false;
  array.push(item);
  return true;
}

function Groups() {
  this.nodes = {};
  this.dependencies = {};
  this.depedndents = {};
}

function createOrGetNode(context, name) {
  if (!context.nodes[name]) {
    return context.nodes[name] = new Node(name);
  }
  return context.nodes[name];
}

Groups.prototype = {
  hasNode: function(name) {
    return !!this.nodes[name];
  },

  addNode: function(name) {
    if (this.hasNode(name)) return false;

    this.nodes[name] = name;
    this.dependencies[name] = [];
    this.depedndents[name] = [];
  },

  relateNodes: function(parent, child) {
    if (!this.hasNode(parent)) {
      throw new Error('Cannot relate node without a parent');
    }

    // ensure the child node exists or create it.
    this.addNode(child);

    appendIfNotExists(this.dependencies[parent], child);
    appendIfNotExists(this.depedndents[child], parent);
  },

  groupUnresolved: function(search, resolved) {
    var target = [];
    var seen = {};
    // find the nodes without parent
    Object.keys(this.nodes).forEach(function(node) {
      // is a root node
      if (!this.depedndents[node].length) {
        // traverse through the node
        search(node, seen, target, resolved);
      }
    }, this);

    return target;
  },

  tree: function(name) {
    var search = createSearch(this.dependencies, {});
    var results = [];
    var resolved = {};

    var group;
    while (
      (group = this.groupUnresolved(search, resolved)) &&
      group.length
    ) {
      resolveGroup(resolved, group);
      results.push(group);
    }

    return results;
  }
};

module.exports = Groups;

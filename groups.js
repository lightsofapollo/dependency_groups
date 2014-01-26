/**
Inefficient depth first search with grouping of resolved nodes.
*/
function createSearch(edges) {
  return function dfs(name, seen, target, resolved, _chain) {
    // dfs is iterated over so we only want one _chain per dfs.
    _chain = _chain || {};

    // don't repeat seen or resolved nodes
    if (seen[name] || resolved[name]) return;

    // book keeping
    seen[name] = true;
    _chain[name] = true;
    var hasEdges = false;

    // iterate over the current dependencies
    edges[name].forEach(function(edgeName) {
      // no duplicates
      if (resolved[edgeName]) return;

      // detect the cyclic references
      if (_chain[edgeName]) {
        throw new Error(
          'cyclic dependency found while resolving ' + name
        );
      }

      // only nodes which have been fully resolved will be returned.
      hasEdges = true;

      // depth first search- keep going
      dfs(edgeName, seen, target, resolved, _chain);
    });

    // we want groups of resolved nodes so only push if this node was fully
    // resolved.
    if (!hasEdges) target.push(name);
  }
}

function groupDependencies(search, context, resolved) {
  var target = [];
  var seen = {};
  // find the nodes without parent
  Object.keys(context.nodes).forEach(function(node) {
    // is a root node
    if (!context.depedndents[node].length) {
      // traverse through the node
      search(node, seen, target, resolved);
    }
  });

  if (!target.length) return null;
  for (var i = 0, len = target.length; i < len; i++) {
    resolved[target[i]] = true;
  }
  return target;
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

  /**
  Traverse all dependencies and group them into batches which can be run in
  parallel.

  @return {Array}
  */
  groupedDependencies: function() {
    var search = createSearch(this.dependencies, {});
    var results = [];
    var resolved = {};

    while ((group = groupDependencies(search, this, resolved))) {
      results.push(group);
    }

    return results;
  }
};

module.exports = Groups;

function appendIfNotExists(array, item) {
  if (array.indexOf(item) !== -1) return false;
  array.push(item);
  return true;
}

function Groups() {
  this.nodes = {};
  this.dependencies = {};
  this.dependents = {};
}

function createOrGetNode(context, name) {
  if (!context.nodes[name]) {
    return context.nodes[name] = new Node(name);
  }
  return context.nodes[name];
}

Groups.prototype = {
  _traverseReadyNodes: function() {
    var target = [];
    // find the nodes without parent
    Object.keys(this.nodes).forEach(function(node) {
      // is a root node
      if (this.dependencies[node].length) return;
      target.push(node);
    }, this);

    target.forEach(function(name) {
      var dependants = this.dependents[name];
      if (dependants) {
        dependants.forEach(function(node) {
          var dependencies = this.dependencies[node];

          var idx = dependencies.indexOf(name);
          if (idx !== -1) dependencies.splice(idx, 1);
        }, this);
      }

      delete this.nodes[name];
      delete this.dependencies[name];
      delete this.dependents[name];
    }, this);

    if (!target.length) return null;
    return target;
  },

  hasNode: function(name) {
    return !!this.nodes[name];
  },

  addNode: function(name) {
    if (this.hasNode(name)) return false;

    this.nodes[name] = name;
    this.dependencies[name] = [];
    this.dependents[name] = [];
  },

  relateNodes: function(parent, child) {
    if (!this.hasNode(parent)) {
      throw new Error('Cannot relate node without a parent');
    }

    // ensure the child node exists or create it.
    this.addNode(child);

    appendIfNotExists(this.dependencies[parent], child);
    appendIfNotExists(this.dependents[child], parent);
  },

  /**
  Traverse all dependencies of a specific node and group them into batches
  which can be run in parallel.

  @param {String} name of the node.
  @return {Array} groups of dependencies.
  */
  groupedDependenciesOf: function(name) {

  },

  /**
  Traverse all dependencies and group them into batches which can be run in
  parallel.

  @return {Array}
  */
  groupedDependencies: function() {
    var results = [];
    var resolved = {};

    while ((group = this._traverseReadyNodes())) {
      results.push(group);
    }

    return results;
  }
};

module.exports = Groups;

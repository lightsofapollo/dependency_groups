suite('groups', function() {
  var DepGroups = require('./groups');
  var subject;
  setup(function() {
    subject = new DepGroups();
  });

  suite('mutli-tier', function() {
    var groups = {
      worker: ['queue'],
      app: ['db', 'queue'],
      db: ['monit', 'xvfb'],
      queue: ['monit', 'amqp'],
      monit: [],
      xvfb: ['monit'],
      amqp: []
    };

    // optimal grouping
    var idealOrder = [
      ['monit', 'amqp'],
      ['queue', 'xvfb'],
      ['worker', 'db'],
      ['app']
    ];

    function addNodes(subject, fixture) {
      // intentionally inserts multiple times
      Object.keys(fixture).map(function(parent) {
        subject.addNode(parent);

        // related children to the parent
        var children = fixture[parent];
        children.forEach(subject.relateNodes.bind(subject, parent));
      });
    }

    test('#tree', function() {
      addNodes(subject, groups);

      assert.deepEqual(
        subject.tree(),
        idealOrder
      );
    });
  });
});

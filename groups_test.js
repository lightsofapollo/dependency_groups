suite('groups', function() {
  var DepGroups = require('./groups');
  var subject;
  setup(function() {
    subject = new DepGroups();
  });

  function addNodes(subject, fixture) {
    // intentionally inserts multiple times
    Object.keys(fixture).map(function(parent) {
      subject.addNode(parent);

      // related children to the parent
      var children = fixture[parent];
      children.forEach(subject.relateNodes.bind(subject, parent));
    });
  }

  suite('cyclic', function() {
    var groups = {
      sharedQueue: ['queue'],
      worker: ['queue'],
      appworker: ['worker', 'app'],
      app: ['db', 'queue', 'sharedQueue'],
      db: ['monit', 'xvfb'],
      queue: ['monit', 'amqp', 'sharedQueue'],
      monit: [],
      xvfb: ['monit'],
      amqp: []
    };

    test('#groupedDependencies', function() {
      addNodes(subject, groups);
      assert.throws(function() {
        subject.groupedDependencies();
      }, /sharedQueue/);
    });
  });

  suite('mutli-tier', function() {
    var groups = {
      worker: ['queue'],
      appworker: ['worker'],
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
      ['appworker', 'app']
    ];

    test('#tree', function() {
      addNodes(subject, groups);

      assert.deepEqual(
        subject.groupedDependencies(),
        idealOrder
      );
    });
  });
});

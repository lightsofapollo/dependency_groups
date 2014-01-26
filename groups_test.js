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

  suite('db', function() {
    var groups = {
      xfoo: [],
      db: ['monit', 'xvfb'],
      monit: [],
      xvfb: ['monit']
    };

    // optimal grouping
    var idealOrder = [
      ['xfoo', 'monit'],
      ['xvfb'],
      ['db']
    ];

    setup(function() {
      addNodes(subject, groups);
    });

    test('#groupedDependenciesOf', function() {
      var result = subject.groupedDependencies();
      assert.deepEqual(
        result,
        idealOrder
      );
    });
  });

  suite('multi-tier', function() {
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

    setup(function() {
      addNodes(subject, groups);
    });

    test('#groupedDependenciesOf - no deps', function() {
      assert.deepEqual(
        subject.groupedDependenciesOf('monit'),
        [['monit']]
      );
    });

    test('#groupedDependenciesOf - partial tree', function() {
      assert.deepEqual(
        subject.groupedDependenciesOf('db'),
        [
          ['monit'],
          ['xvfb'],
          ['db']
        ]
      );
    });

    test('#groupedDependencies', function() {
      assert.deepEqual(
        subject.groupedDependencies(),
        idealOrder
      );
    });
  });
});

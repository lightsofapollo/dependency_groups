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
      queue: ['sharedQueue']
    };

    test('#consume', function() {
      assert.throws(function() {
        addNodes(subject, groups);
        var value = subject.consume();
      }, /sharedQueue/);
    });
  });

  suite('lower and higher deps on same node', function() {
    var groups = {
      db: ['monit', 'xvfb'],
      xvfb: ['monit'],
      monit: []
    };

    // optimal grouping
    var idealOrder = [
      ['monit'],
      ['xvfb'],
      ['db']
    ];

    setup(function() {
      addNodes(subject, groups);
    });

    test('#consume', function() {
      assert.deepEqual(
        subject.consume(),
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

    test('#consume', function() {
      assert.deepEqual(
        subject.consume(),
        idealOrder
      );

      assert.ok(
        !Object.keys(subject.nodes).length,
        'removes nodes'
      );

      assert.ok(
        !Object.keys(subject.dependencies).length,
        'removes dependencies'
      );

      assert.ok(
        !Object.keys(subject.dependents).length,
        'removes dependents'
      );
    });
  });
});

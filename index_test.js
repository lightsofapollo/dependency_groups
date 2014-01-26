suite('group dependencies', function() {
  var subject = require('./');

  suite('cyclic', function() {
    var groups = {
      sharedQueue: ['queue'],
      queue: ['sharedQueue']
    };

    test('group dependencies', function() {
      assert.throws(function() {
        subject(groups);
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

    test('group dependencies', function() {
      assert.deepEqual(
        subject(groups),
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

    test('group dependencies', function() {
      assert.deepEqual(
        subject(groups),
        idealOrder
      );
    });
  });
});

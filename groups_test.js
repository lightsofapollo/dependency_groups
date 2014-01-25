suite('groups', function() {
  var DepGroups = require('./groups');

  var groups = {
    app: ['queue', 'db'],
    db: ['monit', 'xvfb'],
    queue: ['monit', 'amqp'],
    monit: [],
    xvfb: ['monit'],
    amqp: []
  };

  // optimal grouping
  var idealOrder = [
    ['monit', 'amqp'],
    ['xvfb', 'queue'],
    ['db'],
    ['app']
  ];

  var subject;
  setup(function() {
    subject = new DepGroups();

    function addDeps(list, parent) {
      list.forEach(function(name) {
        // add all of the nodes in this list
        subject.addNode(name, parent);

        // if it has deps add them too
        if (groups[name]) {
          addDeps(groups[name], name);
        }
      });
    }

    addDeps(['app'], null);
  });

  test('#group', function() {
    console.log('---');
    assert.deepEqual(
      subject.group(),
      idealOrder
    );
    console.log('---');
  });
});

var selftest = require('../selftest.js');
var Sandbox = selftest.Sandbox;
var utils = require('../utils.js');
var net = require('net');
var Future = require('fibers/future');
var _ = require('underscore');
var files = require('../files.js');

var MONGO_LISTENING =
  { stdout: " [initandlisten] waiting for connections on port" };

selftest.define("npm", ["net"], function () {
  var s = new Sandbox({ fakeMongo: true });
  var run;

  s.createApp("npmtestapp", "npmtest");
  s.cd("npmtestapp");

  // Ensure that we don't lose the executable bits of npm modules.
  // Regression test for https://github.com/meteor/meteor/pull/1808
  // Before this fix, the module would work on the first execution but not on a
  // subsequent one.
  _.times(2, function (i) {
    run = s.run("--once", "--raw-logs");
    run.tellMongo(MONGO_LISTENING);
    if (i === 0) {
      run.waitSecs(2);
      run.read(
        "npm-test: updating npm dependencies -- meteor-test-executable...\n");
    }
    run.waitSecs(15);
    run.read("null; From shell script\n");
    run.expectEnd();
    run.expectExit(0);
  });
});

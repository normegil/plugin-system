'use strict';

var _ = require('lodash');
var test = require('tape');
var loadPlugins = require('../index.js');

var basePathToPlugins = __dirname + '/resources/plugins/';
var pathToPlugins1 = basePathToPlugins + 'plugins1/';
var pathToPlugins2 = basePathToPlugins + 'plugins2/';

var notPlugin = require(pathToPlugins1 + 'notPlugin.js.x');
var filePlugin = require(pathToPlugins1 + 'file');
var file2Plugin = require(pathToPlugins2 + 'file');
var folderPlugin = require(pathToPlugins1 + 'folder');
var subFolderPlugin = require(pathToPlugins1 + 'subFolder/subFolderPlugin.js');
var anotherSubFolderPlugin = require(pathToPlugins1 + 'subFolder/anotherSubFolderPlugin.js');
var thirdSubFolderPlugin = require(pathToPlugins1 + 'subFolder/anotherSubFolder/aThirdSubFolderPlugin.js');

var moduleName = 'Plugin-system';
var testedFunction = 'loadPlugins';
test(moduleName + '.' + testedFunction + '() ' + 'should be a function', function(assert) {
  assert.ok(_.isFunction(loadPlugins), 'loadAll is not a function');
  assert.end();
});

test(moduleName + '.' + testedFunction + '() ' + 'load plugins from inexisting path', function(assert) {
  loadPlugins({paths: ['/path/to/nothing']}, function(err) {
    if (err) { return assert.end(); }
    assert.fail(new Error('Should have send an error for inexisting path'));
  });
});

test(moduleName + '.' + testedFunction + '() ' + 'filter null and undefined plugins', function(assert) {
  loadPlugins({custom: [null, undefined]}, function(err, plugins) {
    if (err) { return assert.fail(err); }
    assert.equal(0, plugins.length);
    assert.end();
  });
});

test(moduleName + '.' + testedFunction + '() ' + 'filter null and undefined plugins when using path', function(assert) {
  loadPlugins({custom: [null, undefined], paths: [pathToPlugins2]}, function(err, plugins) {
    if (err) { return assert.fail(err); }
    assert.equal(1, plugins.length);
    assert.end();
  });
});

test(moduleName + '.' + testedFunction + '() ' + 'should not load the not js file', function(assert) {
  loadPlugins({paths: [pathToPlugins1]}, function(err, plugins) {
    if (err) { return assert.fail(err); }
    assert.notOk(_.contains(plugins, notPlugin));
    assert.end();
  });
});

test(moduleName + '.' + testedFunction + '() ' + 'load plugins in file format', function(assert) {
  loadPlugins({paths: [pathToPlugins1]}, function(err, plugins) {
    if (err) { return assert.fail(err); }
    assert.ok(_.contains(plugins, filePlugin), 'Should load plugin in file format');
    assert.end();
  });
});

test(moduleName + '.' + testedFunction + '() ' + 'load plugins in folder format', function(assert) {
  loadPlugins({paths: [pathToPlugins1]}, function(err, plugins) {
    if (err) { return assert.fail(err); }
    assert.ok(_.contains(plugins, folderPlugin), 'Should load plugin in folder format');
    assert.end();
  });
});

test(moduleName + '.' + testedFunction + '() ' + 'should load sub folder plugins', function(assert) {
  loadPlugins(
    {
      paths: [pathToPlugins1],
    },
    function(err, plugins) {
      if (err) {return assert.fail(err);}
      assert.ok(_.contains(plugins, subFolderPlugin), 'Doesn\'t contains sub folder plugin');
      assert.ok(_.contains(plugins, anotherSubFolderPlugin), 'Doesn\'t contains another sub folder plugin');
      assert.ok(_.contains(plugins, thirdSubFolderPlugin), 'Doesn\'t contains another sub folder plugin');
      assert.end();
    });
});

test(moduleName + '.' + testedFunction + '() ' + 'load all custom plugins', function(assert) {
  var testPlugin = {type: 'test', name: 'Test',};
  var test1Plugin = {type: 'test1', name: 'Test1',};
  loadPlugins(
    {
      custom: [
        testPlugin,
        test1Plugin,
      ],
    },
    function(err, plugins) {
      if (err) { return assert.fail(err); }
      assert.ok(_.contains(plugins, testPlugin), 'Should load object plugin (Test)');
      assert.ok(_.contains(plugins, test1Plugin), 'Should load object plugin (Test1)');
      assert.end();
    });
});

test(moduleName + '.' + testedFunction + '() ' + 'should load objects & files at the same time', function(assert) {
  var plugin = {type: 'right', name: 'Right'};
  loadPlugins(
    {
      paths: [pathToPlugins1],
      custom: [plugin],
    },
    function(err, plugins) {
      if (err) {return assert.fail(err);}
      assert.ok(_.contains(plugins, filePlugin), 'Doesn\'t contains file plugin');
      assert.ok(_.contains(plugins, folderPlugin), 'Doesn\'t contains folder plugin');
      assert.ok(_.contains(plugins, subFolderPlugin), 'Doesn\'t contains sub folder plugin');
      assert.ok(_.contains(plugins, plugin), 'Doesn\'t contains object plugin');
      assert.end();
    });
});

test(moduleName + '.' + testedFunction + '() ' + 'should load plugin in multiple path', function(assert) {
  loadPlugins(
    {
      paths: [
        pathToPlugins1,
        pathToPlugins2,
      ],
    },
    function(err, plugins) {
      if (err) {return assert.fail(err);}
      assert.ok(_.contains(plugins, filePlugin), 'Doesn\'t contains file plugin');
      assert.ok(_.contains(plugins, folderPlugin), 'Doesn\'t contains folder plugin');
      assert.ok(_.contains(plugins, subFolderPlugin), 'Doesn\'t contains sub folder plugin');
      assert.ok(_.contains(plugins, file2Plugin), 'Doesn\'t contains object plugin');
      assert.end();
    }
  );
});

'use strict';

var _ = require('underscore');
var assert = require('chai').assert;
var loadPlugins = require('../index.js');

describe('plugin-system', function() {
  describe('\'.loadPlugins()\'', function() {
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

    it('should be a function', function(done) {
      assert.ok(_.isFunction(loadPlugins), 'loadAll is not a function');
      done();
    });

    it('load plugins from inexisting path', function(done) {
      loadPlugins({paths: ['/path/to/nothing']}, function(err) {
        if (err) { return done(); }
        done(new Error('Should have send an error for inexisting path'));
      });
    });

    it('filter null and undefined plugins', function(done) {
      loadPlugins({custom: [null, undefined]}, function(err, plugins) {
        if (err) { return done(err); }
        assert.equal(0, plugins.length);
        done();
      });
    });

    it('filter null and undefined plugins when using path', function(done) {
      loadPlugins({custom: [null, undefined], paths: [pathToPlugins2]}, function(err, plugins) {
        if (err) { return done(err); }
        assert.equal(1, plugins.length);
        done();
      });
    });

    it('should not load the not js file', function(done) {
      loadPlugins({paths: [pathToPlugins1]}, function(err, plugins) {
        if (err) { return done(err); }
        assert.notOk(_.contains(plugins, notPlugin));
        done();
      });
    });

    it('load plugins in file format', function(done) {
      loadPlugins({paths: [pathToPlugins1]}, function(err, plugins) {
        if (err) { return done(err); }
        assert.ok(_.contains(plugins, filePlugin), 'Should load plugin in file format');
        done();
      });
    });

    it('load plugins in folder format', function(done) {
      loadPlugins({paths: [pathToPlugins1]}, function(err, plugins) {
        if (err) { return done(err); }
        assert.ok(_.contains(plugins, folderPlugin), 'Should load plugin in folder format');
        done();
      });
    });

    it('should load sub folder plugins', function(done) {
      loadPlugins(
        {
          paths: [pathToPlugins1],
        },
        function(err, plugins) {
          if (err) {return done(err);}
          assert.ok(_.contains(plugins, subFolderPlugin), 'Doesn\'t contains sub folder plugin');
          assert.ok(_.contains(plugins, anotherSubFolderPlugin), 'Doesn\'t contains another sub folder plugin');
          assert.ok(_.contains(plugins, thirdSubFolderPlugin), 'Doesn\'t contains another sub folder plugin');
          done();
        });
    });

    it('load all custom plugins', function(done) {
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
          if (err) { return done(err); }
          assert.ok(_.contains(plugins, testPlugin), 'Should load object plugin (Test)');
          assert.ok(_.contains(plugins, test1Plugin), 'Should load object plugin (Test1)');
          done();
        });
    });

    it('should load objects & files at the same time', function(done) {
      var plugin = {type: 'right', name: 'Right'};
      loadPlugins(
        {
          paths: [pathToPlugins1],
          custom: [plugin],
        },
        function(err, plugins) {
          if (err) {return done(err);}
          assert.ok(_.contains(plugins, filePlugin), 'Doesn\'t contains file plugin');
          assert.ok(_.contains(plugins, folderPlugin), 'Doesn\'t contains folder plugin');
          assert.ok(_.contains(plugins, subFolderPlugin), 'Doesn\'t contains sub folder plugin');
          assert.ok(_.contains(plugins, plugin), 'Doesn\'t contains object plugin');
          done();
        });
    });

    it('should load plugin in multiple path', function(done) {
      loadPlugins(
        {
          paths: [
            pathToPlugins1,
            pathToPlugins2,
          ],
        },
        function(err, plugins) {
          if (err) {return done(err);}
          assert.ok(_.contains(plugins, filePlugin), 'Doesn\'t contains file plugin');
          assert.ok(_.contains(plugins, folderPlugin), 'Doesn\'t contains folder plugin');
          assert.ok(_.contains(plugins, subFolderPlugin), 'Doesn\'t contains sub folder plugin');
          assert.ok(_.contains(plugins, file2Plugin), 'Doesn\'t contains object plugin');
          done();
        }
      );
    });
  });
});

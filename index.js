'use strict';

var fs = require('fs');
var async = require('async');
var _ = require('lodash');

module.exports = function loadPlugins(pluginOpts, callback) {
  var paths = pluginOpts.paths;
  var custom = pluginOpts.custom;

  var plugins = [];
  if (undefined !== custom && null !== custom && 0 < custom.length) {
    plugins = custom;
  }
  if (undefined === paths || null === paths) {
    return callback(null, removeWrongPlugins(plugins));
  }

  async.map(
    paths,
    loadPluginsFromPath,
    function onLoaded(err, results) {
      if (err) {
        return callback(err);
      }
      var flatResults = _.flatten(results);
      plugins = _.union(plugins, flatResults);
      return callback(null, removeWrongPlugins(plugins));
    }
  );
};

function loadPluginsFromPath(path, callback) {
  fs.readdir(path, function onRead(err, files) {
    if (err) {
      return callback(err);
    }

    async.map(
      files,
      function loadFile(file, asyncCallback) {
        loadPlugin(path + file, asyncCallback);
      },
      function onLoaded(err, plugins) {
        return callback(err, _.flatten(plugins));
      }
    );
  });
}

function loadPlugin(filePath, callback) {
  fs.stat(filePath, function onStat(err, stat) {
    if (err) {
      return callback(err);
    }
    if (!stat.isDirectory()) {
      var regex = /.+\.js$/i;
      if (filePath.match(regex)) {
        return callback(null, require(filePath));
      }
      return callback(null, null);
    }
    fs.stat(filePath + '/index.js', function onIndexStat(err) {
      if (err) {
        if ('ENOENT' === err.code) {
          return loadPluginsFromPath(filePath + '/', callback);
        }
        return callback(err);
      }
      var folderRequired = require(filePath);
      return callback(null, folderRequired);
    });
  });
}

function removeWrongPlugins(plugins) {
  return _.filter(plugins, function filter(plugin) {
    return undefined !== plugin && null !== plugin;
  });
}

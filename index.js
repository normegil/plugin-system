'use strict';

let fs = require('fs');
let _ = require('lodash');

module.exports = function loadPlugins(pluginOpts) {
  return new Promise(function loadPlugins(resolve, reject) {
    let paths = pluginOpts.paths;
    let custom = pluginOpts.custom;

    let plugins = [];
    if (undefined !== custom && null !== custom && 0 < custom.length) {
      plugins = custom;
    }
    if (undefined === paths || null === paths) {
      return resolve(removeWrongPlugins(plugins));
    }

    let loadPluginsFromPaths = paths.map(function toPromises(path) {
      return loadPluginsFromPath(path);
    });
    Promise.all(loadPluginsFromPaths)
      .then(function onLoad(results) {
        let flatResults = _.flatten(results);
        plugins = _.union(plugins, flatResults);
        resolve(removeWrongPlugins(plugins));
      })
      .catch(reject);
  });
};

function loadPluginsFromPath(path) {
  return new Promise(function loadPluginsFromPath(resolve, reject) {
    fs.readdir(path, function onRead(err, files) {
      if (err) {
        return reject(err);
      }

      let promises = files.map(function toPromises(file) {
        return loadPlugin(path + file);
      });

      Promise.all(promises)
        .then(function onSuccess(plugins) {
          resolve(_.flatten(plugins));
        })
        .catch(reject);
    });
  });
}

function loadPlugin(filePath) {
  return new Promise(function loadPlugin(resolve, reject) {
    fs.stat(filePath, function onStat(err, stat) {
      if (err) {
        reject(err);
      }
      if (!stat.isDirectory()) {
        let regex = /.+\.js$/i;
        if (filePath.match(regex)) {
          return resolve(require(filePath));
        }
        return resolve(null);
      }
      fs.stat(filePath + '/index.js', function onIndexStat(err) {
        if (err) {
          if ('ENOENT' === err.code) {
            return loadPluginsFromPath(filePath + '/')
              .then(resolve)
              .catch(reject);
          }
          return reject(err);
        }
        let plugin = require(filePath);
        return resolve(plugin);
      });
    });
  });
}

function removeWrongPlugins(plugins) {
  return _.filter(plugins, function filter(plugin) {
    return undefined !== plugin && null !== plugin;
  });
}

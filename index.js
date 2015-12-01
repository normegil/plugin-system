'use strict';

let fs = require('fs');
let _ = require('lodash');

let logWrapper = require('log-wrapper');
let log = logWrapper(undefined);

module.exports = function loadPluginsWithLogs(pluginOpts) {
  return loadPlugins(pluginOpts, log);
};

module.exports.registerLogger = function registerLogger(logger) {
  log = logWrapper(logger);
};

function loadPlugins(pluginOpts, log) {
  return new Promise(function loadPlugins(resolve, reject) {
    log.info(pluginOpts, 'load plugins');
    let paths = pluginOpts.paths;
    let custom = pluginOpts.custom;

    let plugins = [];
    if (undefined !== custom && null !== custom && 0 < custom.length) {
      log.debug({customPlugins: pluginOpts.custom}, 'Load custom plugins');
      plugins = custom;
    }
    if (undefined === paths || null === paths) {
      let toReturn = removeWrongPlugins(plugins);
      log.info({plugins: toReturn}, 'No path found - Returning already loaded plugins');
      return resolve(toReturn);
    }

    let loadPluginsFromPaths = paths.map(function toPromises(path) {
      return loadPluginsFromPath(path, log);
    });
    Promise.all(loadPluginsFromPaths)
      .then(function onLoad(results) {
        log.debug({plugins: results}, 'Plugins loaded from path');
        let flatResults = _.flatten(results);
        plugins = _.union(plugins, flatResults);
        let toReturn = removeWrongPlugins(plugins);
        log.info({plugins: toReturn}, 'Plugins loaded');
        resolve(toReturn);
      })
      .catch(reject);
  });
}

function loadPluginsFromPath(path, log) {
  return new Promise(function loadPluginsFromPath(resolve, reject) {
    fs.readdir(path, function onRead(err, files) {
      if (err) {
        return reject(err);
      }
      log.trace({path: path, files: files}, 'Files found in directory');
      let promises = files.map(function toPromises(file) {
        return loadPlugin(path + file, log);
      });

      Promise.all(promises)
        .then(function onSuccess(plugins) {
          resolve(_.flatten(plugins));
        })
        .catch(reject);
    });
  });
}

function loadPlugin(filePath, log) {
  return new Promise(function loadPlugin(resolve, reject) {
    log.debug({path: filePath}, 'Attempt to load ' + filePath);
    fs.stat(filePath, function onStat(err, stat) {
      if (err) {
        reject(err);
      }
      if (!stat.isDirectory()) {
        log.trace({path: filePath}, filePath + ' is not a directory');
        let regex = /.+\.js$/i;
        if (filePath.match(regex)) {
          log.debug({path: filePath}, filePath + ' is a JS file');
          return resolve(require(filePath));
        }
        return resolve(null);
      }
      fs.stat(filePath + '/index.js', function onIndexStat(err) {
        if (err) {
          if ('ENOENT' === err.code) {
            log.trace({path: filePath}, 'index.js not found - Going deeper in file hierarchy');
            return loadPluginsFromPath(filePath + '/', log)
              .then(resolve)
              .catch(reject);
          }
          return reject(err);
        }
        log.debug({path: filePath}, 'index.js found - Loading directory as plugin');
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

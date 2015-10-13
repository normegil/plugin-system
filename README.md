# Plugin-system
Library (for NodeJS) designed to load plugins from given folders, and from objects. It will let you get all the plugins from a folder (including children folders on multiple levels). You can also give it your custom plugins as objects.

## Features
- Load plugins from folder, sub-folder, ...
- Load plugins from given objects, ...
- Can handle mutiple paths

## Installation
To install the library, just use [npm](https://fr.wikipedia.org/wiki/Npm_%28logiciel%29):
`
npm install plugin-system
`

## Usage
The library will send back a function to use like this (More [examples](https://github.com/Normegil/multi-configure/tree/develop/examples)):
```javascript
var loadPlugins = require('plugin-system');
loadPlugins(
  {
    paths: [
      '/path/to/plugins',
      '/path/to/other/plugins'
    ],
    custom: [
      {
        name: 'MyPlugin1',
      },
      {
        name: 'MyPlugin2',
      },
      {
        name: 'MyPlugin3',
      }
    ],
  },
  function callback(err, plugins) {
    // plugins is an array of all the plugins loaded (using require on file/folders & merge with the custom plugins given)
  });
```
The configuration object take two arrays:

- `paths`: all the path to check. It will search through the path and the full hierarchy.
- `custom`: A collection of your custom plugins, defined as function/object/...

The callback will contain any error (`err`) that has happened during the process, and `plugins` will be an array of your plugins.

### Loading process
The paths will be processed separately, and will load the plugins (using `require()`) like this:

- Load every file ending with .js (using `/.+\.js$/` regex)
- Load every folder containing index.js with a `require(pathToFolder)`
- Search every sub-folder (with no index.js) for other plugins.

# LaunchUI Packager

Package applications using [LaunchUI](https://github.com/mimecorg/launchui) for Windows, Linux and OS X.

[![NPM module](https://img.shields.io/npm/v/launchui-packager.svg)](https://npmjs.org/package/launchui-packager)
[![MIT License](https://img.shields.io/github/license/mimecorg/launchui-packager.svg)](https://github.com/mimecorg/launchui-packager/blob/master/LICENSE)

## Installation

Install LaunchUI Packager locally to use it in your build scripts:

```bash
npm install --save-dev launchui-packager
```

## API

LaunchUI Packager provides an API for creating binary packages for applications using LaunchUI.

```js
const packager = require( 'launchui-packager' );

packager( {
  name: 'MyApp',
  version: '1.0.0',
  entry: './dist/main.js',
  out: './packages'
}, function ( err, outPath ) {
  // outPath will be the path of the created directory or ZIP package
} );
```

The `packager()` function supports the following options:

### Required

- `name`: Name of the application to package.
- `version`: Version of the application to package.
- `entry`: Path of the entry script of the application. It will be copied to `app/main.js` inside the package.

### Optional

- `out`: Path of the output directory where the package is created. The default value is the current directory.
- `platform`: The platform of the package. The default value is `process.platform`.
- `arch`: The architecture of the package. The default value is `process.arch`.
- `overwrite`: If set to `true`, an already existing output directory and/or ZIP package will be replaced. The default value is `false`.
- `pack`: If set to `'zip'`, the output directory is packed into a ZIP package. By default, the output directory is not packed.
- `launchuiOpts`: Additional options passed to `launchui.download()`. You can specify the LaunchUI version and cache location. Refer to the [LaunchUI API](https://github.com/mimecorg/launchui#api) for more information.
- `company`: The company name. Maps to `CompanyName` metadata property on Windows.
- `copyright`: The copyright of the application. Maps to the `LegalCopyright` metadata property on Windows and `NSHumanReadableCopyright` on OS X.
- `identifier`: The bundle identifier of the application. Maps to `CFBundleIdentifier` on OS X.
- `category`: The category type of the application. Maps to `LSApplicationCategoryType` on OS X.
- `icon`: Path of the application icon. It must be an `.ico` file on Windows and `.icns` on OS X.
- `license`: Path of the license file to include in the package.
- `dir`: Path of the directory containing additional files which will be copied to the `app` subdirectory in the package.
- `files`: A pattern, or an array of patterns, which specify the files that will be copied from `dir`, for example `'*.js'`. The default value is `'**'`, which means that all files from all subdirectories are copied. Refer to the [Glob](https://github.com/isaacs/node-glob#glob) documentation for more information about supported patterns.

The name of the output directory is `${name}-v${version}-${platform}-${arch}`, for example `MyApp-v1.0.0-win32-ia32`. The name of the ZIP package is the same, with the `.zip` extension.

The LaunchUI executable is automatically renamed to the application name, e.g. `MyApp.exe`. The default resources embedded in the Windows executable, including version information and icon, are replaced using [rcedit](https://github.com/electron/rcedit).

## License

LaunchUI Packager is licensed under the MIT license

Copyright (C) 2018 Michał Męciński

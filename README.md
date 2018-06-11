# LaunchUI Packager

Package applications using [LaunchUI](https://github.com/mimecorg/launchui) for Windows, Linux and OS X.

[![NPM module](https://img.shields.io/npm/v/launchui-packager.svg)](https://npmjs.org/package/launchui-packager)
[![MIT License](https://img.shields.io/github/license/mimecorg/launchui-packager.svg)](https://github.com/mimecorg/launchui-packager/blob/master/LICENSE)

## Introduction

LaunchUI wraps Node.js with a small executable which automatically runs the application. No console window is opened and in case of a fatal error, it is reported using a message box.

LaunchUI Packager provides a command line utility and an API for creating packages based on LaunchUI for Windows, Linux and OS X.

## Installation

Install LaunchUI Packager locally to use it in your build scripts:

```bash
npm install --save-dev launchui-packager
```

Install LaunchUI Packager globally to use it from command line:

```bash
npm install --global launchui-packager
```

## Usage

You can run launchui-packager from the command line:

```bash
launchui-packager <name> <version> <entry> [options...]
```

### Arguments

The following arguments are required:

#### `<name>`

Name of the application to package.

#### `<version>`

Version of the application to package.

#### `<entry>`

Path of the entry script of the application. It will be copied to `app/main.js` inside the package.

### Options

In addition, the following options can be specified:

#### `--out <path>`

Path of the output directory where the package is created. The default value is the current directory.

#### `--platform <platform>`

The platform of the package. The default value is `process.platform`. The supported values are `win32`, `darwin` (OS X) and `linux`.

#### `--arch <arch>`

The architecture of the package. The default value is `process.arch`. The supported values are `x64` (on all platforms) and `ia32` (on win32/linux only).

#### `--overwrite`

When specified, the already existing package directory and/or ZIP file will be replaced. By default, existing files are not replaced.

#### `--pack <format>`

When specified, the package directory is packed using the given format. Currently the only supported format is `zip`. By default, the package directory is not packed.

#### `--launchui-version <version>`

Version of the LaunchUI package to download. The default value is the currently installed version of the `launchui` NPM module.

#### `--launchui-cache <path>`

Path of the LaunchUI cache location where packages are downloaded. The default location is `~/.launchui`.

#### `--company <company>`

The company name. Maps to the `CompanyName` metadata property on Windows.

#### `--copyright <copyright>`

The copyright of the application. Maps to the `LegalCopyright` metadata property on Windows and `NSHumanReadableCopyright` on OS X.

#### `--identifier <identifier>`

The bundle identifier of the application. Maps to `CFBundleIdentifier` on OS X.

#### `--category <category>`

The category type of the application. Maps to `LSApplicationCategoryType` on OS X.

#### `--icon <path>`

Path of the application icon. It must be an `.ico` file on Windows and `.icns` on OS X.

#### `--license <path>`

Path of the license file to include in the root directory of the package.

#### `--dir <path>`

Path of the directory containing additional files to include in the `app` subdirectory of the package.

#### `--files <pattern,...>`

A pattern, or a comma separated list of patterns, which specifies the files to include, for example `*.js`. The default value is `**`, which means that the entire contents of `dir` is included in the package. Refer to the [Glob](https://github.com/isaacs/node-glob#glob) documentation for more information about supported patterns.

### Output

The name of the package directory is `<name>-v<version>-<platform>-<arch>`, for example `MyApp-v1.0.0-win32-ia32`. The name of the ZIP file is the same, with the `.zip` extension. The location of the generated packages can be changed using the `--out` option.

The LaunchUI executable is automatically renamed to the specified application name, for example `MyApp.exe` on Windows, `MyApp.app` on OS X and `MyApp` on Linux.

On Windows, the default resources embedded in the executable, including version information and icon, are replaced using [rcedit](https://github.com/electron/rcedit). On OS X, the package metadata stored in `Info.plist` are replaced.

## API

LaunchUI Packager provides a JavaScript API which can be used by custom build scripts.

```js
const packager = require( 'launchui-packager' );

packager( {
  name: 'MyApp',
  version: '1.0.0',
  entry: './dist/main.js',
  out: './packages'
}, function ( err, outPath ) {
  // outPath will be the path of the created package directory or file
} );
```

The `packager()` function supports the following options:

### Required

- `name`: name of the application
- `version`: version of the application
- `entry`: path of the entry script of the application

### Optional

- `out`: path of the output directory
- `platform`: platform of the package
- `arch`: architecture of the package
- `overwrite`: if set to `true`, existing output will be replaced
- `pack`: pack the output directory
- `launchuiOpts`: additional options passed to `launchui.download()`, including `version` and `cache`
- `company`: company name (win32)
- `copyright`: copyright information (win32/darwin)
- `identifier`: bundle identifier (darwin)
- `category`: application category (darwin)
- `icon`: path of the icon file (win32/darwin)
- `license`: path of the license file
- `dir`: path of the directory containing additional files
- `files`: a pattern, or an array of patterns, which specify additional files to include in the package

See the command line usage above for more information.

## License

LaunchUI Packager is licensed under the MIT license

Copyright (C) 2018 Michał Męciński

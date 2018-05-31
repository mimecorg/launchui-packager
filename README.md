# LaunchUI Packager

Package applications using [LaunchUI](https://github.com/mimecorg/launchui) for Windows, Linux and OS X.

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
- `out`: Path of the output directory where the package is created. It must exist prior to calling `packager()`.

### Optional

- `platform`: The platform of the package. The default value is `process.platform`.
- `arch`: The architecture of the package. The default value is `process.arch`.
- `overwrite`: If set to `true`, an already existing output directory and/or ZIP package will be replaced. The default value is `false`.
- `pack`: If set to `"zip"`, the output directory is packed into a ZIP package. By default, the output directory is not packed.
- `launchuiOpts`: Additional options passed to `launchui.download()`. You can specify the LaunchUI version and cache folder. Refer to the [LaunchUI API](https://github.com/mimecorg/launchui#api) for more information.

The name of the output directory is `${name}-v${version}-${platform}-${arch}`, for example `MyApp-v1.0.0-win32-ia32`. The name of the ZIP package is the same, with the `.zip` extension.

The LaunchUI executable is automatically renamed to the application name, e.g. `MyApp.exe`.

## License

LaunchUI Packager is licensed under the MIT license

Copyright (C) 2018 Michał Męciński

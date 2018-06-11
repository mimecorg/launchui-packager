const fs = require( 'fs' );
const path = require( 'path' );

const launchui = require( 'launchui' );
const extract = require( 'extract-zip' );
const archiver = require( 'archiver' );
const rimraf = require( 'rimraf' );
const mkdirp = require( 'mkdirp' );
const rcedit = require( 'rcedit' );
const glob = require( 'glob' );
const plist = require( 'plist' );

function packager( opts, callback ) {
  const { name, version, entry } = opts;

  if ( typeof name !== 'string' || name === '' )
    throw new TypeError( 'Invalid or missing option: name' );
  if ( typeof version !== 'string' || version === '' )
    throw new TypeError( 'Invalid or missing option: version' );
  if ( typeof entry !== 'string' || entry === '' )
    throw new TypeError( 'Invalid or missing option: entry' );

  const {
    out = '.',
    launchuiOpts = {},
    platform = process.platform,
    arch = process.arch,
    overwrite = false,
    pack = false,
    company,
    copyright,
    identifier,
    category,
    icon,
    license,
    dir,
    files = '**'
  } = opts;

  const targetPath = path.resolve( out );

  if ( pack !== 'zip' && pack !== false )
    throw new TypeError( 'Invalid value of option: pack' );

  console.log( 'Packaging ' + name + ' version ' + version + ' for ' + platform + '-' + arch );

  const dirName = name + '-v' + version + '-' + platform + '-' + arch;
  const zipName = dirName + '.zip';

  const dirPath = path.join( targetPath, dirName );
  const zipPath = path.join( targetPath, zipName );

  let appPath;

  if ( !overwrite ) {
    if ( pack && fs.existsSync( zipPath ) ) {
      console.log( 'Output package already exists: ' + zipName );
      return callback( null, zipPath );
    }

    if ( fs.existsSync( dirPath ) ) {
      console.log( 'Output directory already exists: ' + dirName );
      return finalize();
    }
  }

  Object.assign( launchuiOpts, { platform, arch } );

  launchui.download( launchuiOpts, ( error, lauchuiPath ) => {
    if ( error != null )
      return callback( error, null );

    if ( fs.existsSync( dirPath ) ) {
      rimraf( dirPath, error => {
        if ( error != null )
          return callback( error, null );
        makePackageDir( lauchuiPath );
      } );
    } else {
      makePackageDir( lauchuiPath );
    }
  } );

  function makePackageDir( lauchuiPath ) {
    if ( !fs.existsSync( dirPath ) ) {
      mkdirp( dirPath, error => {
        if ( error != null )
          return callback( error, null );
        extractPackage( lauchuiPath );
      } );
    } else {
      extractPackage( lauchuiPath );
    }
  }

  function extractPackage( lauchuiPath ) {
    console.log( 'Extracting ' + path.basename( lauchuiPath ) );
    extract( lauchuiPath, { dir: dirPath }, error => {
      if ( error != null )
        return callback( error, null );
      if ( platform == 'darwin' )
        renameApplication();
      else
        renameExecutable();
    } );
  }

  function renameApplication() {
    const oldPath = path.join( dirPath, 'launchui.app' );
    const newPath = path.join( dirPath, name + '.app' );
    fs.rename( oldPath, newPath, error => {
      if ( error != null )
        return callback( error, null );
      updatePlist();
    } );
  }

  function updatePlist() {
    const plistPath = path.join( dirPath, name + '.app/Contents/Info.plist' );
    fs.readFile( plistPath, 'utf8', ( error, data ) => {
      if ( error != null )
        return callback( error, null );
      const metadata = plist.parse( data );
      metadata.CFBundleName = name;
      metadata.CFBundleExecutable = name;
      metadata.CFBundleIdentifier = identifier != null ? identifier : 'org.mimec.launchui.' + name;
      metadata.CFBundleVersion = version;
      metadata.CFBundleShortVersionString = version;
      if ( copyright != null )
        metadata.NSHumanReadableCopyright = copyright;
      if ( category != null )
        metadata.LSApplicationCategoryType = category;
      const newData = plist.build( metadata );
      fs.writeFile( plistPath, newData, 'utf8', error => {
        if ( error != null )
          return callback( error, null );
        renameExecutable();
      } );
    } );
  }

  function renameExecutable() {
    let oldPath, newPath;
    if ( platform == 'win32' ) {
      oldPath = path.join( dirPath, 'launchui.exe' );
      newPath = path.join( dirPath, name + '.exe' );
    } else if ( platform == 'darwin' ) {
      oldPath = path.join( dirPath, name + '.app/Contents/MacOS/launchui' );
      newPath = path.join( dirPath, name + '.app/Contents/MacOS/' + name );
    } else {
      oldPath = path.join( dirPath, 'launchui' );
      newPath = path.join( dirPath, name );
    }
    fs.rename( oldPath, newPath, error => {
      if ( error != null )
        return callback( error, null );
      if ( platform == 'win32' )
        callRcedit();
      else if ( platform == 'darwin' )
        copyIcns();
      else
        copyEntryScript();
    } );
  }

  function callRcedit() {
    const exePath = path.join( dirPath, name + '.exe' );
    const versionString = {
      'FileDescription': name,
      'OriginalFilename': name + '.exe',
      'ProductName': name
    };
    if ( company != null )
      versionString[ 'CompanyName' ] = company;
    if ( copyright != null )
      versionString[ 'LegalCopyright' ] = copyright;
    rcedit( exePath, { 'version-string': versionString, 'file-version': version, 'product-version': version, icon }, error => {
      if ( error != null )
        return callback( error, null );
      copyEntryScript();
    } );
  }

  function copyIcns() {
    if ( icon != null ) {
      const destPath = path.join( dirPath, name + '.app/Contents/Resources/launchui.icns' );
      fs.copyFile( icon, destPath, error => {
        if ( error != null )
          return callback( error, null );
        copyEntryScript();
      } );
    } else {
      copyEntryScript();
    }
  }

  function copyEntryScript() {
    if ( platform == 'darwin' )
      appPath = path.join( dirPath, name + '.app/Contents/Resources/app' );
    else
      appPath = path.join( dirPath, 'app' );
    const destPath = path.join( appPath, 'main.js' );
    fs.copyFile( entry, destPath, error => {
      if ( error != null )
        return callback( error, null );
      copyLicense();
    } );
  }

  function copyLicense() {
    if ( license != null ) {
      const destPath = path.join( dirPath, 'LICENSE' );
      fs.copyFile( license, destPath, error => {
        if ( error != null )
          return callback( error, null );
        copyDirectory();
      } );
    } else {
      copyDirectory();
    }
  }

  function copyDirectory() {
    if ( dir != null ) {
      const srcDir = path.resolve( dir );
      const filesArray = Array.isArray( files ) ? files : [ files ];

      findFiles( 0 );

      function findFiles( fileIndex ) {
        if ( fileIndex < filesArray.length ) {
          glob( filesArray[ fileIndex ], { cwd: srcDir, nodir: true }, ( error, matches ) => {
            if ( error != null )
              return callback( error, null );
            processFile( matches, 0, fileIndex );
          } );
        } else {
          finalize();
        }
      }

      function processFile( matches, matchIndex, fileIndex ) {
        if ( matchIndex < matches.length ) {
          const srcPath = path.join( srcDir, matches[ matchIndex ] );
          const destPath = path.join( appPath, matches[ matchIndex ] );
          const destDir = path.dirname( destPath );
          if ( fs.existsSync( destDir ) ) {
            copyFile( srcPath, destPath, matches, matchIndex, fileIndex );
          } else {
            mkdirp( destDir, error => {
              if ( error != null )
                return callback( error, null );
              copyFile( srcPath, destPath, matches, matchIndex, fileIndex );
            } );
          }
        } else {
          findFiles( fileIndex + 1 );
        }
      }

      function copyFile( srcPath, destPath, matches, matchIndex, fileIndex ) {
        fs.copyFile( srcPath, destPath, error => {
          if ( error != null )
            return callback( error, null );
          processFile( matches, matchIndex + 1, fileIndex );
        } );
      }
    } else {
      finalize();
    }
  }

  function finalize() {
    if ( pack )
      packZip();
    else
      callback( null, dirPath );
  }

  function packZip() {
    console.log( 'Packing ' + zipName );

    let output, archive;
    try {
      output = fs.createWriteStream( path.join( zipPath ) );
      archive = archiver( 'zip', { zlib: { level: 9 } } );
      archive.pipe( output );
    } catch ( error ) {
      return callback( error, null );
    }

    output.on( 'close', () => {
      callback( null, zipPath );
    } );

    archive.on( 'error', error => {
      callback( error, null );
    } );

    archive.directory( dirPath, false );
    archive.finalize();
  }
}

module.exports = packager;

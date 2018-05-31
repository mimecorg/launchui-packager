const fs = require( 'fs' );
const path = require( 'path' );

const launchui = require( 'launchui' );
const extract = require( 'extract-zip' );
const archiver = require( 'archiver' );
const rimraf = require( 'rimraf' );

function packager( opts, callback ) {
  const name = opts.name;
  const version = opts.version;
  const entry = opts.entry;
  const out = opts.out;

  if ( typeof name !== 'string' || name === '' )
    throw new TypeError( 'Invalid or missing option: name' );
  if ( typeof version !== 'string' || version === '' )
    throw new TypeError( 'Invalid or missing option: version' );
  if ( typeof entry !== 'string' || entry === '' )
    throw new TypeError( 'Invalid or missing option: entry' );
  if ( typeof out !== 'string' || out === '' )
    throw new TypeError( 'Invalid or missing option: out' );

  const targetPath = path.resolve( out );

  if ( !fs.existsSync( targetPath ) )
    throw new Error( 'Output directory does not exist' );

  const launchuiOpts = opts.launchuiOpts || {};
  const platform = opts.platform || process.platform;
  const arch = opts.arch || process.arch;
  const overwrite = !!opts.overwrite;
  const pack = opts.pack || false;

  if ( pack !== 'zip' && pack !== false )
    throw new TypeError( 'Invalid value of option: pack' );

  console.log( 'Packaging ' + name + ' version ' + version + ' for ' + platform + '-' + arch );

  const dirName = name + '-v' + version + '-' + platform + '-' + arch;
  const zipName = dirName + '.zip';

  const dirPath = path.join( targetPath, dirName );
  const zipPath = path.join( targetPath, zipName );

  if ( !overwrite ) {
    if ( pack && fs.existsSync( zipPath ) ) {
        console.log( 'Output package already exists: ' + zipName );
        return callback( null, zipPath );
    }

    if ( fs.existsSync( dirPath ) ) {
      console.log( 'Output directory already exists: ' + dirName );
      if ( pack )
        return packZip();
      else
        return callback( null, dirPath );
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
      fs.mkdir( dirPath, error => {
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
      renameExecutable();
    } );
  }

  function renameExecutable() {
    let oldPath, newPath;
    if ( platform == 'win32' ) {
      oldPath = path.join( dirPath, 'launchui.exe' );
      newPath = path.join( dirPath, name + '.exe' );
    } else {
      oldPath = path.join( dirPath, 'launchui' );
      newPath = path.join( dirPath, name );
    }
    fs.rename( oldPath, newPath, error => {
      if ( error != null )
        return callback( error, null );
      copyEntryScript();
    } );
  }

  function copyEntryScript() {
    const destPath = path.join( dirPath, 'app/main.js' );
    fs.copyFile( entry, destPath, error => {
      if ( error != null )
        return callback( error, null );
      if ( pack )
        packZip();
      else
        callback( null, dirPath );
    } );
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

#!/usr/bin/env node

const program = require( 'commander' );

const packager = require( './' );
const programVersion = require( './package' ).version;

program.version( programVersion )
  .usage( '<name> <version> <entry>' )
  .option( '--out <path>', 'path of the output directory' )
  .option( '--platform <platform>', 'platform of the package' )
  .option( '--arch <arch>', 'architecture of the package' )
  .option( '--overwrite', 'replace existing output' )
  .option( '--pack <format>', 'pack the output directory' )
  .option( '--launchui-version <version>', 'version of the launchui package' )
  .option( '--launchui-cache <path>', 'path of the launchui cache' )
  .option( '--company <company>', 'company name (win32)' )
  .option( '--copyright <copyright>', 'copyright information (win32/darwin)' )
  .option( '--identifier <identifier>', 'bundle identifier (darwin)' )
  .option( '--category <category>', 'application category (darwin)' )
  .option( '--icon <path>', 'path of the icon file (win32/darwin)' )
  .option( '--license <path>', 'path of the license file' )
  .option( '--dir <path>', 'path of the directory containing additional files' )
  .option( '--files <pattern,...>', 'additional files to include in the package', value => value.split( ',' ) )
  .parse( process.argv );

if ( program.args.length != 3 )
  program.help();

const [ name, version, entry ] = program.args;

const {
  out, platform, arch, overwrite, pack, launchuiVersion, launchuiCache,
  company, copyright, identifier, category, icon, license, dir, files
} = program;

const opts = {
  name, version, entry, out, platform, arch, overwrite, pack,
  launchuiOpts: { version: launchuiVersion, cache: launchuiCache },
  company, copyright, identifier, category, icon, license, dir, files
};

packager( opts, error => {
  if ( error != null ) {
    console.error( error );
    process.exit( 1 );
  }
} );


// Hack for loading modules that have been installed to vendor/ with npm
// eg: npm install expresso --binroot ./vendor --root ./vendor
// (see http://intridea.com/2010/8/24/using-npm-with-heroku-node-js)
// This is needed since the Joyent boxes don't have npm (or a user-writable
// /usr/local, which npm *really* wants)
exports.vrequire = function(lib) { 
  require.paths.unshift("vendor/.npm/" + lib + "/active/package/lib");
  return require(lib); 
}

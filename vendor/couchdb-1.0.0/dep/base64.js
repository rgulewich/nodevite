#!/usr/local/bin/node
// generated by npm, please don't touch!
var dep = require('path').join(__dirname, "vendor/.npm/couchdb/1.0.0/dependencies")
var depMet = require.paths.indexOf(dep) !== -1
var from = "vendor/.npm/couchdb/1.0.0/package/lib/dep/base64"

if (!depMet) require.paths.unshift(dep)
module.exports = require(from)

if (!depMet) {
  var i = require.paths.indexOf(dep)
  if (i !== -1) require.paths.splice(i, 1)
}
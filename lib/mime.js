var puts = require('sys').puts;

var DEBUG = 1;

function Parser() {
  this.headers        = {};
  this.headersDone    = false;
  this.boundary       = '';
  this.collectForBody = false;
  this.body           = '';
};

var headerRE   = /^([^:]+):\s+(.*)/;
var boundaryRE = /boundary=(.*)/;

Parser.prototype.parse = function(text) {
  var split = text.replace(/\r\n/g, "\n").split(/\n/);
  for (var i in split) {
    debug("> '" + JSON.stringify(split[i]) + "'");
    this.parseLine(split[i]);
  }
  return {
    headers: this.headers,
    body: this.body,
  };
}

Parser.prototype.parseLine = function(line) {
  // debug("L: " + line);
  if (this.headersDone) {
    return this.parseBodyLine(line);
  }

  // Parse headers
  var headerMatch = headerRE.exec(line);
  if (headerMatch) {
    var header = headerMatch[1].toLowerCase();
    if (!(header in this.headers)) {
      this.headers[header] = headerMatch[2];
    } else {
      if (!isArray(this.headers[header])) {
        var t = typeof(this.headers[header]);
        this.headers[header] = [ this.headers[header] ];
      }

      this.headers[header].push(headerMatch[2]);
    }

    this.lastHeader = header;

    var boundaryMatch;
    if (header == 'content-type' && (boundaryMatch = boundaryRE.exec(line)))
      this.boundary = boundaryMatch[1];
      
    return;
  }

  if (line == "\r\n" || line == "\n" || line == '') {
    this.headersDone = true;    
    return;
  }

  // A multi-line header
  if (isArray(this.headers[this.lastHeader])) {
    var lastElement = this.headers[this.lastHeader].length - 1;
    this.headers[this.lastHeader][lastElement] += "\n" + line;
  } else
    this.headers[this.lastHeader] += "\n" + line;
}

Parser.prototype.parseBodyLine = function(line) {
  if (line == '--' + this.boundary) {
    this.newPart = true;
    this.collectForBody = false;
    return;
  }
  // Blank line starts the part
  if (this.newPart) {
    if (line == "\r\n" || line == "\n" || line == '') {
      this.newPart = false;
      return;
    }
    var textPlainPart = /Content-Type:\s*text\/plain/.exec(line);
    if (textPlainPart) {
      this.collectForBody = true;
    }
    return;
  }
  if (this.collectForBody)
    this.body += line + "\n";
}

// from http://www.hunlock.com/blogs/Mastering_Javascript_Arrays
function isArray(testObject) {   
    return testObject && !(testObject.propertyIsEnumerable('length')) && typeof testObject === 'object' && typeof testObject.length === 'number';
}

/*
 * Utility functions
 */
function debug(m) {
    if (DEBUG)
      console.log('mime] ' + m);
}

/*
 * Exports
 */
exports.Parser = Parser;

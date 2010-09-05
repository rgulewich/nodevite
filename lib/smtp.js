var puts = require('sys').puts;

/*
 * Some useful globals
 */
var DEBUG = 1;
var OK = 1;
var QUIT = 0;
var eol = "\r\n";
var ok_str = "250 Okay";

function SMTP(hostname, username) {
    this.hostname       = hostname;
    this.username       = username;
    this.data           = '';
    this.collectingData = 0;
};

SMTP.prototype.connect = function() {
  this.state = 'connect';
  return "220 " + this.hostname + " ESMTP smtp.js" + eol;
}


var commands = {
  helo: {
    re: /HELO/i,
    cb: function() {
      return { rc: OK, msg: "250 Pleased to meet you" + eol };
    }
  },
  quit: {
    re: /QUIT/i,
    cb: function() {
      return { rc: QUIT, msg: "221 Bye" + eol };
    }
  },
  mail: {
    re: /MAIL FROM\s*:\s*<([^>\s]+)>/i,
    cb: function(s, match) {
      s.envFrom = match[1];
      return { rc: OK, msg: ok_str + eol };
    }
  },
  rcpt: {
    re: /RCPT TO\s*:\s*<([^>\s]+)>/i,
    cb: function(s, match) {
      if (match[1] != s.username)
        return { rc: OK, msg: "550 5.7.1 recipient <" + match[1] + "> unknown" + eol };
      return { rc: OK, msg: ok_str + eol };
    }
  },
  data: {
    re: /^DATA\s*$/i,
    cb: function(s, match) {
      s.collectingData = 1;
      return { rc: OK, msg: '354 End data with <CR><LF>.<CR><LF>' + eol };
    }
  },
}

SMTP.prototype.parseLine = function(line) {
  if (this.collectingData) {
    return this.parseData(line);
  }
  for (var cmd in commands) {
    // XXX: reinforce state order here
    var match = commands[cmd].re.exec(line);
    //debug(match);
    if (match) {
      return commands[cmd].cb(this, match);
    }
  }
  return { rc: OK, msg: "502 5.5.1 Unrecognized command" + eol };
}

SMTP.prototype.parseData = function(line) {
  if (line == ".\n" || line == ".\r\n" || line.indexOf("\n.\n") != -1) {
    this.collectingData = 0;
    return { rc: OK, msg: ok_str + eol };
  }
  // debug("D: '" + line + "'");
  this.data += line + "\n";
  return { rc: OK };
}

SMTP.prototype.result = function() {
  return {
    envFrom: this.envFrom, 
    data:    this.data,
  };
}

/*
 * Utility functions
 */
function debug(m) {
    if (DEBUG)
      puts(m);
}

/*
 * Exports
 */
exports.OK = OK;
exports.QUIT = QUIT;
exports.eol = eol;
exports.SMTP = SMTP;
exports.ok_str = ok_str;


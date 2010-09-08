var sys    = require('sys'),
    events = require('events'),
    puts   = sys.puts;

/*
 * Some useful globals
 */
var DEBUG = 1;
var OK = 1;
var QUIT = 0;
var eol = "\r\n";
var ok_str = "250 Okay";

function Parser(hostname, email) {
  this.hostname       = hostname;
  this.data           = '';
  this.username       = email;
  this.collectingData = 0;
}
sys.inherits(Parser, events.EventEmitter);

Parser.prototype.connect = function() {
  this.state = 'connect';
  return "220 " + this.hostname + " ESMTP smtp.js" + eol;
}


var commands = {
  helo: {
    re: /HELO/i,
    cb: function() {
      debug('HELO');
      return { rc: OK, msg: "250 Pleased to meet you" + eol };
    }
  },
  quit: {
    re: /QUIT/i,
    cb: function() {
      debug('QUIT');
      return { rc: QUIT, msg: "221 Bye" + eol };
    }
  },
  mail: {
    re: /MAIL FROM\s*:\s*<([^>\s]+)>/i,
    cb: function(s, match) {
      debug('MAIL FROM: ' + match[1]);
      s.envFrom = match[1];
      return { rc: OK, msg: ok_str + eol };
    }
  },
  rcpt: {
    re: /RCPT TO\s*:\s*<([^>\s]+)>/i,
    cb: function(s, match) {
      debug('RCPT TO: ' + match[1]);
      if (match[1] != s.username)
        return { rc: OK, msg: "550 5.7.1 recipient <" + match[1] + "> unknown" + eol };
      return { rc: OK, msg: ok_str + eol };
    }
  },
  data: {
    re: /^DATA\s*$/i,
    cb: function(s, match) {
      s.collectingData = 1;
      debug("DATA start");
      return { rc: OK, msg: '354 End data with <CR><LF>.<CR><LF>' + eol };
    }
  },
}

Parser.prototype.parseLine = function(line) {
  if (this.collectingData) {
    return this.parseData(line);
  }
  for (var cmd in commands) {
    // XXX: reinforce state order here
    var match = commands[cmd].re.exec(line);
    if (match) {
      this.emit(cmd, match);
      return commands[cmd].cb(this, match);
    }
  }
  return { rc: OK, msg: "502 5.5.1 Unrecognized command" + eol };
}

Parser.prototype.parseData = function(line) {
  debug('D: [' + line + ']');
  if (line == ".\n" || line == ".\r\n" || line.indexOf("\n.\n") != -1 || line.indexOf("\r\n.\r\n") != -1) {
    this.collectingData = 0;
    debug("DATA end");
    this.emit('dataEnd', this.data);
    return { rc: OK, msg: ok_str + eol };
  }

  this.data += line + "\n";
  return { rc: OK };
}

Parser.prototype.result = function() {
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
      console.log('smtp] ' + m);
}

/*
 * Exports
 */
exports.OK = OK;
exports.QUIT = QUIT;
exports.eol = eol;
exports.Parser = Parser;
exports.ok_str = ok_str;


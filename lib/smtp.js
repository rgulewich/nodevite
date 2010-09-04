
var sys = require("sys");
var events = require("events");

var OK = 1;
var eol = "\r\n";

exports.OK = OK;

function SMTP(hostname) {
    this.hostname = hostname;
    this.state = "start";
};

exports.SMTP = SMTP;

SMTP.prototype.connect = function() {
  return "220 " + this.hostname + " ESMTP smtp.js" + eol;
}


var commands = {
  helo: {
    re: /HELO/i,
    cb: function() {
      return { rc: OK, msg: "250 Pleased to meet you" + eol};
    }
  },
  quit: {
    re: /QUIT/i,
    cb: function() {
      return { rc: 0, msg: "221 Bye" + eol};
    }
  },
}

SMTP.prototype.parseLine = function(line) {
  for (var cmd in commands) {
    var match = commands[cmd].re.exec(line);
    if (match) {
      return commands[cmd].cb(match);
    }
  }
  return { rc: OK, msg: "502 5.5.1 Unrecognized command" + eol};
}

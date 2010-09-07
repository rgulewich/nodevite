var puts    = require('sys').puts,
    assert  = require('assert'),

    smtp    = require("../lib/smtp.js");
    SMTP    = smtp.SMTP,
    eol     = smtp.eol,
    ok_str  = smtp.ok_str,
    OK      = smtp.OK,
    QUIT    = smtp.QUIT;

module.exports = {
  'happy path': function() {
    var envFrom = 'rob@example.com';
    var rcptTo  = 'invite@somewhere.com';
    var s = new SMTP('hostname', rcptTo);

    assert.eql("220 hostname ESMTP smtp.js" + eol, s.connect());
    assert.eql({ rc: OK, msg: "250 Pleased to meet you" + eol },
                 s.parseLine("helo there"));
    assert.eql({ rc: OK, msg: ok_str + eol},
                 s.parseLine('mail from: <' + envFrom + '>'));
    assert.eql({ rc: OK, msg: ok_str + eol},
                 s.parseLine('rcpt to: <' + rcptTo + '>'));
    assert.eql({ rc: OK, msg: '354 End data with <CR><LF>.<CR><LF>' + eol }, s.parseLine('data'));
    assert.eql({ rc: OK }, s.parseLine('line 1'), 'line 1 parsing');
    assert.eql({ rc: OK }, s.parseLine('line 2'), 'line 2 parsing');
    assert.eql({ rc: OK, msg: ok_str + eol }, s.parseLine('.' + eol));
    assert.eql({ rc: QUIT, msg: "221 Bye" + eol},
                 s.parseLine("quit"));
    assert.eql({ envFrom: envFrom, data: 'line 1' + "\n" + 'line 2' + "\n" },
                 s.result());
  },
  'unsupported commands': function() {
    var s = new SMTP('hostname', 'invite@somewhere.com');
    assert.eql({rc: OK, msg: "502 5.5.1 Unrecognized command" + eol},
                 s.parseLine("some unsupported command"));
  },
  'unknown recipient': function() {
    var rcptTo = 'you@there.com';
    var s = new SMTP('hostname', 'invite@somewhere.com');
    assert.eql({ rc: OK, msg: '550 5.7.1 recipient <' + rcptTo + '> unknown' + eol},
                 s.parseLine('rcpt to: <' + rcptTo + '>'));
  }
};

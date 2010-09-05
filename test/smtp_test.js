var puts = require('sys').puts;
var shoulda = require('../deps/shoulda/shoulda');
var assert  = shoulda.assert,
    context = shoulda.context,
    should  = shoulda.should,
    Tests   = shoulda.Tests;

var smtp    = require("../lib/smtp.js");
    SMTP    = smtp.SMTP,
    eol     = smtp.eol,
    ok_str  = smtp.ok_str,
    OK      = smtp.OK,
    QUIT    = smtp.QUIT;

context("smtp",
  context("happy path",
    should("work properly for a normal transaction", function() {
      var envFrom = 'rob@example.com';
      var rcptTo  = 'invite@somewhere.com';
      var s = new SMTP('hostname', rcptTo);

      assert.equal("220 hostname ESMTP smtp.js" + eol, s.connect());
      assert.equal({ rc: OK, msg: "250 Pleased to meet you" + eol },
                   s.parseLine("helo there"));
      assert.equal({ rc: OK, msg: ok_str + eol},
                   s.parseLine('mail from: <' + envFrom + '>'));
      assert.equal({ rc: OK, msg: ok_str + eol},
                   s.parseLine('rcpt to: <' + rcptTo + '>'));
      assert.equal({ rc: OK, msg: '354 End data with <CR><LF>.<CR><LF>' + eol }, s.parseLine('data'));
      assert.equal({ rc: OK }, s.parseLine('line 1'), 'line 1 parsing');
      assert.equal({ rc: OK }, s.parseLine('line 2'), 'line 2 parsing');
      assert.equal({ rc: OK, msg: ok_str + eol }, s.parseLine('.' + eol));
      assert.equal({ rc: QUIT, msg: "221 Bye" + eol},
                   s.parseLine("quit"));
      assert.equal({ envFrom: envFrom, data: 'line 1' + "\n" + 'line 2' + "\n" },
                   s.result());
    })
  ),

  context("invalid inputs",
    should("unsupported command", function() {
      var rcptTo = 'you@there.com';
      var s = new SMTP('hostname', 'invite@somewhere.com');
      assert.equal({rc: OK, msg: "502 5.5.1 Unrecognized command" + eol},
                   s.parseLine("some unsupported command"));
      assert.equal({ rc: OK, msg: '550 5.7.1 recipient <' + rcptTo + '> unknown' + eol},
                   s.parseLine('rcpt to: <' + rcptTo + '>'));
    })
  )
);

Tests.run();


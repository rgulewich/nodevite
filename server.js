/*
 * Brings up 2 services:
 * - an SMTP server listening for invitations
 * - an HTTP server that allows people to reply to invitations
 */

var net      = require('net'),
    express  = require('express'),
    handlers = require('./lib/handlers'),
    smtp     = require('./lib/smtp');

var smtpServer = 'localhost',
    domain     = 'foo.com',
    email      = 'invite@example.com',
    smtpPort   = 8124,
    httpPort   = 8000,
    pub        = __dirname + '/public';

var server = net.createServer(function (stream) {
  stream.setEncoding('utf8');
  var s = new smtp.Parser(domain, email);

  stream.on('connect', function () {
    stream.write(s.connect());
  });
  stream.on('data', function (data) {
    var ret = s.parseLine(data);
    if (ret.msg)
      stream.write(ret.msg);
    if (ret.rc != smtp.OK) {
      stream.end();
    }
  });
  stream.on('end', function () {
    stream.end();
  });

  s.on('helo', function(match) {
    console.log('XXXXXX');
  });
}).listen(smtpPort, smtpServer);

console.log('SMTP server listening at ' + smtpServer + ':' + smtpPort);
console.log('SMTP server e-mail address: ' + email);
console.log('public dir: ' + pub);
var app = express.createServer(
  express.compiler({ src: pub, enable: ['sass'] }),
  express.staticProvider(pub)
);
app.use(express.logger());
 
app.get('/i/:id?/:uid?', handlers.invitePage);
app.post('/i/:id?/:uid?/reply/:reply?', handlers.inviteAction);
//app.get('/', handlers.mainPage);

app.listen();
console.log('Express server started on port %s', app.address().port);


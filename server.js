
var net = require('net');
var smtp = require('./lib/smtp');


var server = net.createServer(function (stream) {
  var s;
  stream.setEncoding('utf8');
  s = new smtp.SMTP('foo.com');
  stream.on('connect', function () {
    stream.write(s.connect());
  });
  stream.on('data', function (data) {
    var ret = s.parseLine(data);
    stream.write(ret.msg);
    if (ret.rc != smtp.OK) {
      stream.end();
    }
  });
  stream.on('end', function () {
    stream.end();
  });
});

server.listen(8124, 'localhost');

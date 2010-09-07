var puts    = require('sys').puts,
    fs      = require('fs'),
    assert  = require('assert'),

    mime    = require("../lib/mime.js");

module.exports = {
  "handle multiple recipients and html parts": function() {
    var file    = 'test/mime/multiple_recipients';
    var exp = {
      headers: {
        'delivered-to': 'primary.recipient@gmail.com',
        // Multiple recieved headers go in an array
        received: [ "by 10.216.11.207 with SMTP id 57cs148420wex;\n"
                      + '        Fri, 3 Sep 2010 21:01:39 -0700 (PDT)',
                    "from mr.google.com ([10.114.126.2])\n"
                      + "        by 10.114.126.2 with SMTP id y2mr254680wac.57.1283572897478 (num_hops = 1);\n"
                      + '        Fri, 03 Sep 2010 21:01:37 -0700 (PDT)',
                    "by 10.114.126.2 with SMTP id y2mr204741wac.57.1283572897419; Fri, 03\n"
                      + ' Sep 2010 21:01:37 -0700 (PDT)',
                    'by 10.114.235.15 with HTTP; Fri, 3 Sep 2010 21:01:37 -0700 (PDT)',
                    ],
        'return-path': '<the.sender@gmail.com>',
        'received-spf': 'pass (google.com: domain of the.sender@gmail.com designates 10.114.126.2 as permitted sender) client-ip=10.114.126.2;',
        'authentication-results': 'mr.google.com; spf=pass (google.com: domain of the.sender@gmail.com designates 10.114.126.2 as permitted sender) smtp.mail=the.sender@gmail.com; dkim=pass header.i=the.sender@gmail.com',
        'dkim-signature': "v=1; a=rsa-sha256; c=relaxed/relaxed;\n"
                          + "        d=gmail.com; s=gamma;\n"
                          + "        h=domainkey-signature:mime-version:received:received:date:message-id\n"
                          + "         :subject:from:to:content-type;\n"
                          + "        bh=oKKZcHBB0dkvupzjayJrSZk9B78xXTwtKCEq+ox5dEI=;\n"
                          + "        b=VnGUGMS5N2UCxEYxLaG5Dpa+hgAWDEzDii2mgGaWLsyx/0jcESDn9sBmCeWkghpjCL\n"
                          + "         gPL1a+KZ+Ja/8k69lUjAJeTkl7GMbGQSz9SCXtaJGSDXUYei8sKUz8/IDkVBHA0ITgQf\n"
                          + "         /zz7iyUX0mZrUx0oa0TOjXuU2WY+geT3qY5lI=",
        "domainkey-signature": "a=rsa-sha1; c=nofws;\n"
                               + "        d=gmail.com; s=gamma;\n"
                               + "        h=mime-version:date:message-id:subject:from:to:content-type;\n"
                               + "        b=hxSne6XSlJLeDrdxxSCiB7FjguZnTCJv5Y9N5L/YMvGKQ+IflWIy3prLsvUlrfJim0\n"
                               + "         JThrD6wxHJ6mGUKDfy+QY2dgGRaiwyNmAe3hJfGApfEN4MGRC5j3PIhykAli35QDAEwk\n"
                               + "         72g3bCGpwTQ4N4YkDqXQGQGkWq8RAMjjoSF8g=",
        'mime-version': '1.0',
        date: 'Fri, 3 Sep 2010 21:01:37 -0700',
        subject: 'Breakfast...',
        'content-type': 'multipart/alternative; boundary=00163646bf9898118c048f671a7c',
        from: 'The Sender <the.sender@gmail.com>',
        to: 'Recip One <recip.one@gmail.com>, Recip Two <recip.two@gmail.com>, \n' 
          + '\tRecip Three <recipthree@gmail.com>, Recip Four <recip@example.ca>, \n' 
          + '\tRecip Five <recip.five@example.com>, "recip6@gmail.com" <recip6@gmail.com>, \n' 
          + '\tRecip 7 <recip7@gmail.com>, "primary.recipient@gmail.com" <primary.recipient@gmail.com>, \n' 
          + '\tRecip 8 <recip8@gmail.com>, "Recipient, Ninth" <Ninth.Recipient@example.ca>',
        'message-id': '<AANLkTiktuKLUTGp98mUBFP-P94CWQRR6i=tGan3u-8Sz@mail.gmail.com>',
      },
      body: "Hey all!\n\nSorry, but this week, I am just a wreck from some very early morning shifts.\n I'm afraid I won't be organizing a breakfast for tomorrow, but please don't\nlet that stop anyone who is hellbent on some good breakfast.  Recip, I would\nhighly recommend going to Jethro's if you haven't been already.  It is only\nup the road from you, after all.\n\nHope you all have a great long weekend.  I'll be more on top of things by\nmid-next week.  Again, I'm sorry!\n\nThe Sender\n\n"
    };
    var text    = fs.readFileSync(file + '.eml', 'ascii');
    var parser  = new mime.Parser();

    var res = parser.parse(text);
    // Assert the headers and body separately, to make tracking down errors a
    // little more managable

    for (var h in exp.headers) {
      assert.ok(h in res.headers);
      assert.eql(exp.headers[h], res.headers[h], 
        'header [' + h + "] matches:\nExp:\n----\n" + JSON.stringify(exp.headers[h]) 
        + "\n----\nRes:\n----\n" + JSON.stringify(res.headers[h]) + "\n----\n");
      delete(res.headers[h]);
    }
    // Make sure we didn't get any extra headers somehow
    assert.eql({}, res.headers);

    assert.equal(exp.body, res.body);
    var elms = ['headers', 'body'];
    for (var i in elms) {
      var el = elms[i];
      delete(exp[el]);
      delete(res[el]);
    }
    // Now assert the rest
    //assert.eql(exp, res);
  },
};

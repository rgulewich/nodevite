var couchdb  = require('couchdb');

var couchServer = 'invite.couchone.com',
    couchPort   = 5984,
    couchDB     = 'invites',
    siteName    = 'jinvite',
    siteSlogan  = 'no-fuss invitations.',
    DEBUG       = true;

function debug(str) {
  if (DEBUG)
    console.log(str);
}

function nlToBr(str) {
  return String(str).replace(/\n/g, '<br>');
}

/*
 * Error doc pages
 */

function error404(req, res) {
  debug('sending 404 page');
  res.send("ERROR!!!!", 404);
};

function error400(req, res) {
  debug('sending 400 page');
  res.send("ERROR!!!!", 400);
};

exports.error404 = error404;
exports.error400 = error400;

/*
 * Page handlers
 */

exports.mainPage = function(req, res) {
  res.render('index.jade', {
    locals: { 
      pageTitle: siteName + ': ' + siteSlogan, 
      siteName: siteName,
      siteSlogan: siteSlogan,
    }});
}

exports.invitePage = function(req, res) {
  if (!req.params.id)
    return error404(req, res);
  if (!req.params.uid)
    return error404(req, res);

  // XXX: handle if the db is down better!
  var client = couchdb.createClient(couchPort, couchServer),
      db = client.db(couchDB);

  db.getDoc(req.params.id, function(err, doc) {
    if (err) {
      debug('Error getting document (id=' + req.params.id +'): ' + JSON.stringify(err));
      return error404(req, res);
    }

    if (!(req.params.uid in doc.people)) {
      debug(doc);  
      return error404(req, res);
    }

    var user = doc.people[req.params.uid],
        byReply = {
          yes:     { },
          no:      { },
          maybe:   { },
          noreply: { },
          counts: {
            yes:     0,
            no:      0,
            maybe:   0,
            noreply: 0,
          }
        };
    delete doc.people[req.params.uid];
    byReply.counts[user.reply == '' ? 'noreply' : user.reply]++;

    for (var p in doc.people) {
      var reply = doc.people[p].reply;
      if (reply == '')
        reply = 'noreply';
      byReply[reply][p] = doc.people[p];
      byReply.counts[reply]++;
    }

    res.render('invite.jade', {
      locals: { 
        pageTitle: doc.name + '(' + siteName + ')', 
        siteName: siteName,
        siteSlogan: siteSlogan,
        owner: doc.owner.name,
        name: doc.name,
        user: user,
        people: byReply,
        message: nlToBr(doc.message),
      }});
  });
}

exports.inviteAction = function(req, res) {
  if (!req.params.id)
    return error400(req, res);
  if (!req.params.uid)
    return error400(req, res);
  if (!req.params.reply)
    return error400(req, res);

  var reply = req.params.reply;
  if ( ! (reply == 'yes' || reply == 'no' || reply == 'maybe')) {
    debug("Invalid reply (was:'" + reply + "')");
    return error400(req, res);
  }

  var client = couchdb.createClient(couchPort, couchServer),
      db = client.db(couchDB);

  db.getDoc(req.params.id, function(err, doc) {
    if (err) {
      debug('Error getting document (id=' + req.params.id +'): ' + JSON.stringify(err));
      return error404(req, res);
    }

    if (!(req.params.uid in doc.people)) {
      debug('Could not find uid in people (id=' + req.params.id +', uid=' + req.params.uid +')');
      return error404(req, res);
    }

    debug('setting ' + req.params.uid + ' -> ' + reply);
    doc.people[req.params.uid].reply = reply;

    db.saveDoc(doc, function(err, ok) {
      if (err) {
        debug('Error saving document (id=' + req.params.id +'): ' + JSON.stringify(err));
        return error400(req, res);
      }

      debug('SUCCESS: ' + req.params.uid + ' -> ' + reply);
      res.send({ status: 'OK' });
    });
  });
}


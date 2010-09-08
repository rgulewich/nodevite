/*
 * Handles creation of invitations
 */
var sys     = require('sys'),
    puts    = sys.puts,
    // 3rd-party
    vrequire = require('./vrequire').vrequire,
    couchdb  = vrequire('couchdb'),
    hash     = vrequire('hash/Task/Hash/Bundle'),
    // project
    mime    = require('./mime');

var server = 'localhost';

var emailRE = /([^<]+)<([^>]+)/;

var parseEmail = function(str) {
  var to = str.trim();
  if (to == "")
    return;
  var match = emailRE.exec(to);
  if (match) {
    return {
      name: match[1].trim().replace(/"/g, ''),
      email: match[2].trim(),
    };
  }
}

var createRecord = function(data) {
  var msgId   = data.headers['message-id'],
      from    = data.headers['from'],
      now     = new Date(),
      ownerId = Hash.MD5.hash(now + msgId + from);

  var tokens = {};
  var recips = data.headers['to'].replace(/\n/g, '').split(/>,/);
  for (var i in recips) {
    var parsedTo = parseEmail(recips[i]);
    if (!parsedTo)
      continue;

    parsedTo.reply = '';
    tokens[Hash.MD5.hash(now + msgId + recips[i])] = parsedTo;
  }

  var parsedFrom = parseEmail(from);
  tokens[ownerId] = parsedFrom;
  parsedFrom.reply = '';

  return {
    people: tokens,
    owner: parsedFrom,
    ownerId: ownerId,
    message: data.body,
    name: data.headers['subject'].trim(),
    // XXX: This should only change once the owner has clicked the confirmation link
    canView: 1,
  };
}

var createInviteFromEmail = function(body) {
  var parser = new mime.Parser();
  //console.log("BODY: " + JSON.stringify(body));
  var parsed = parser.parse(body);

  console.log("PARSED: " + JSON.stringify(parsed));
  //return;
  var record = createRecord(parsed);

  // XXX: better error handling when this doesn't work
  var client = couchdb.createClient(5984, server),
      db = client.db('invites');
  db.saveDoc(record, function(er, ok) {
    if (er) throw new Error(JSON.stringify(er));
    console.log("Created record '" + ok.id + "' (ownerId='" + record.ownerId + "')");
    console.log("doc: " + JSON.stringify(record));
  });
}

/*
 * Exports
 */
exports.createInviteFromEmail = createInviteFromEmail;

// For mocking:
exports._couchdb = couchdb;


var irc = require('./lib/xdcc').irc;
var ProgressBar = require('progress');
var arg = process.argv;

var user = 'desu' + Math.random().toString(36).substr(7, 3);
var hostUser = arg[4], pack = arg[5], progress;
var channels = [ arg[3] ];
var network = arg[2];

console.log('Connecting...');

console.log('Network: ' + network);
console.log('Bot: ' + hostUser);
console.log('Channels: ' + channels);


var client = new irc.Client(network, user, {
  channels: channels,
  userName: user,
  realName: user
});

client.on('join', function(channel, nick, message) {
  if (nick !== user) return;
  console.log('Joined', channel);
  client.getXdcc(hostUser, 'xdcc send #' + pack, '.');
});

client.on('xdcc-connect', function(meta) {
  console.log('Connected: ' + meta.ip + ':' + meta.port);
  progress = new ProgressBar('Downloading... [:bar] :percent, :etas remaining', {
    incomplete: ' ',
    total: meta.length,
    width: 20
  });
});

var last = 0;
client.on('xdcc-data', function(received) {
  progress.tick(received - last);
  last = received;
});

client.on('xdcc-end', function(received) {
  console.log('Download completed');
});

client.on('notice', function(from, to, message) {
  if (to == user && from == hostUser) {
    console.log("[notice]", message);
  }
});

client.on('error', function(message) {
  console.error(message);
});

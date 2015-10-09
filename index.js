'use strict';

// module.exports = {};

var
  express = require('express'),
  argv = require('minimist')(process.argv.slice(2)),
  log = require('log4js').getLogger("index");

var app = express();

app.use(express.static('app'));

app.use('/bower_components', express.static('bower_components'));
app.use('/lib', express.static('lib'));

/*
app.get('/', function(req,res) {
  //res.sendFile('./views/index.html');
  console.log(__dirname + '/index.html');
  res.sendFile(__dirname + '/index.html');
});
*/

// command-line option - e.g. node index.js --port=2000
var portNumber = argv.port || 5000;

app.listen(portNumber);

log.info('express server listening on port',portNumber);

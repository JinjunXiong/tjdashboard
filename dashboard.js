var express = require("express")
var config = require('./config.js')
var path = require("path")
var app = express();
var http = require('http');
var exports = module.exports = {};

// routes
var routes = require('./routes/index');

var server = http.createServer(app).listen(config.webServerNumber, function() {
    var addr = server.address();
    console.log('Express server listening on http://' + addr.address + ':' + addr.port);
});

var bodyParser = require('body-parser');
var bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))
// parse application/json
app.use(bodyParser.json());
app.set('view engine', 'pug');
app.use(express.static('public'));

app.use('/', routes);


var WebSocket = require('ws');
var wss = new WebSocket.Server({
    server
});

var clients = new Map();


wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });
    clients.set(ws._socket._handle.fd, ws);
    //clients.push({id: ws._socket._handle.fd , client: });

    ws.send('something ......');
    var hold = ws;

    ws.on('close', function close() {
        console.log("closing ");
        //  clients.delete(ws._socket._handle.fd);
    });
});



var sendEvent = function(data) {
    console.log("Number of connectd clients", clients.size)
    for (var [key, client] of clients) {
        //console.log(key + ' = sending');
        client.send(JSON.stringify(data))
    }
}


exports.sendEvent = sendEvent;
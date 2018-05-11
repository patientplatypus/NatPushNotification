var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var cors = require('cors');
const WebSocket = require('ws');
const http = require('http');

var NATS = require('nats');
var servers = ['nats://nats:4222'];
var nats = NATS.connect({'servers': servers});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// nats.request('GPS', null, {'max':1}, function(response) {
//   console.log('Got a response for GPS: ' + response);
//   // res.json({"GPSresponse":response});
// });

nats.subscribe('GPS', function(msg) {
  console.log('Received a message: ' + msg);
});  

var server = require('http').createServer();
var io = require('socket.io')(server);
io.set('origins', 'http://localhost:3006');
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('test', function(data){
    console.log("im hearing: ", data);
    socket.emit("GPS", data);
  });
  socket.on('subscribeGPS', function(){
    nats.subscribe('GPS', function(GPS) {
      console.log('Received a GPS: ' + GPS);
      socket.emit("GPS", GPS);
    });
  });
  socket.on('unsubscribeGPS', function(){
    console.log('unsubscribing from the nats GPS connection')
    nats.unsubscribe('GPS');
  });
  socket.on('closeConnection', function(){
    console.log('closing the nats connection');
    nats.close();
  });
});
server.listen(8080);

// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// wss.on('connect', function connection(ws, req) {
//   console.log("inside wss")
//   console.log("and value of req: ", req)
//   console.log("and value of ws: ", ws)
  
//   ws.on('subscribeGPS', function incoming(message){
//     console.log('received: %s', message);
//     nats.subscribe('GPS', function(GPS) {
//       console.log('Received a GPS: ' + GPS);
//       ws.send(JSON.stringify({"natsConnection": "dataReceived", "data":GPS}))
//     });
//   })
//   ws.on('unsubscribeGPS', function incoming(message){
//     console.log('received: %s', message);
//     nats.unsubscribe('GPS');
//     ws.send(JSON.stringify({"natsConnection": "unsubscribed"}));
//   })
//   ws.on('closeConnection', function incoming(message){
//     console.log('received: %s', message);
//     nats.close();
//     ws.send(JSON.stringify({"natsConnection": "closed"}));
//   });
// });

// server.listen(8080, function listening() {
//   console.log('Listening on %d', server.address().port);
// });

 


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

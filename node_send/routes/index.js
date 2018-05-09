var express = require('express');
var router = express.Router();
var fs = require("fs");
var path = require('path');
var NATS = require('nats');

var servers = ['nats://nats:4222'];
var nats = NATS.connect({'servers': servers});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/GPSroutes', function(req, res, next) {
  console.log("inside the GPSroutes route");
  var coordIndex = req.body.coordIndex;
  console.log("value of req.body", req.body);
  console.log("value of req.body.coordIndex", req.body.coordIndex);
  console.log("value of coordIndex: ", coordIndex);
  // var content = fs.readFileSync("nodefile.txt");
  // var contents = fs.readFileSync("./nodefile.txt");
  console.log("value of path ", path.join(__dirname, '../assets/coordfile.txt'));
  var contents = fs.readFileSync(path.join(__dirname, '../assets/coordfile.txt'), 'utf8');
  var jsonContent = JSON.parse(contents);
  // console.log("value of jsonContent: ", jsonContent);
  try {
    // console.log("value of jsonContent coordinates: ", jsonContent.features[coordIndex].geometry.coordinates);
    var coordJson = jsonContent.features[coordIndex].geometry.coordinates;
    nats.publish("GPS", JSON.stringify(coordJson));
    // nats.publish("GPS", "hello there sailor");
    setTimeout(function(){
      res.json({"sent GPS": "yata!"});
    }, 500);
  }
  catch(error) {
    console.log("Oh no an error: ", error);
    res.json({"error":error});
  }
 
});

module.exports = router;

// var NATS = require('nats');
// var nats = NATS.connect();

// // Simple Publisher
// nats.publish('foo', 'Hello World!');

// // Simple Subscriber
// nats.subscribe('foo', function(msg) {
//   console.log('Received a message: ' + msg);
// });

// // Unsubscribing
// var sid = nats.subscribe('foo', function(msg) {});
// nats.unsubscribe(sid);

// // Request Streams
// var sid = nats.request('request', function(response) {
//   console.log('Got a response in msg stream: ' + response);
// });

// // Request with Auto-Unsubscribe. Will unsubscribe after
// // the first response is received via {'max':1}
// nats.request('help', null, {'max':1}, function(response) {
//   console.log('Got a response for help: ' + response);
// });


// // Request for single response with timeout.
// nats.requestOne('help', null, {}, 1000, function(response) {
//   // `NATS` is the library.
//   if(response instanceof NATS.NatsError && response.code === NATS.REQ_TIMEOUT) {
//     console.log('Request for help timed out.');
//     return;
//   }
//   console.log('Got a response for help: ' + response);
// });

// // Replies
// nats.subscribe('help', function(request, replyTo) {
//   nats.publish(replyTo, 'I can help!');
// });

// // Close connection
// nats.close();
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


router.get("/listparser", function(req,res,next){
  //dont care about O(n) let's just get this shit done
  var loopBool = true;
  var outerLoop = true;
  // 30.1945795 / -97.73755 starting coordinate!
  var lat = 30.1945795;
  var lng = -97.73755;
  var newLat = 9999999999;
  var newLng = 9999999999;
  var prevLat = 9999999999;
  var prevLng = 9999999999;
  var distance = 99999999999;

    function recurseFunc(lat, lng, prevLat, prevLng){
      var loopIndex = 0;

      async function doFunc(lat, lng, prevLat, prevLng){
        var contents = fs.readFileSync(path.join(__dirname, '../assets/coordfile2.txt'), 'utf8');
        var jsonContent = JSON.parse(contents);
        console.log("888888888888888888888888888888888888888888888888888888888888")
        console.log("starting vals: ")
        console.log("prevLat: ", prevLat);
        console.log("prevLng: ", prevLng);
        console.log("lat: ", lat);
        console.log("lng: ", lng);
        console.log("888888888888888888888888888888888888888888888888888888888888")
        do {
          try{
            console.log("inside try in do and value of loopIndex: ", loopIndex);
            // var coordJson = jsonContent.elements[loopIndex].geometry.coordinates;
            var coordLat = jsonContent.elements[loopIndex].lat;
            var coordLng = jsonContent.elements[loopIndex].lon;
            if (coordLng===lng&&coordLat===lat){
              console.log('perfect match, skipping');
            }else{
              var lngDist = Math.pow((coordLng-lng), 2);
              var latDist = Math.pow((coordLat-lat), 2);
              console.log('value of lng: ', lng);
              console.log('value of coordLng: ', coordLng);
              console.log('value of lngDist: ', lngDist);
              console.log('value of latDist: ', latDist);
              var calcDistance = Math.sqrt(lngDist+latDist);
              console.log("value of calcDistance: ", calcDistance);
              console.log('value of distance: ', distance);
              if (calcDistance<distance){
                console.log('inside distance if statement');
                console.log("old distance was : ", distance, " new distance is: ", calcDistance);
                distance = calcDistance;
                
                newLat = coordLat;
                newLng = coordLng;
              }
            }
            console.log("right before loop increase and loop value: ", loopIndex);
            loopIndex++
          }
          catch(error){
            console.log('inside catch, aborting with error: ', error);
            console.log('value of distance: ', distance);
            console.log("value of next closest lat/lng: ", newLat, " ", newLng );
            console.log('value of lat/lng prev', jsonContent.elements[loopIndex-1].lat, " ", jsonContent.elements[loopIndex-1].lng);
            var coordString = "{lat:"+newLat+",lng:"+newLng+"}\n";
            fs.writeFile(__dirname + '/../assets/coordout.txt', coordString, function(error) {
              if (error) {
                console.error("write error:  " + error.message);
              } else {
                console.log("Successful Write to " + __dirname + './coordout.txt');
              }
            });
            prevLat = lat;
            prevLng = lng;
            lat = newLat;
            lng = newLng;
            loopBool = false;
            console.log("888888888888888888888888888888888888888888888888888888888888")
            console.log("return vals: ")
            console.log("prevLat: ", prevLat);
            console.log("prevLng: ", prevLng);
            console.log("lat: ", lat);
            console.log("lng: ", lng);
            console.log("888888888888888888888888888888888888888888888888888888888888")
            return [lat, lng, prevLat, prevLng];
          }
        }while(loopBool);  
      }

      async function recursAsync(lat, lng, prevLat, prevLng) {
        const vals = await doFunc(lat, lng, prevLat, prevLng);
        return recurseFunc(vals[0], vals[1], vals[2], vals[3]);
      }

      recursAsync(lat, lng, prevLat, prevLng)

    }

    recurseFunc(lat, lng, prevLat, prevLng)

  
})


function superLooper(timeoutVal){
  console.log('inside superLooper');
  var contents = fs.readFileSync(path.join(__dirname, '../assets/coordfile.txt'), 'utf8');
  var jsonContent = JSON.parse(contents);
  var coordIndex = 0;
  function timeOutFunction(coordIndex){
    var looperBool = true;
    setTimeout(()=>{
      console.log('waiting...')
      try{
        console.log("inside do while loop on TRY");
        var coordJson = jsonContent.features[coordIndex].geometry.coordinates;
        nats.publish("GPS", JSON.stringify(coordJson));
        coordIndex++;
      }
      catch(error) {
        console.log("Oh no an error: ", error);
        looperBool = false;
      }
      if (looperBool){
        timeOutFunction(coordIndex)
      }
    },timeoutVal);
  }
  timeOutFunction(coordIndex);
}

router.post('/GPSlooper', function(req,res,next){
  console.log("inside GPSlooper post");
  superLooper(req.body.timeout);
  res.json({"initiated":"looper"});
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
var express = require('express');
var router = express.Router();

var NATS = require('nats');
var servers = ['nats://nats:4222'];
var nats = NATS.connect({'servers': servers});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/GPSlisten', function(req,res,next){
  console.log('inside GPSlisten');
});

module.exports = router;

var express = require('express');
var path = require('path');
var http = require('http');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', require('./controller/index'));
app.use('/teacher', require('./controller/teacher'));
app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
app.use(function(req, res, next){
  if(req.url!='/favicon-32x32.png') next();
});
app.use(function(err, req, res, next) {
  res.sendStatus(err.status || 500);
});

var server = http.createServer(app);
server.listen(3005);

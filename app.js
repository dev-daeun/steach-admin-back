var express = require('express');
var path = require('path');
var http = require('http');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());



app.use(function(req, res, next){
  if(req.url!='/favicon-32x32.png') next();
});
// app.use(methodOverride('_method'))
app.use('/', require('./controller/index'));
app.use('/teacher', require('./controller/teacher'));
app.use('/student', require('./controller/student'));
app.use('/assignment', require('./controller/assignment'));
app.use(express.static(__dirname + '/public'));


app.use(function(err, req, res, next) {
  console.log(err);
  res.status(err.status || 500).send(err.result);
});

var server = http.createServer(app);
server.listen(3006);

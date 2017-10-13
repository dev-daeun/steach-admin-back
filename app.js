const express = require('express');
const session = require('express-session');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();

const passport = require('./libs/passport');
const redisCfg = require('./config.json').redis;
const redisStore = require('connect-redis')(session);
const redis = require('redis')
const client = redis.createClient({
  password: redisCfg.password
});

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/teacher', express.static(path.join(__dirname, 'public')));
app.use('/student', express.static(path.join(__dirname, 'public')));
app.use('/assignment', express.static(path.join(__dirname, 'public')));
app.use('/dashboard', express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: redisCfg.secret,
  // create new redis store.
  store: new redisStore({ 
    host: redisCfg.host, 
    port: redisCfg.port, 
    client: client
  }),
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 24000 * 60 * 60
  }
}));
app.use(passport.initialize());
app.use(passport.session());


app.get('/favicon.ico', function(req, res) {
  res.sendStatus(204);
});

app.use('/sign', require('./controllers/signController'));
// app.use('/teacher', require('./controllers/teacherController'));
// app.use('/student', require('./controllers/studentController'));
// app.use('/assignment', require('./controllers/assignController'));
// app.use('/dashboard', require('./controllers/dashController'));
app.use('/', require('./controllers/indexController'));

app.use('/teacher', require('./controller/teacher'));
app.use('/student', require('./controller/student'));
app.use('/assignment', require('./controller/assignment'));
app.use('/dashboard', require('./controller/dashboard'));

app.use(function(err, req, res, next) {
  console.log(err);
  res.status(err.status || 500).send(err.message);
});

module.exports = app;
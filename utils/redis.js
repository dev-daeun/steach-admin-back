module.exports.getClient = function(){
  var redis = require('redis');
  var redisConfig = require('../config.json').redis;
  var redisClient = redis.createClient(redisConfig.port, redisConfig.host);
  redisClient.auth(redisConfig.password);
  return redisClient;
};

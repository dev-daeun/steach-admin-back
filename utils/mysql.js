module.exports.getPool = function(){
  var mysql = require("mysql");
  var poolBooster = require('mysql-pool-booster');
      mysql = poolBooster(mysql);
  var mysqlConfig = require('../config.json').mysql;
  var pool = mysql.createPool({
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    user: mysqlConfig.user,
    password: mysqlConfig.password,
    database: mysqlConfig.database,
    connectionLimit: mysqlConfig.connectionLimit,
  });
  return pool;
};

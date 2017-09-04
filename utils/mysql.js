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


class Mysql{ }

Mysql.getPool = function(){
  var pool = mysql.createPool({
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    user: mysqlConfig.user,
    password: mysqlConfig.password,
    database: mysqlConfig.database,
    connectionLimit: mysqlConfig.connectionLimit,
  });
  return pool;
}

Mysql.getConn = function(){
    return new Promise((resolve, reject) => {
      pool.getConnection((err, conn) => {
          if(err) reject(err);
          else resolve(conn);
      });        
    });
  };

Mysql.getTransConn = function(){
    return new Promise((resolve, reject) => {
      pool.getConnection((err, conn) => {
        if(err) reject(err);
        else {
          conn.beginTransaction((err) => {
            if(err) reject(err);
            else resolve(conn);
          });
        };
      });
    });
};
  
Mysql.releaseConn = function(conn, result){
    return new Promise((resolve) => {
        conn.release();
        resolve(result);
    });
};
  
Mysql.commitTransConn = function(conn){
    return new Promise((resolve, reject) => {
      conn.commit((err) => {
        if(err){
            conn.rollback(() => {
                conn.release();
                reject(err);
            });
        }
        else {
            conn.release();
            resolve();
        }
      }); 
    });
}
  
Mysql.rollbackTransConn = function(conn){
    return new Promise((resolve) => {
      conn.rollback(() => {
        conn.release();
        resolve();  
      });
    });
};




module.exports = Mysql;
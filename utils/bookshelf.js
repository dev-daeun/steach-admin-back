const mysql = require('../config.json').mysql;
const knex = require('knex')({
    client: 'mysql',
    connection: {
      host     : mysql.host,
      port     : mysql.port,
      user     : mysql.user,
      password : mysql.password,
      database : mysql.database,
      charset  : 'utf8'
    },
    pool: {
        min: 0,
        max: 20
    }
});
  
module.exports.bookshelf = require('bookshelf')(knex);
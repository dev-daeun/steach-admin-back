const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const dbConfig = require('../config.json').db;
const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
  'host': dbConfig.host,
  'port': dbConfig.port,
  'dialect': dbConfig.dialect
});
let db = {};

fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach((file) => {
    let model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]){
      console.log(db[modelName]);
      db[modelName].associate(db);
  }
});


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

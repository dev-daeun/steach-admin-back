const jwt = require('jsonwebtoken');
const jwtConfig = require('../config.json').jwt;

class Jwt {

  static sign(data) {
    return new Promise((resolve, reject) => {
      jwt.sign(data, jwtConfig.secret, (error, token) => {
        if (error) reject(error);
        else resolve(token);
      });
    });
  }

  static verify(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, jwtConfig.secret, (error, decoded) => {
        if (error) reject(error);
        else resolve(decoded);
      });
    });
  }

}

module.exports = Jwt;

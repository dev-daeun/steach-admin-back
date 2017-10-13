const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const cryptoCfg = require('../config.json').crypto;

class Encryption{

    static hash(data){
        return new Promise((resolve, reject) => {
            bcrypt.hash(data, null, null, (err, result) => {
                if(err) reject(err);
                else resolve(result);
            });
        });
    }

    static compare(data, hashed){
        return new Promise((resolve, reject) => {
            bcrypt.compare(data, hashed, (err, result) => {
                if(err) reject(err);
                else resolve(result);
            });
        });
    }
    
    static encrypt(data){
        const cipher = crypto.createCipher(cryptoCfg.algorithm, cryptoCfg.secret);
        let encrypted = cipher.update(data, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    }

    static decrypt(data){
        const decipher = crypto.createDecipher(cryptoCfg.algorithm, cryptoCfg.secret);
        let decrypted = decipher.update(data, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}

module.exports = Encryption;
var coolsmsConfig = require('../config.json').coolsms;
var randomstring = require('randomstring');
var request = require("request");
var crypto = require('crypto');


function coolMessage(phone, body, template_code){

  var api_key =  coolsmsConfig.key;
  var api_secret = coolsmsConfig.secret;
  var timestamp = parseInt(new Date().getTime()/1000);
  var salt = randomstring.generate(30);
  var signature = crypto.createHmac('md5', api_secret).update(timestamp + salt).digest('hex');

  request.post(
  'https://api.coolsms.co.kr/sms/2/send',
  {
    form: {
      api_key: api_key,
      timestamp: timestamp,
      salt: salt,
      signature: signature,
      to : phone,
      from : coolsmsConfig.from,
      type : 'ATA',
      text : body,
      sender_key : coolsmsConfig.sender_key,
      template_code	: template_code
    }
  },
  function(err, response, body) {
    if (err){
      console.log(err);
    }
    else {
      console.log(body);
    }
  }
  );
}

module.exports = {
  coolMessage: coolMessage
};

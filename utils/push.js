var fcmConfig = require('../config.json').fcm;
var FCM = require('fcm-push');
var serverKey = fcmConfig.serverKey;
var fcm = new FCM(serverKey);

function pushMessage(title, body, token){
  var message = {
      to: token, // required fill with device token or topics
      notification: {
          title: title,
          body: body
      }
  };
  fcm.send(message, function(err, response){
      if (err) {
          console.log(err);
      } else {
          console.log(response);
      }
  });
}

module.exports = {
  pushMessage: pushMessage
};

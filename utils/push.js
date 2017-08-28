var fcmConfig = require('../config.json').fcm;
var FCM = require('fcm-push');
var serverKey = fcmConfig.serverKey;
var fcm = new FCM(serverKey);

function pushMessage(title, body, token, category){
  var message = {
      to: token, // required fill with device token or topics
      notification: {
          title: title,
          body: body
      },
      data: {
          category: category
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

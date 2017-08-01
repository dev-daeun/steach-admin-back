module.exports = function(folder){
  var aws = require('aws-sdk');
  var multer = require('multer');
  var multerS3 = require('multer-s3');
  var randomstring = require("randomstring");
  var s3Config = require('../config.json').s3;
  aws.config.update({
      secretAccessKey: s3Config.secretAccessKey,
      accessKeyId: s3Config.accessKeyId,
      region: s3Config.region
  });
  var s3 = new aws.S3();

  var upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'steach',
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        cb(null, folder + '/' + randomstring.generate() + Date.now().toString() + "." + file.originalname.split('.').pop());
      }
    })
  });
  return upload;
};

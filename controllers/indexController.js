const express = require('express');
const router  = express.Router();
const ejs = require('ejs');

const CustomError = require('../libs/customError');


router.get('/', function (req, res, next) {
    return new Promise((resolve, reject) => {
        ejs.renderFile('view/admin/login.ejs', function(err, view){
            if(err) throw err;
            else res.status(200).send(view);
        });
    })
    .catch(err => {
        next(new CustomError(500, err.message || err));
    });
});



module.exports = router;
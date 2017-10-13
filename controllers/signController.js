const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const fs = require('fs');

const passport = require('../libs/passport');
const CustomError = require('../libs/customError');
const SupervisorService = require('../services/supervisorService');
const AuthService = require('../services/authService');

/*로그인 화면 */
router.get('/', function(req, res, next){
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


/* 로그인 */
router.post('/in', function(req, res, next){
    passport.authenticate('local', (err, user, info) => {
        if(err) return next(new CustomError(status || 500, err.message || err));
        if(!user) return next(new CustomError(401, info));
        res.status(200).send(true);
    })(req, res, next);
});



module.exports = router;
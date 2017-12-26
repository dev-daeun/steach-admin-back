const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const fs = require('fs');

const Jwt = require('../utils/jwt');
const passport = require('../libs/passport');
const CustomError = require('../libs/customError');


/* 로그인 */
router.post('/signin', function(req, res, next){
    passport.authenticate('local', { 
        failureFlash: true },(err, user, info) => {
        if(err) return next(new CustomError(500, err.message || err));
        if(!user) return next(new CustomError(401, info));
        req.logIn(user, err => {
            if(err) return next(new CustomError(500, err.message || err));
            Jwt.sign(String(user))
            .then(newToken => {
                res.status(200).cookie('SteachToken', newToken).send(true);
            })
            .catch(signError => {
                return next(new CustomError(500, err.message || err));
            });
        });
    
    })(req, res, next);
});


/*로그인 화면 */
router.get('/signin', function(req, res, next){
    if((req.session && req.session.passport && req.session.passport.user) && req.cookies.SteachToken) {
        return res.status(405).send(`
        <script type="text/javascript">
            alert("이미 로그인 중입니다.");
        </script>`);
    }
    return new Promise((resolve, reject) => {
        req.session.destroy(err => {
            if(err) throw err;
            else {
                ejs.renderFile('view/admin/login.ejs', function(err, view){
                    if(err) throw err;
                    else res.status(200).send(view);
                });
            }
        });
    }).catch(err => {
        next(new CustomError(500, err.message || err));
    });
});


router.use(require('./isAuthenticated'));

router.get('/', function(req, res, next){
   res.redirect('/dashboard'); 
});


/* 로그아웃 */
router.get('/signout', function(req, res, next){
    req.session.destroy(err => {
        if(err) next(new CustomError(500, err.message || err));
        req.user = null;
        res.clearCookie('SteachToken')
           .clearCookie('connect.sid')
           .status(200)
           .redirect('/signin');
    });
   
});


module.exports = router;
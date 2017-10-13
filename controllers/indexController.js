const express = require('express');
const router  = express.Router();

router.get('/', function(req, res, next){
    if(req.session.passport.user) res.redirect('/dashboard');
    else res.redirect('/sign');
});


module.exports = router;
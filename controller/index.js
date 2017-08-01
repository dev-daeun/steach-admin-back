const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const fs = require('fs');
router.get('/waitlist', function(req, res, next){
        fs.readFile('view/admin/index.ejs', 'utf-8', function(err, view){
            if(err) {
                console.log(err);
                res.sendStatus(500);
            }
            else {
                res.status(200).send(ejs.render(view));
            }
        });
});

module.exports = router;
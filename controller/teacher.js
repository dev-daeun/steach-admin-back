const getWaitingTeachers = require('../model/teacher').getWaitingTeachers;
const givePermission = require('../model/teacher').givePermission;
const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const fs = require('fs');


router.get('/waitlist', function(req, res, next){
    getWaitingTeachers()
    .then(function(teachers){
        fs.readFile('view/admin/waitTeacherList.ejs', 'utf-8', function(err, view){
            if(err) {
                console.log(err);
                res.sendStatus(500);
            }
            else {
                res.status(200).send(ejs.render(view,{
                    teacher: teachers
                }));
            }
        });
    })
    .catch(function(err){
        console.log(err);
        res.sendStatus(500);
    });
});

router.post('/waitlist', function(req, res, next){
    givePermission()
    .then(function(permitted){
        if(permitted){

        }
        else{

        }
        //승인되면 문자 발송, 푸시 발송 후 선생님 목록으로 redirect
        //거절 되면 문자/푸시 발송 후 현재 페이지에 remain
    })
    .catch

});
module.exports = router;
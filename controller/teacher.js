const Teacher = require('../model/teacher');
const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const fs = require('fs');
const moment = require('moment');
const Coolsms = require('coolsms-rest-sdk');
const adminName = require('../config.json').admin_name;
const coolsmsConfig = require('../config.json').coolsms;
const pushMessage = require('../utils/push').pushMessage;
const coolsmsClient = new Coolsms({
    key: coolsmsConfig.key,
    secret: coolsmsConfig.secret
});

/* 가입승인된 선생님들 목록 조회 */
router.get('/list', function(req, res, next){
    Teacher.getJoinedTeachers()
    .then(function(teachers){
        fs.readFile('view/admin/teacherList.ejs', 'utf-8', function(err, view){
            if(err){
                console.log(err);
                res.sendStatus(500);
            }
            else {
                teachers.forEach(function(element){
                    switch(element.gender){
                        case 0: element.gender = '남'; break;
                        case 1: element.gender = '여';
                    }
                    element.payday.forEach(function(micro){
                        micro.pay_day = moment(micro.pay_day).format("MM-DD");
                    });
                });
                res.status(200).send(ejs.render(view,{
                    teacher: teachers
                }));
            }
        });
    });
});

/* 승인 대기중인 선생님들 목록 조회*/
router.get('/waitlist', function(req, res, next){
    Teacher.getWaitingTeachers()
    .then(function(teachers){
        fs.readFile('view/admin/waitTeacherList.ejs', 'utf-8', function(err, view){
            if(err) {
                console.log(err);
                res.sendStatus(500);
            }
            else {
                teachers.forEach(function(element){
                    switch(element.gender){
                        case 0: element.gender = '남'; break;
                        case 1: element.gender = '여';
                    }
                });
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

/* 가입승인/거절*/
router.post('/waitlist', function(req, res, next){
    var text;
    if(req.body.permitted){
        Teacher.givePermission(req.body.teacher_id)
        .then(function(){ 
            Teacher.selectPhone(req.body.teacher_id) 
            .then(function(phone){
                text = adminName + '으로부터 가입요청 승인되었습니다.';
                console.log(text);
            // coolsmsClient.sms.send({
            //     to: phone[0].phone,
            //     type: "SMS",
            //     from: coolsmsConfig.from,
            //     text: text
            // }, function(err, result){
            //     if(err) {
            //         console.log(err);
            //         res.sendStatus(500);
            //     }
            // });
            // pushMessage('가입요청 승인여부', text, phone[0].fcm_token); 
                res.status(200).send(true);   
            });
        }).catch(function(err){
            console.log(err);
            res.sendStatus(500);
        });  
    }      
    else{
        Teacher.selectPhone(req.body.teacher_id)
        .then(function(phone){
            return new Promise(function(resolve, reject){
                text = '승인이 거절되어 가입에 실패하였습니다.';
                console.log(text);
                // coolsmsClient.sms.send({
                //     to: phone[0].phone,
                //     type: "SMS",
                //     from: coolsmsConfig.from,
                //     text: text
                // }, function(err, result){
                //     if(err) reject(err);
                //     else resolve();
                // });
                // pushMessage('가입요청 승인여부', text, phone[0].fcm_token); 
                resolve();
            });
        }).then(function(){ 
            Teacher.delete(req.body.teacher_id)
            .then(function(){ 
                res.status(200).send(true); 
            });
        }).catch(function(err){
            console.log(err);
            res.sendStatus(500);
        });
    }
});


module.exports = router;
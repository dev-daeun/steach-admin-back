const Teacher = require('../model/teacher');

const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const moment = require('moment');
const Coolsms = require('coolsms-rest-sdk');

const adminName = require('../config.json').admin_name;
const coolsmsConfig = require('../config.json').coolsms;
const pushMessage = require('../utils/push').pushMessage;
const CustomError = require('../libs/customError');
const coolsmsClient = new Coolsms({
    key: coolsmsConfig.key,
    secret: coolsmsConfig.secret
});

/* 가입승인된 선생님들 목록 조회 */
router.get('/joined', function(req, res, next){
    Teacher.getJoinedTeachers()
    .then(function(teachers){
        teachers.forEach(function(element){
            switch(element.gender){
                case 0: element.gender = '남'; break;
                case 1: element.gender = '여';
            }
            switch(element.univ_status){
                case 1: element.univ_status = '재학'; break;
                case 2: element.univ_status = '휴학'; break;
                case 3: element.univ_status = '수료'; break;
                case 4: element.univ_status = '졸업'; break;
            }
            switch(element.employed){
                case 0: element.employed = '퇴직'; break;
                case 1: element.employed = '재직'; break;
                case 2: element.employed = '만강'; break;
                case 3: element.employed = '대기'; break;
            }
            element.payday.forEach(function(micro){
                micro.pay_day = moment(micro.pay_day).format("MM-DD");
            });
        });
        ejs.renderFile('view/admin/teacherList.ejs', {teacher: teachers}, (err, view) => {
            if(err) throw err;
            else res.status(200).send(view);
        });
    }).catch(err => {
        next(new CustomError(500, err.message || err));
    });
});

/* 승인 대기중인 선생님들 목록 조회*/
router.get('/waiting', function(req, res, next){
    Teacher.getWaitingTeachers()
    .then(function(teachers){
        teachers.forEach(function(element){
            switch(element.gender){
                case 0: element.gender = '남'; break;
                case 1: element.gender = '여';
            }
            switch(element.univ_status){
                case 1: element.univ_status = '재학'; break;
                case 2: element.univ_status = '휴학'; break;
                case 3: element.univ_status = '수료'; break;
                case 4: element.univ_status = '졸업'; break;
            }
            switch(element.employed){
                case 0: element.employed = '퇴직'; break;
                case 1: element.employed = '재직'; break;
                case 2: element.employed = '만강'; break;
                case 3: element.employed = '대기'; break;
            }
        });
        ejs.renderFile('view/admin/waitTeacherList.ejs', {teacher: teachers}, (err, view) => {
            if(err) throw err;
            else res.status(200).send(view);
        });
    })
    .catch(function(err){
        next(new CustomError(500, err.message || err));
    });
});

/* 가입승인/거절*/
router.post('/waiting', function(req, res, next){
    var text;
    if(req.body.permitted){
        Teacher.givePermission(req.body.teacher_id)
        .then(function(){ 
            Teacher.selectPhone(req.body.teacher_id) 
            .then(function(phone){
                text = adminName + '으로부터 가입요청 승인되었습니다.';
                console.log(text);
            coolsmsClient.sms.send({
                to: phone[0].phone,
                type: "SMS",
                from: coolsmsConfig.from,
                text: text
            }, function(err, result){
                if(err) {
                    console.log(err);
                    res.sendStatus(500);
                }
            });
            console.log(phone[0].fcm_token);
            pushMessage('가입요청 승인여부', text, phone[0].fcm_token); 
                res.status(200).send(true);   
            });
        }).catch(function(err){
            next(new CustomError(500, err.message || err));
        });  
    }      
    else{
        Teacher.selectPhone(req.body.teacher_id)
        .then(function(phone){
            return new Promise(function(resolve, reject){
                text = '승인이 거절되어 가입에 실패하였습니다.';
                console.log(text);
                coolsmsClient.sms.send({
                    to: phone[0].phone,
                    type: "SMS",
                    from: coolsmsConfig.from,
                    text: text
                }, function(err, result){
                    if(err) reject(err);
                    else resolve();
                });
                pushMessage('가입요청 승인여부', text, phone[0].fcm_token, "assigned"); 
                resolve();
            });
        }).then(function(){ 
            Teacher.delete(req.body.teacher_id)
            .then(function(){ 
                res.status(200).send(true); 
            });
        }).catch(function(err){
            next(new CustomError(500, err.message || err));
        });
    }
});


module.exports = router;
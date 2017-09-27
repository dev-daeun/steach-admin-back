const Teacher = require('../services/teacherService');

const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const moment = require('moment');
const Coolsms = require('coolsms-rest-sdk');
const cryto = require('crypto');

const setComma = require('../libs/commaConverter').setComma;
const adminName = require('../config.json').admin_name;
const coolsmsConfig = require('../config.json').coolsms;
const pushMessage = require('../utils/push').pushMessage;
const CustomError = require('../libs/customError');
const cryptoConfig = require('../config.json').cryptoConfig;
const coolsmsClient = new Coolsms({
    key: coolsmsConfig.key,
    secret: coolsmsConfig.secret
});

/* 가입승인된 선생님들 목록 조회 */
router.get('/joined', function(req, res, next){
    Teacher.getJoinedTeachers()
    .then(results => {
        for(let teacher of results){
            // if (teacher.dataValues.accountNumber) {
            //     let decipher = crypto.createDecipher(cryptoConfig.algorithm, cryptoConfig.secret);
            //     decipher.update(teacher.dataValues.accountNumber, 'base64', 'utf-8');
            //     teacher.dataValues.accountNumber = cipher.final('utf-8');
            // }
            teacher.totalProfit = 0;
            if(teacher.Assignments.length>0){
                teacher.Assignments.forEach(assign => {
                    assign.dataValues.payDay = moment(assign.dataValues.payDay).format('MM-DD'); //수업료 지급 날짜
                    teacher.totalProfit += assign.dataValues.fee; //영업이익
                });
                teacher.totalProfit = setComma(teacher.totalProfit);
            }

            switch(teacher.dataValues.gender){
                case 0: teacher.dataValues.gender = '남'; break;
                case 1: teacher.dataValues.gender = '여';
            }
            switch(teacher.dataValues.univStatus){
                case 1: teacher.dataValues.univStatus = '재학'; break;
                case 2: teacher.dataValues.univStatus = '휴학'; break;
                case 3: teacher.dataValues.univStatus = '수료'; break;
                case 4: teacher.dataValues.univStatus = '졸업'; break;
            }
            switch(teacher.dataValues.employed){
                case 1: teacher.dataValues.employed = '재직'; break;
                case 2: teacher.dataValues.employed = '만강'; break;
                case 3: teacher.dataValues.employed = '대기'; break;
            }

        }
        ejs.renderFile('view/admin/teacherList.ejs', {teacher: results}, (err, view) => {
            if(err) throw err;
            else res.status(200).send(view);
        });
    }).catch(err => {
        next(new CustomError(500, err.message || err));
    });
});




/* 승인 대기중인 선생님들 목록 조회*/
router.get('/waiting', function(req, res, next){
    Teacher.getUnjoinedTeachers()
    .then(results => {
        results.forEach(teacher => {
            switch(teacher.dataValues.gender){
                case 0: teacher.dataValues.gender = '남'; break;
                case 1: teacher.dataValues.gender = '여';
            }
            switch(teacher.dataValues.univStatus){
                case 1: teacher.dataValues.univStatus = '재학'; break;
                case 2: teacher.dataValues.univStatus = '휴학'; break;
                case 3: teacher.dataValues.univStatus = '수료'; break;
                case 4: teacher.dataValues.univStatus = '졸업'; break;
            }
            switch(teacher.dataValues.employed){
                case 1: teacher.dataValues.employed = '재직'; break;
                case 2: teacher.dataValues.employed = '만강'; break;
                case 3: teacher.dataValues.employed = '대기'; break;
            }
        });
        ejs.renderFile('view/admin/waitTeacherList.ejs', {teacher: results}, (err, view) => {
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
    var teacherId = req.body.teacherId;
    if(!teacherId) next(new CustomError(400, '승인/거절에 필요한 선생님 고유번호가 없습니다.'));
    else{
        Teacher.getTeacherById(teacherId)
        .then( teacher => {
            if(!teacher) next(new CustomError(404, '선생님 정보를 찾을 수 없습니다.'));
            else if(req.body.permitted){
                Teacher.givePermission(teacherId)
                .then(() => {
                    text = adminName + '으로부터 가입요청 승인되었습니다.';
                    console.log(text);
                    console.log(teacher.dataValues.fcm_token);
                    pushMessage('가입요청 승인여부', text, teacher.dataValues.fcm_token);  
                });
            }else{
                Teacher.deleteTeacherById(teacherId)
                .then(() => {
                    text = '승인이 거절되어 가입에 실패하였습니다.';
                    console.log(text);
                    pushMessage('가입요청 승인여부', text, teacher.dataValues.fcm_token, "assigned"); 
                })
            }
            coolsmsClient.sms.send({
                to: teacher.dataValues.phone,
                type: "SMS",
                from: coolsmsConfig.from,
                text: text
            }, function(err, result){
                if(err) throw err;
                else res.status(200).send(true); 
            });
        }).catch(function(err){
            next(new CustomError(500, err.message || err));
        });
    }
});


module.exports = router;
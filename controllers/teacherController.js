const TeacherService = require('../services/teacherService');

const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const moment = require('moment');
const Coolsms = require('coolsms-rest-sdk');

const passport = require('../libs/passport');
const Encryption = require('../libs/encryption');
const adminName = require('../config.json').adminName;
const coolsmsConfig = require('../config.json').coolsms;
const pushMessage = require('../utils/push').pushMessage;
const CustomError = require('../libs/customError');

const coolsmsClient = new Coolsms({
    key: coolsmsConfig.key,
    secret: coolsmsConfig.secret
});



router.use(require('./isAuthenticated'));

/* 가입승인된 선생님들 목록 조회 */
router.get('/joined', function(req, res, next){
    TeacherService.getJoined()
    .then(results => {

        let teacherArray = new Array();
        results.forEach(teacher => {
            /*계좌번호 복호화*/
            if (teacher.dataValues.accountNumber) 
                teacher.dataValues.accountNumber = Encryption.decrypt(teacher.dataValues.accountNumber);    
            
            
            let assignArray = new Array();
            teacher.dataValues.totalProfit = 0;

            if(teacher.Assignments.length>0){
                teacher.Assignments.forEach(assign => {
                    if(assign.dataValues.payDay)
                        assign.dataValues.payDay = moment(assign.dataValues.payDay).format("MM-DD"); //수업료 지급 날짜
                    else assign.dataValues.payDay = '00-00';
                    teacher.dataValues.totalProfit += assign.dataValues.fee; //영업이익
                    assignArray.push(assign.dataValues);
                });
            }
            teacher.dataValues.assignments = assignArray;
            teacherArray.push(teacher.dataValues);
        });
        ejs.renderFile('view/admin/teacherList.ejs', {teacher: teacherArray}, (err, view) => {
            if(err) throw err;
            else res.status(200).send(view);
        });
    }).catch(err => {
        next(new CustomError(500, err.message || err));
    });
});




/* 승인 대기중인 선생님들 목록 조회*/
router.get('/waiting', function(req, res, next){
    TeacherService.getUnjoined()
    .then(results => {
        let teacherArray = new Array();
        results.forEach(teacher => {
            teacherArray.push(teacher.dataValues);
        });
        ejs.renderFile('view/admin/waitTeacherList.ejs', {teacher: teacherArray}, (err, view) => {
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
    var teacherId = req.body.teacherId;
    if(!teacherId) next(new CustomError(400, '승인/거절에 필요한 선생님 고유번호가 없습니다.'));
    else{
        TeacherService.getOneById(teacherId)
        .then( teacher => {
            if(!teacher) next(new CustomError(404, '선생님 정보를 찾을 수 없습니다.'));
            else if(req.body.permitted){
                TeacherService.setJoinedById(teacherId)
                .then(() => {
                    let text = adminName + '으로부터 가입요청 승인되었습니다.';
                    console.log(text);
                    console.log(teacher.dataValues.phone);
                    pushMessage('가입요청 승인여부', text, teacher.dataValues.fcmToken, "assigned");
                    coolsmsClient.sms.send({
                        to: teacher.dataValues.phone,
                        type: "SMS",
                        from: coolsmsConfig.from,
                        text: text
                    }, (err, result) => {
                        if(err) throw err;
                    });  
                });
            }else{
                TeacherService.deleteById(teacherId)
                .then(() => {
                    let text = adminName + '으로부터 승인이 거절되어 가입에 실패하였습니다.';
                    console.log(text);
                    console.log(teacher.dataValues.phone);
                    pushMessage('가입요청 승인여부', text, teacher.dataValues.fcmToken, "assigned"); 
                    coolsmsClient.sms.send({
                        to: teacher.dataValues.phone,
                        type: "SMS",
                        from: coolsmsConfig.from,
                        text: text
                    }, (err, result) => {
                        if(err) throw err;
                    }); 
                });
            }
            res.status(200).send(true); 
        }).catch(function(err){
            next(new CustomError(500, err.message || err));
        });
    }
});


module.exports = router;
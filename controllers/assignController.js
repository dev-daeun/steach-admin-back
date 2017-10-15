
const AssignService = require('../services/assignmentService');

const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const moment = require('moment');
const Coolsms = require('coolsms-rest-sdk');


const coolsmsConfig = require('../config.json').coolsms;
const pushMessage = require('../utils/push').pushMessage;
const CustomError = require('../libs/customError');
const coolsmsClient = new Coolsms({
    key: coolsmsConfig.key,
    secret: coolsmsConfig.secret
});


/* 특정 학생정보 및 붙은 선생님 조회 DONE*/
router.get('/:id', function(req, res, next){
    AssignService.getOneById(req.params.id)//학생 조회
    .then(results => {
        if(results.length==0) return next(new CustomError(404, 'student not found'));
        
        let teachers = new Array();

        switch(results[0].studentGender){
            case 0: results[0].studentGender = '남'; break;
            case 1: results[0].studentGender = '여';
        }
        results[0].firstDate = moment(results[0].firstDate).format("YY.MM.DD");
        let student = {
            name: results[0].studentName,
            gender: results[0].studentGender,
            address1: results[0].address1,
            address2: results[0].address2,
            address3: results[0].address3,
            schoolName: results[0].schoolName,
            grade: results[0].studentGrade,
            subject: results[0].subject,
            classForm: results[0].classForm,
            studentMemo: results[0].studentMemo,
            regularDate: results[0].regularDate,
            firstDate: results[0].firstDate,
            book: results[0].book
        };
        if(results.length>0) {
            results.forEach(element => {
                switch(element.teacherGender){
                    case 0: element.teacherGender = '남'; break;
                    case 1: element.teacherGender = '여';
                }
                switch(element.univStatus){
                    case 1: element.univStatus = '재학';
                    case 2: element.univStatus = '휴학';
                    case 3: element.univStatus = '수료';
                    case 4: element.univStatus = '졸업';
                }
                teachers.push({
                    teacherId: element.teacherId,
                    applyId: element.applyId,
                    gender: element.teacherGender,
                    name: element.teacherName,
                    age: element.age,
                    univ: element.university,
                    grade: element.teacherGrade,
                    status: element.univStatus,
                    phone: element.phone,
                    available: element.available
                });    
            });
        }
        
        ejs.renderFile('view/admin/matching.ejs', {
            assignId: results[0].assignmentId,
            student: student,
            teachers: teachers
        }, (err, view) => {
            if(err) throw err;
            else res.status(200).send(view);
        });
    }).catch((err) => {
        next(new CustomError(500, err.message || err));
    });
});
    

/* 매칭대기중인 학생 전체 조회 DONE */
router.get('/', function(req, res, next){
    AssignService.getAll()
    .then(results => {
        var array = new Array();
        results.forEach( assign => {
            let asn = assign.dataValues;
            let student = assign.dataValues.student.dataValues;
            switch(student.gender){
                case 0: asn.gender = '남'; break;
                case 1: asn.gender = '여';
            }
            asn.firstDate = moment(asn.firstDate).format("YY-MM-DD");
            asn.requested = asn.applys.length; 
            asn.name = student.name;
            asn.address = student.address1 + ' ' + student.address2;
            asn.schoolName = student.schoolName;
            asn.grade = student.grade;
            delete asn.applys;
            delete asn.student;
            array.push(asn);
        });
        ejs.renderFile('view/admin/matchingList.ejs', { assign: array}, (err, view) => {
            if(err) throw err;        
            else res.status(200).send(view);
        });
    })
    .catch(function(err){
        next(new CustomError(500, err.message || err));
    });
});



/* 배정대기중인 선생님에게 학생 매칭하기( assign의 status : 배정하기 -> (선생님으로부터) 승인대기중 DONE*/
router.post('/', function(req, res, next){
    AssignService.match(req.body.applyId, 
                        req.body.assignId, 
                        req.body.teacherName, 
                        req.body.teacherId)
    .then(([student, teacher]) => {
        let text = student.name + '학생의 '+ student.subject +'수업에 최종배정 되었습니다.';
        console.log(text);
        coolsmsClient.sms.send({
            to: teacher.phone,
            type: "SMS",
            from: coolsmsConfig.from,
            text: text
        }, function(err, result){
                if(err) reject(err);
                else resolve();
        });                
        pushMessage('매칭요청 승인여부', text, teacher.fcmToken, "match");
        res.status(200).send(true); 
    })
    .catch(function(err){
        next(new CustomError(500, err.message || err));
    });
});

module.exports = router;
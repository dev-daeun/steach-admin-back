const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const fs = require('fs');
const moment = require('moment');
const Assign = require('../model/assignment');

const Teacher = require('../model/teacher');
const pushMessage = require('../utils/push').pushMessage;
const CustomError = require('../libs/customError');

/* 특정 학생정보 및 붙은 선생님 조회 */
router.get('/:expectation', function(req, res, next){
    var expect_id = req.params.expectation;
    Assign.getOneStudent(expect_id)//학생 조회
    .then(function(student){
        if(student.length==0) next(new CustomError(404, 'student not found'));
        switch(student[0].gender){
            case 0: student[0].gender = '남'; break;
            case 1: student[0].gender = '여';
        }
        student[0].first_date = moment(student[0].first_date).format("YY.MM.DD");
        Assign.getTeachers(expect_id) //학생에 붙은 선생님들 조회
        .then(function(teachers){
            teachers.forEach(function(element){
                switch(element.gender){
                    case 0: element.gender = '남'; break;
                    case 1: element.gender = '여';
                }
                switch(element.status){
                    case 1: element.status = '배정하기'; break;
                    case 2: element.status = '최종선정'; break;
                }
            });
            ejs.renderFile('view/admin/matching.ejs', {
                student: student[0],
                teachers: teachers
            }, function(err, view){
                if(err) throw err;
                else res.status(200).send(view);
            });
        });
    }).catch(function(err){
        next(new CustomError(500, err.message || err));
    });
});
    

/* 매칭대기중인 학생 전체 조회 */
router.get('/', function(req, res, next){
    Assign.getStudents()
    .then(function(result){
        result.forEach(function(element){
            switch(element.gender){
                case 0: element.gender = '남'; break;
                case 1: element.gender = '여';
            }
            element.first_date = moment(element.first_date).format("YY-MM-DD");
        });
        ejs.renderFile('view/admin/matchingList.ejs', { match: result }, function(err, view){
            if(err) throw err;        
            else res.status(200).send(view);
        });
    })
    .catch(function(err){
        next(new CustomError(500, err.message || err));
    });
});



/* 배정대기중인 선생님에게 학생 매칭하기( assign의 status : 배정하기 -> (선생님으로부터) 승인대기중*/
router.post('/', function(req, res, next){
    var t_id = req.body.teacher_id;
    var e_id = req.body.expect_id;
    Assign.match(t_id, e_id)
    .then(function(){ 
        Promise.all([Assign.getOneStudent(e_id), Teacher.selectPhone(t_id)])
        .then(function([student, teacher]){
            var text = student[0].name + '학생의 '+student[0].subject+'수업에 최종배정 되었습니다.';
            console.log(text);
                        // coolsmsClient.sms.send({
                        //     to: teacher[0].phone,
                        //     type: "SMS",
                        //     from: coolsmsConfig.from,
                        //     text: text
                        // }, function(err, result){
                        //         if(err) reject(err);
                        //         else resolve();
                        // });
            pushMessage('매칭요청 승인여부', text, teacher[0].fcm_token, "match");
            res.status(200).send(true); 
        });
    })
    .catch(function(err){
        next(new CustomError(500, err.message || err));
    });
});

module.exports = router;
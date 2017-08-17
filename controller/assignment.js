const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const fs = require('fs');
const moment = require('moment');
const Assign = require('../model/assignment');
const Teacher = require('../model/teacher');

/* 매칭대기중인 학생 조회 */
router.get('/', function(req, res, next){
    if(!req.query.id){ //파라미터 값이 없으면 학생 모두 조회
        Assign.getStudents()
        .then(function(result){
            fs.readFile('view/admin/matchingList.ejs', 'utf-8', function(err, view){
                if(err) {
                    console.log(err);
                    res.sendStatus(500);
                }
                else {
                    result.forEach(function(element){
                        switch(element.gender){
                            case 0: element.gender = '남'; break;
                            case 1: element.gender = '여';
                        }
                        element.first_date = moment(element.first_date).format("YY-MM-DD");
                    });
                    res.status(200).send(ejs.render(view, {
                        match: result
                    }));
                }
            });
        })
        .catch(function(err){
            console.log(err);
            res.sendStatus(500);
        });
    }
    else { //값이 있으면 특정 학생 및 학생에게 붙은 선생님들 조회
        fs.readFile('view/admin/matching.ejs', 'utf-8', function(err, view){
            if(err) {
                console.log(err);
                res.sendStatus(500);
            }
            else {
                Assign.getOneStudent(req.query.id) //학생 조회
                .then(function(student){
                    if(student.length==0){
                        res.sendStatus(404);
                         return;
                    }
                    switch(student[0].gender){
                        case 0: student[0].gender = '남'; break;
                        case 1: student[0].gender = '여';
                    }
                    student[0].first_date = moment(student[0].first_date).format("YY.MM.DD");
                    Assign.getTeachers(req.query.id) //학생에 붙은 선생님들 조회
                    .then(function(teachers){
                        console.log('teacher : ', teachers);
                        teachers.forEach(function(element){
                            switch(element.gender){
                                case 0: element.gender = '남'; break;
                                case 1: element.gender = '여';
                            }
                            switch(element.status){
                                case 1: element.status = '배정하기'; break;
                                case 2: element.status = '승인대기중'; break;
                                case 3: element.status = '최종선정'; break;
                                case 4: element.status = '거절됨';
                            }
                        });
                        res.status(200).send(ejs.render(view, {
                            student: student[0],
                            teachers: teachers
                        }));
                    });
                }).catch(function(err){
                    console.log(err);
                    res.sendStatus(500);
                });
            }
        });
    }

});


/* 배정대기중인 선생님에게 학생 매칭하기( assign의 status : 배정하기 -> (선생님으로부터) 승인대기중*/
router.post('/', function(req, res){
    var t_id = req.body.teacher_id;
    var e_id = req.body.expect_id;
    console.log(t_id, ', ', e_id);
    Assign.update(2, t_id, e_id)
    .then(function(){ 
        Assign.getOneStudent(e_id)
        .then(function(student){
            console.log('student : ', student);
           var text = student[0].name + '학생의 수업 매칭신청이 승인되었습니다.';
           console.log(text);
           Teacher.selectPhone(t_id)
           .then(function(teacher){
               return new Promise(function(resolve, reject){
                    // coolsmsClient.sms.send({
                    //     to: teacher[0].phone,
                    //     type: "SMS",
                    //     from: coolsmsConfig.from,
                    //     text: text
                    // }, function(err, result){
                    //         if(err) reject(err);
                    //         else resolve();
                    // });
                    resolve();
               });
           })
           .then(function(){
                res.status(200).send(true); 
           });
        });
    }).catch(function(err){
        console.log(err);
        res.sendStatus(500);
    });

});

module.exports = router;
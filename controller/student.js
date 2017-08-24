const Student = require('../model/student');
const Teacher = require('../model/teacher');
const Course = require('../model/course');
const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const fs = require('fs');
const moment = require('moment');
const adminName = require('../config.json').admin_name;
const info = require('../libs/info');
router.get('/list', function(req, res, next){
    if(!req.query.id){
        fs.readFile('view/admin/studentList.ejs', 'utf-8', function(err, view){
            if(err){
                console.log(err);
                res.sendStatus(500);
            }
            else{
                Student.getAll()
                .then(function(students){
                    students.forEach(function(element){
                        element.deposit_day = moment(element.first_date).add(28, 'days').format("MM-DD");
                        element.calling_day = moment(element.calling_day).format("YYYY-MM-DD");
                        element.visiting_day = moment(element.visiting_day).format("YYYY-MM-DD");
                        element.first_date = moment(element.first_date).format("YYYY-MM-DD");
                        switch(element.assign_status){
                            case 0: element.assign_status = '실패'; break;
                            case 1: element.assign_status = '배정실패'; break;
                            case 2: element.assign_status = '배정중'; break;
                            case 3: element.assign_status = '대기중'; break;
                            case 4: element.assign_status = '재원중'
                        }
                    });
                    res.status(200).send(ejs.render(view,{
                        student: students
                    }));
                }).catch(function(err){
                    console.log(err);
                    res.sendStatus(500);
                });
                
            }
        });
    }
    else { /* 학생 정보 수정 시 수정 전 보여지는 학생정보 */
        fs.readFile('view/admin/studentEdit.ejs', 'utf-8', function(err, view){
            if(err){
                console.log(err);
                res.sendStatus(500);
            }
            else{
                Student.getOne(req.query.id)
                .then(function(student){
                    Teacher.getOne('student_id', student[0].student_id)
                    .then(function(teacher){
                        if(teacher.length==0) { /* 선생님이 아직 배정된 상태가 아니면 */
                            console.log(student[0]);
                            res.status(200).send(ejs.render(view, {student: student[0]})); //학생 정보만 보냄.
                            return;
                        }
                        else{ //선생님이 배정되었으면 자동으로 수업도 생성
                            var schedule_array = [];
                            teacher[0].gender == 0 ? teacher[0].gender = '남' : teacher[0].gender = '여';
                            Course.getCourse(student[0].student_id, teacher[0].teacher_id)
                            .then(function(course){
                                course[0].next_date = moment(course[0].next_date).format("YY-MM-DD");
                                Promise.all([Course.getLesson('course_id', course[0].id), Course.getSchedule('course_id', course[0].id),  Course.getGrade('course_id',course[0].id)])
                                .then(function([lesson, schedule, grade]){
                                    schedule.forEach(function(element){
                                        switch(element.day){
                                            case 1: element.day = "월"; break;
                                            case 2: element.day = "화"; break;
                                            case 3: element.day = "수"; break;
                                            case 4: element.day = "목"; break;
                                            case 5: element.day = "금"; break;
                                            case 6: element.day = "토"; break;
                                            case 7: element.day = "일"; break;
                                        }
                                        schedule_array.push(element.day + ' ' + element.start_time + ' - ' + element.end_time);
                                    });
                                    // console.log(student[0]);
                                    // console.log(teacher[0]);
                                    // console.log(course[0]);
                                    // console.log(schedule_array);
                                    // console.log(grade);
                                    var first_date = lesson.length>0 ? lesson[0].date : student[0].first_date;
                                    res.status(200).send(ejs.render(view, {
                                        student: student[0],
                                        teacher: teacher[0],
                                        course: course[0],
                                        first_date: moment(first_date).format('YY-MM-DD'),
                                        schedule: schedule_array,
                                        grade: grade,
                                        info: info
                                    }));
                                });
                            });
                        }
                    });
                }).catch(function(err){
                    console.log(err);
                    res.sendStatus(500);
                });
            }
        });
    }

});


router.get('/registration', function(req, res, next){
    fs.readFile('view/admin/studentRegistration.ejs', 'utf-8', function(err, view){
        if(err){
            console.log(err);
            res.sendStatus(500);
        }
        else{
            res.status(200).send(ejs.render(view));
        }
    });
});

router.post('/registration', function(req, res, next){
    var regular_date='';
    for(let i = 0; i<req.body.start_hour.length; i++){
        regular_date += req.body["dayofweek"+i]+' '+ req.body.start_meridiem[i]+' '+req.body.start_hour[i]
        +':'+req.body.start_minute[i]+'~'+req.body.end_meridiem[i]+req.body.end_hour[i]+':'+req.body.end_minute[i]+'\n';
    }
    var expectation = {
        times_week: req.body.start_hour.length,
        consult_status: req.body.consult_status,
        assign_status: req.body.consult_status==3 ? 3 : 0,
        subject: req.body.subject,
        class_form: req.body.class_form,
        teacher_gender: req.body.teacher_gender,
        teacher_fee: req.body.teacher_fee,
        known_path: req.body.known_path,
        etc: req.body.etc,
        teacher_age: req.body.teacher_age,
        book: req.body.book,
        fee: req.body.fee,
        car_provided: req.body.car_provided,
        first_date: req.body.first_date,
        fail_reason: req.body.fail_reason,
        deposit_day: req.body.deposit_day,
        recommended: req.body.recommanded,
        student_memo: req.body.student_memo,
        called_consultant: req.body.called_consultant,
        visited_consultant: req.body.visited_consultant,
        regular_date: regular_date
    };
    var student = {
        name: req.body.name,
        gender: req.body.gender,
        school_name: req.body.school_name,
        school: req.body.school,
        grade: req.body.grade,
        address1: req.body.address1,
        address2: req.body.address2,
        address3: req.body.address3,
        phone: req.body.phone,
        father_phone: req.body.father_phone,
        mother_phone: req.body.mother_phone
    };
    var student_log = {
        program: req.body.program,
        start_term: req.body.start_term,
        end_term: req.body.end_term,
        used_book: req.body.used_book,
        current_score: req.body.current_score,
        pros: req.body.pros,
        cons: req.body.cons
    };

   Student.registerStudent(student, student_log, expectation)
   .then(function(){
      res.status(201).redirect('/student/list');
   })
   .catch(function(err){
       console.log(err);
       res.sendStatus(500);
   });

});


router.post('/edition', function(req, res){

    var expectation = {
        consult_status: req.body.consult_status,
        assign_status: req.body.consult_status,
        subject: req.body.subject,
        class_form: req.body.class_form,
        known_path: req.body.known_path,
        etc: req.body.etc,
        car_provided: req.body.car_provided,
        fail_reason: req.body.fail_reason,
        student_memo: req.body.student_memo,
        called_consultant: req.body.called_consultant,
        visited_consultant: req.body.visited_consultant,
    };
    var student = {
        name: req.body.name,
        gender: req.body.gender,
        school_name: req.body.school_name,
        school: req.body.school,
        grade: req.body.grade,
        address1: req.body.address1,
        address2: req.body.address2,
        address3: req.body.address3,
        phone: req.body.phone,
        father_phone: req.body.father_phone,
        mother_phone: req.body.mother_phone
    };
    var student_log = {
        program: req.body.program,
        start_term: req.body.start_term,
        end_term: req.body.end_term,
        used_book: req.body.used_book,
        current_score: req.body.current_score,
        pros: req.body.pros,
        cons: req.body.cons
    };
    console.log(student_log);
    Student.updateStudent(req.body.edit_id, student, student_log, expectation)
    .then(function(){
       res.status(200).redirect('/student/list?id='+req.body.edit_id);
    })
    .catch(function(err){
        console.log(err);
        res.sendStatus(500);
    });
});
module.exports = router;
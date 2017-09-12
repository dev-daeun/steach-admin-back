const StudentService = require('../service/student');
const StudentModel = require('../model/student');
const Teacher = require('../model/teacher');
const Course = require('../model/course');
const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const fs = require('fs');
const moment = require('moment');

const CustomError = require('../libs/customError');
const adminName = require('../config.json').admin_name;
const info = require('../libs/info');


/* 학생수정 전 이전정보 조회 */
router.get('/:student/:expectation', function(req, res, next){
    StudentService.showStudentInfoBeforeEdit(req.params.student, req.params.expectation)
    .then( result => {
        if(!result.student) next(new CustomError(404, '학생정보를 찾을 수 없습니다.'));
        result.student.start_term = moment(result.student.start_term).format("YYYY-MM-DD");
        result.student.end_term = moment(result.student.end_term).format("YYYY-MM-DD");
        ejs.renderFile('view/admin/studentEdit.ejs', result, function(err, view){
            if(err) throw err;
            else res.status(200).send(view);
        }); 
    }).catch(err => {
        next(new CustomError(500, err.message || err));
    });
});


/* 학생 목록 조회 */
router.get('/joined', function(req, res, next){
    StudentModel.getAll()
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
            ejs.renderFile('view/admin/studentList.ejs', { student: students }, function(err, view){
                if(err) throw err;
                else res.status(200).send(view);
            }); 
    }).catch(function(err){
        next(new CustomError(500, err.message || err));
    });    
});

/* 학생정보수정 */
router.put('/:student/:expectation', function(req, res, next){
    //ORM 적용시 student, expectation id로 조회, 유무 예외처리 필요
    let student = req.body.student;
    let expectation = req.body.expectation;
    let matched = req.body.matched;
    let studentId = req.params.student;
    let expectId = req.params.expectation;
    let teacherId = req.body.teacher_id;
    if(!student.name || !student.school_name) {
        next(new CustomError(400, '학생 이름 및 학생명을 입력하세요.'));
        return;
    }
    StudentService.editStudentInfo(expectation, student, matched, studentId, expectId, teacherId)
    .then(function(){
        res.status(200).send(true);
    })
    .catch(function(err){
        next(new CustomError(500, err.message || err));
    });
});

router.get('/retired', function(req, res, next){
    StudentService.getRetiredStudents()
    .then(students => {
        console.log('students : ',students[0]);
        students[0].forEach(element => {
            element.calling_day = moment(element.calling_day).format('YYYY-MM-DD');
            element.visiting_day = moment(element.visiting_day).format('YYYY-MM-DD');
            element.first_date = moment(element.first_date).format('YYYY-MM-DD');
        });
        ejs.renderFile('view/admin/leaveStudentList.ejs', { student: students[0] }, (err, view) => {
            if(err) throw err;
            else res.status(200).send(ejs.render(view));
        })
    })
    .catch(err => {
        next(new CustomError(500, err.message || err));
    });
});



router.get('/registration', function(req, res, next){
    ejs.renderFile('view/admin/studentRegistration.ejs', function(err, view){
        if(err) next(new CustomError(500, err.message || err));
        else res.status(200).send(ejs.render(view));
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
        assign_status: req.body.consult_status==3 ? 2 : 0,
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
        recommended: req.body.recommended,
        student_memo: req.body.student_memo,
        called_consultant: req.body.called_consultant,
        visited_consultant: req.body.visited_consultant,
        regular_date: regular_date,
        prev_program: req.body.program,
        prev_start_term: req.body.start_term || '2017-01-01',
        prev_end_term: req.body.end_term || '2017-01-01',
        prev_used_book: req.body.used_book,
        prev_score: req.body.current_score,
        prev_pros: req.body.pros,
        prev_cons: req.body.cons
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


   StudentModel.insertStudent(student, expectation)
   .then(function(){
        res.status(201).redirect('/student/joined');
   })
   .catch(function(err){
        next(new CustomError(500, err.message || err));
   });

});


module.exports = router;
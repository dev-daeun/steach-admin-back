const StudentService = require('../services/studentService');
const StudentModel = require('../model/student');
const Teacher = require('../model/teacher');
const Course = require('../model/course');

const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
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
    StudentService.getJoinedStudents()
    .then(results => {
        let total = 0;
        results.forEach( student => {
            student.dataValues.assignment.forEach( assign => {
                total += 1;
                assign.dataValues.depositDay = moment(assign.dataValues.depositDay).format("MM-DD");
                console.log("day : ", assign.dataValues.depositDay);
                assign.dataValues.callingDay = moment(assign.dataValues.callingDay).format("YYYY-MM-DD");
                assign.dataValues.visitingDay = moment(assign.dataValues.visitingDay).format("YYYY-MM-DD");
                assign.dataValues.firstDate = moment(assign.dataValues.firstDate).format("YYYY-MM-DD");
                    switch(assign.dataValues.assignStatus){
                        case 1: assign.dataValues.assignStatus = '배정실패'; break;
                        case 2: assign.dataValues.assignStatus = '배정중'; break;
                        case 3: assign.dataValues.assignStatus = '대기중'; break;
                        case 4: assign.dataValues.assignStatus = '재원중'
                    }
            });       
        });
        ejs.renderFile('view/admin/studentList.ejs', { student: results, total: total }, (err, view) => {
            if(err) throw err;
            else res.status(200).send(view);
        }); 
    }).catch(err => {
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
        next(new CustomError(400, '학생 이름 및 학교명을 입력하세요.'));
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


/* 퇴원학생 조회*/
router.get('/retired', function(req, res, next){
    StudentService.getRetiredStudents()
    .then(results => {
        console.log(results);
        let total = 0;
        results.forEach(student => {
            student.dataValues.assignment.forEach( assign => {
                total += 1;
                assign.dataValues.callingDay = moment(assign.dataValues.callingDay).format('YYYY-MM-DD');
                assign.dataValues.visitingDay = moment(assign.dataValues.visitingDay).format('YYYY-MM-DD');
                assign.dataValues.firstDate = moment(assign.dataValues.firstDate).format('YYYY-MM-DD');
            });
        });
        ejs.renderFile('view/admin/leaveStudentList.ejs', { student: results, total: total }, (err, view) => {
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
    let assignment = req.body.assignment;
    let student = req.body.student;
    if(!student.name || !student.schoolName) {
        next(new CustomError(400, '학생 이름 및 학교명을 입력하세요.'));
        return;
    }
    for(let key in Object.keys(student)) if(student.key==='') student.key = null;
    for(let key in Object.keys(assignment)) if(assignment.key==='') assignment.key = null;
    StudentService.registerStudent(student, assignment)
    .then(() => {
        res.status(201).send(true);
    })
   .catch(function(err){
        next(new CustomError(500, err.message || err));
   });

});


module.exports = router;
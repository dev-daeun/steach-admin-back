const StudentService = require('../services/studentService');

const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const moment = require('moment');

const CustomError = require('../libs/customError');
const adminName = require('../config.json').admin_name;
const info = require('../view/info.json');
const setComma = require('../libs/commaConverter').setComma;

/* 학생수정 전 이전정보 조회 */
router.get('/:studentId/:assignId', function(req, res, next){
    StudentService.getOneById(req.params.studentId, req.params.assignId)
    .then(([student, teacher, course]) => {
        if(!student) return next(new CustomError(404, '학생정보를 찾을 수 없습니다.'));

        let turn = course.length > 0 ? {
            nextCount: course[0].dataValues.turns[0].dataValues.nextCount,
            totalCount: course[0].dataValues.turns[0].dataValues.totalCount,
            nextDate: course[0].dataValues.nextDate
        } : {} ;
        let grade = course.length > 0 ? course[0].dataValues.grades : [] ;
        let schedule = course.length > 0 ? course[0].dataValues.schedules : [] ;
        let assignment = student.dataValues.assignment[0].dataValues;
        let teacherInfo;
        if(teacher) {
            switch(teacher.dataValues.gender){
                case 0: teacher.dataValues.gender = '남'; break;
                case 1: teacher.dataValues.gender = '여';
            }
            switch(teacher.univStatus){
                case 1: teacher.dataValues.univStatus = '재학'; break;
                case 2: teacher.dataValues.univStatus = '휴학'; break;
                case 3: teacher.dataValues.univStatus = '수료'; break;
                case 4: teacher.dataValues.univStatus = '졸업'; break;
            }
            teacherInfo = teacher;
        }
        else teacherInfo = {};
        assignment.callingDay = moment(assignment.callingDay).format("YYYY-MM-DD");
        assignment.visitingDay = moment(assignment.visitingDay).format("YYYY-MM-DD");
        assignment.firstDate = moment(assignment.firstDate).format("YYYY-MM-DD");
        assignment.prevStartTerm = moment(assignment.prevStartTerm).format("YYYY-MM-DD");
        assignment.prevEndTerm = moment(assignment.prevEndTerm).format("YYYY-MM-DD");

        console.log({
            student: student,
            assign: assignment,
            teacher: teacher ? teacher.dataValues : {},
            info: info,
            schedule: schedule,
            grade : grade,
            turn: turn 
        });
        ejs.renderFile('view/admin/studentEdit.ejs', {
            student: student,
            assign: assignment,
            teacher: teacherInfo,
            turn: turn,
            grade: grade,
            schedule: schedule,
            info: info
        }, (err, view) => {
            if(err) throw err;
            else res.status(200).send(view);
        }); 
    }).catch(err => {
        next(new CustomError(500, err.message || err));
    });
});


/* 학생 목록 조회 DONE */
router.get('/joined', function(req, res, next){
    StudentService.getJoined()
    .then(results => {
        let total = 0;
        results.forEach( student => {
            student.dataValues.assignment.forEach( assign => {
                total += 1;
                if(assign.dataValues.depositDay)
                    assign.dataValues.depositDay = moment(assign.dataValues.depositDay).format("YYYY-MM-DD");
                if(assign.dataValues.callingDay)
                    assign.dataValues.callingDay = moment(assign.dataValues.callingDay).format("YYYY-MM-DD");
                if(assign.dataValues.visitingDay)
                    assign.dataValues.visitingDay = moment(assign.dataValues.visitingDay).format("YYYY-MM-DD");
                if(assign.dataValues.firstDate)
                    assign.dataValues.firstDate = moment(assign.dataValues.firstDate).format("YYYY-MM-DD");
                switch(assign.dataValues.assignStatus){
                    case 1: assign.dataValues.assignStatus = '배정실패'; break;
                    case 2: assign.dataValues.assignStatus = '배정중'; break;
                    case 3: assign.dataValues.assignStatus = '대기중'; break;
                    case 4: assign.dataValues.assignStatus = '재원중'
                }
                assign.dataValues.depositFee = setComma(assign.dataValues.depositFee);
                assign.dataValues.fee = setComma(assign.dataValues.fee);    
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
router.put('/:studentId/:assignId', function(req, res, next){
    let student = req.body.student;
    let assignment = req.body.assignment;
    let matched = req.body.matched;
    let studentId = req.params.studentId;
    let assignId = req.params.assignId;
    let teacherId = req.body.teacherId;
    console.log(student);
    console.log(assignment);
    console.log(matched);
    console.log(teacherId);
    if(!student.name || !student.schoolName) {
        next(new CustomError(400, '학생 이름 및 학교명을 입력하세요.'));
        return;
    }
    StudentService.edit(assignment, student, matched, studentId, assignId, teacherId)
    .then(() => {
        res.status(200).send(true);
    })
    .catch((err) => {
        next(new CustomError(500, err.message || err));
    });
});


/* 퇴원학생 조회 DONE */
router.get('/retired', function(req, res, next){
    StudentService.getRetired()
    .then(results => {
        let total = 0;
        results.forEach(student => {
            student.dataValues.assignment.forEach( assign => {
                total += 1;
                if(assign.dataValues.depositDay)
                    assign.dataValues.depositDay = moment(assign.dataValues.depositDay).format("YYYY-MM-DD");
                if(assign.dataValues.callingDay)
                    assign.dataValues.callingDay = moment(assign.dataValues.callingDay).format('YYYY-MM-DD');
                if(assign.dataValues.visitingDay)
                    assign.dataValues.visitingDay = moment(assign.dataValues.visitingDay).format('YYYY-MM-DD');
                if(assign.dataValues.firstDate)
                    assign.dataValues.firstDate = moment(assign.dataValues.firstDate).format('YYYY-MM-DD');
                assign.dataValues.depositFee = setComma(assign.dataValues.depositFee);
                assign.dataValues.fee = setComma(assign.dataValues.fee);
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



/* 학생 등록 DONE */
router.post('/registration', function(req, res, next){
    let assignment = req.body.assignment;
    let student = req.body.student;
    if(!student.name || !student.schoolName) {
        next(new CustomError(400, '학생 이름 및 학교명을 입력하세요.'));
        return;
    }
    // console.log('regularDATe111111111111111111111: ', student.regularDate);
    // for(let key in Object.keys(student)) if(student.key==='') student.key = null;
    // for(let key in Object.keys(assignment)) if(assignment.key==='') assignment.key = null;
    StudentService.register(student, assignment)
    .then(() => {
        res.status(201).send(true);
    })
   .catch(function(err){
        next(new CustomError(500, err.message || err));
   });

});


module.exports = router;
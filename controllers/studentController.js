const StudentService = require('../services/studentService');

const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const moment = require('moment');

const CustomError = require('../libs/customError');




router.use(require('./isAuthenticated'));

/* 학생수정 전 이전정보 조회 */
router.get('/:studentId/:assignId', function(req, res, next){
    StudentService.getOneById(req.params.studentId, req.params.assignId)
    .then(([student, teacher, course]) => {
        if(!student) return next(new CustomError(404, '학생정보를 찾을 수 없습니다.'));

        let turn = course.length > 0 ? {
            nextCount: course[0].dataValues.turns[0].dataValues.nextCount,
            totalCount: course[0].dataValues.turns[0].dataValues.totalCount,
            nextDate: course[0].dataValues.nextDate
        } : {
            nextCount: 0,
            totalCount: 0,
            nextDate: "0000-00-00"
        } ;
        let grade = course.length > 0 ? course[0].dataValues.grades : [] ;
        let schedule = course.length > 0 ? course[0].dataValues.schedules : [] ;
        let assignment = student.dataValues.assignment[0].dataValues;
        let teacherInfo;
        if(teacher) teacherInfo = teacher;
        else teacherInfo = {};
        assignment.callingDay = moment(assignment.callingDay).format("YYYY-MM-DD");
        assignment.visitingDay = moment(assignment.visitingDay).format("YYYY-MM-DD");
        assignment.firstDate = moment(assignment.firstDate).format("YYYY-MM-DD");
        assignment.prevStartTerm = moment(assignment.prevStartTerm).format("YYYY-MM-DD");
        assignment.prevEndTerm = moment(assignment.prevEndTerm).format("YYYY-MM-DD");
        if(grade.length>0){
            grade.forEach(e => {
                let newYear = moment(e.year).format("YYYY");
                e.stringYear = newYear;
            });
        }
        console.log({
            student: student,
            assign: assignment,
            teacher: teacher ? teacher.dataValues : {},
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
            schedule: schedule
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
        let total = 0,
            studentArray = new Array();

        results.forEach( student => {
            let assignArray = new Array();
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
                assignArray.push(assign.dataValues);
            });
            student.dataValues.assignment = assignArray;
            studentArray.push(student.dataValues);       
        });
        ejs.renderFile('view/admin/studentList.ejs', { student: studentArray, total: total }, (err, view) => {
            if(err) throw err;
            else res.status(200).send(view);
        }); 
    }).catch(err => {
        next(new CustomError(500, err.message || err));
    });    
});

/* 학생정보수정 */
router.put('/:studentId/:assignId', function(req, res, next){
    let student = req.body.student,
        assignment = req.body.assignment,
        matchCanceled = req.body.matchCanceled,
        studentId = req.params.studentId,
        assignId = req.params.assignId,
        teacherId = req.body.teacherId;
    if(!student.name || !student.schoolName) {
        next(new CustomError(400, '학생 이름 및 학교명을 입력하세요.'));
        return;
    }
    StudentService.edit(assignment, student, matchCanceled, studentId, assignId, teacherId)
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
        let total = 0,
            studentArray = new Array();
        results.forEach(student => {
            let assignArray = new Array();
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
                assignArray.push(assign);
            });
            student.dataValues.assignment = assignArray;
            studentArray.push(student.dataValues);
        });
        ejs.renderFile('view/admin/leaveStudentList.ejs', { student: studentArray, total: total }, (err, view) => {
            if(err) throw err;
            else res.status(200).send(ejs.render(view));
        });
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
    StudentService.register(student, assignment)
    .then(() => {
        res.status(201).send(true);
    })
   .catch(function(err){
        next(new CustomError(500, err.message || err));
   });

});


module.exports = router;
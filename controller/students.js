const Student = require('../model/student');
const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const fs = require('fs');
const moment = require('moment');
const adminName = require('../config.json').admin_name;

router.get('/list', function(req, res, next){
    fs.readFile('view/admin/studentList.ejs', 'utf-8', function(err, view){
        if(err){
            console.log(err);
            res.sendStatus(500);
        }
        else{
            res.status(200).send(ejs.render(view));
        }
    });
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
    var expectation = req.body.expectation;
    var student = req.body.student;
    var student_log = req.body.student_log;
    console.log(req.body);
   Student.registerStudent(student, student_log, expectation)
   .then(function(){
      res.status(201).send(true);
   })
   .catch(function(err){
       console.log(err);
       res.sendStatus(500);
   });

});
module.exports = router;
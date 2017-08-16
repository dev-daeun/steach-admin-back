const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const fs = require('fs');
const moment = require('moment');
const Match = require('../model/matching');


router.get('/', function(req, res, next){
    if(!req.query.id){
        Match.getAll()
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
    else {
        fs.readFile('view/admin/matching.ejs', 'utf-8', function(err, view){
            if(err) {
                console.log(err);
                res.sendStatus(500);
            }
            else {
                Match.getOneStudent(req.query.id) //학생 조회
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
                    Match.getTeachers(req.query.id) //학생에 붙은 선생님들 조회
                    .then(function(teachers){
                        teachers.forEach(function(element){
                            switch(element.gender){
                                case 0: element.gender = '남'; break;
                                case 1: element.gender = '여';
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
module.exports = router;
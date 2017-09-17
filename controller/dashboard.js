const StudentService = require('../service/student');
const StudentModel = require('../models').Student;
const Teacher = require('../models').Teacher;
const Course = require('../models').Course;
const Dashboard = require('../services/dashboardService');

const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const moment = require('moment');

const CustomError = require('../libs/customError');
const adminName = require('../config.json').admin_name;
const info = require('../libs/info');

router.get('/', function(req, res, next){
    let tempArray = [],
        subjectArray = ["국어", "수학", "영어", "사회", "과학", "기타과목"];
    let statusObj = {
            assigning: 0,
            waiting: 0,
            attending : 0
        },
            assignObj = {
            korean: statusObj,
            math: statusObj,
            english: statusObj,
            society: statusObj,
            science: statusObj,
            etc: statusObj
        };
    for(let i = 0; i<=3; i++){
        tempArray.push(Dashboard.getDailyCallByStatus(i));
        tempArray.push(Dashboard.getMonthlyCallByStatus(i));
    }

    Promise.all(tempArray)
    .then(([dailyRetired, 
            monthlyRetired,
            dailyCancel, 
            monthlyCancel,
            dailyFail,
            monthlyFail,
            dailySuccess,
            monthlySuccess]) => {

                tempArray.length = 0;
                subjectArray.forEach(element => {
                    tempArray.push(Dashboard.getAssignmentBySubject(element));
                });
                //assigning: 배정중, waiting : 대기중, attending : 재원중, 배정완료 = 대기중 + 재원중  
                Promise.all(tempArray)
                .then((assigns) => {

                    assigns.forEach( subject => {
                        subject.rows.forEach(element => {
                            switch(element.assign_status){
                                case 2: assignObj[element.subject].assigning += 1; break;
                                case 3: assignObj[element.subject].waiting += 1; break;
                                case 4: assignObj[element.subject].attending += 1;;
                            }
                        })
                    })
            ejs.renderFile('view/admin/dashboard.ejs', {
                daily: {
                    total: dailyRetired.count + dailyFail.count + dailyCancel.count + dailySuccess.count,
                    retired: dailyRetired.count,
                    cancel: dailyCancel.count,
                    fail: dailyFail.count,
                    success: dailySuccess.count,
                },
                monthly: {
                    total: monthlyRetired.count + monthlyFail.count + monthlyCancel.count + monthlySuccess.count,
                    retired: monthlyRetired.count,
                    cancel: monthlyCancel.count,
                    fail: monthlyFail.count,
                    success: monthlySuccess.count
                },
                assign: assignObj
            }, (err, view) => {
                if(err) throw err;
                else res.status(200).send(view);
            }); 
        });

    })
    .catch(next);

});

module.exports = router;
const StudentService = require('../service/student');
const StudentModel = require('../models').Student;
const Teacher = require('../models').Teacher;
const Course = require('../models').Course;
const Dashboard = require('../services/dashboardService');

const express = require('express');
const router  = express.Router();
const ejs = require('ejs');
const moment = require('moment');

const studentCounter = require('../libs/studentCounter');
const CustomError = require('../libs/customError');
const adminName = require('../config.json').admin_name;
const info = require('../libs/info');
const setComma = require('../libs/commaConverter').setComma;



router.get('/', function(req, res, next){
    let callArray = [],
        assignStatusArray = [],
        subjectArray = ['국어', '수학', '영어', '사회', '과학', '기타과목'];
    let assignObj = {} //과목별 재원생 수 나타낼 객체

    
    for(let i = 0; i<=3; i++){
        callArray.push(Dashboard.getDailyCallByStatus(i));
        callArray.push(Dashboard.getMonthlyCallByStatus(i));
    } //전화상담상태에 따른 전화 수 
    for(let subject of subjectArray) 
        assignStatusArray.push(Dashboard.getAssignmentBySubject(subject)); //과목 별 학생 수
    


    Promise.all(callArray.concat(assignStatusArray).concat([Dashboard.getExpectedProfit(), Dashboard.getPaidProfit()]))
    .then(([dailyRetired, 
            monthlyRetired,
            dailyCancel, 
            monthlyCancel,
            dailyFail,
            monthlyFail,
            dailySuccess,
            monthlySuccess,
            korean, math, english, society, science, etc,
            expectedProfit, paidProfit]) => {
            //assigning: 배정중, 
            //waiting : 대기중, 
            //attending : 재원중, 
            //배정완료 = 대기중 + 재원중  

            assignObj.korean = studentCounter(korean.rows); //배정상태에 따라서 학생 수 카운트
            assignObj.math = studentCounter(math.rows);
            assignObj.english = studentCounter(english.rows);
            assignObj.society = studentCounter(society.rows);
            assignObj.science = studentCounter(science.rows);
            assignObj.etc = studentCounter(etc.rows);

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
              assign: assignObj,
              profit: {
                  expected: expectedProfit[0] ? setComma(expectedProfit[0] - expectedProfit[1]) : 0,
                  paid: paidProfit[0] ? setComma(paidProfit[0] - paidProfit[1]) : 0,
                  total: setComma((expectedProfit[0] - expectedProfit[1]) + (paidProfit[0] - paidProfit[1]))
              }
            }, (err, view) => {
              if(err) throw err;
              else res.status(200).send(view);
            }); 
   })
    .catch(next);
});

module.exports = router;
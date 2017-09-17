const Assignment = require('../models').Assignment;
const sequelize = require('sequelize');
const moment = require('moment');


class DashboardService{

    //당일 전화상담 통화 수
    static getDailyCallByStatus(status){
        return Assignment.findAndCountAll({
            where: [ 
                sequelize.where(sequelize.literal('CAST(DATE_ADD(calling_day, interval 9 hour) as DATE)'),
                                '=',
                                moment(new Date()).format('YYYY-MM-DD')),
                {
                    called_consultant: {
                        $not: null
                    }
                },
                {
                    consult_status: status
                }
            ]
        });
    }


    //이번달 전화상담 통화 수
    static getMonthlyCallByStatus(status){
        return Assignment.findAndCountAll({
            where: [
                sequelize.where(
                    sequelize.literal('EXTRACT(YEAR from DATE_ADD(calling_day, interval 9 hour))'), 
                    '=', 
                    new Date().getFullYear()
                ),
                sequelize.where(
                    sequelize.literal('EXTRACT(MONTH from DATE_ADD(calling_day, interval 9 hour))'),
                    '=',
                    parseInt(new Date().getMonth())+1
                ),
                {
                    called_consultant: {
                        $not: null
                    }
                }, 
                {
                    consult_status: status
                }
            ]
        });
    }

    //과목별로 배정/배정완료/대기 중인 학생 get
    static getAssignmentBySubject(subject){
        let subjectArray = ["국어", "수학", "영어", "사회", "과학"];
        if(subjectArray.includes(subject)){
            return Assignment.findAndCountAll({
                where: {
                    subject: subject
                }            
            });
        }
        else{
            return Assignment.findAndCountAll({
                where: {
                    subject: {
                        $notIn: subjectArray
                    }
                }
            });
        }

    }
}

module.exports = DashboardService;
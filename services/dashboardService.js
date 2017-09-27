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
                },
                {
                    deleted_at: null
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
                },
                {
                    deleted_at: null
                }
            ]
        });
    }

    //과목별로 배정/배정완료/대기 중인 학생 get
    static getAssignmentBySubject(subject){
        let subjectArray = ["국어", "수학", "영어", "사회", "과학"];
        if(subjectArray.includes(subject)){
            return Assignment.findAndCountAll({
                where: [
                    {
                        subject: subject
                    },
                    {
                        deleted_at: null
                    }
                ]      
            });
        }
        else{
            return Assignment.findAndCountAll({
                where: [
                    {
                        subject: {
                            $notIn: subjectArray
                        }
                    },
                    {
                        deleted_at: null
                    }
                ]
            });
        }

    }

    //대기매출 
    static getExpectedProfit(){
        // return Assignment.findAndCountAll({
        //     attributes: [
        //        sequelize.literal('sum(fee - teacher_fee) as total')
        //     ],
        //     where: [
        //         {
        //             assign_status: {
        //                 $in: [2, 3]
        //             }
        //         },
        //         {
        //             deleted_at: null
        //         }
        //     ]
        // });

        return Promise.all([
            Assignment.sum('fee', {
                where: [
                    {
                        assign_status: {
                            $in: [2, 3]
                        }
                    },
                    {
                        deleted_at: null
                    }
                ] 
            }),
            Assignment.sum('teacher_fee', {
                where: [
                    {
                        assign_status: {
                            $in: [2, 3]
                        }
                    },
                    {
                        deleted_at: null
                    }
                ] 
            })
        ]);
    }

    static getPaidProfit(){
        return Promise.all([
            Assignment.sum('deposit_fee', {
                where: [
                    {
                        assign_status: {
                            $in: [2, 3]
                        }
                    },
                    {
                        deleted_at: null
                    }
                ] 
            }),
            Assignment.sum('teacher_fee', {
                where: [
                    {
                        assign_status: {
                            $in: [2, 3]
                        }
                    },
                    {
                        deleted_at: null
                    }
                ] 
            })
        ]);
    }

    static getTeachersBySubject(subject){
     //employed in [1,2,3]
     //join status 1
     //group by subject
     //select count(teacher_id) from apply group by 
    }
}

module.exports = DashboardService;
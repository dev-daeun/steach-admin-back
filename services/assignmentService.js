const Model = require('../models');
const sequelize = require('sequelize'); 
const Op = sequelize.Op;
const moment = require('moment');

class AssignService{

    static getAll(){
        return Model.Assignment.findAll({
            attributes:[
                'id',
                'subject',
                'classForm',
                'studentMemo',
                'regularDate',
                'firstDate',
                'book'
            ],
            include: [{
                model: Model.Student,
                as: 'student',
                required: true,
                where: {
                    id: Model.Assignment.student_id,
                    id: {
                        $not: null
                    }
                }
            },{
                model: Model.Apply,
                as: 'applys',
                required: false,
                where: {
                    status: 1,
                    assignment_id: Model.Assignment.id,
                    assignment_id: {
                        $not: null
                    },
                    deletedAt: {
                        [Op.eq]: null
                    }
                }
            }],
            where: {
                assignStatus: 2
            },
            order: [
                ['id', 'desc']
            ]
        });
    }

    static getOneById(assignId){
        let sql = `SELECT * 
        FROM   (SELECT apply.id            AS applyId, 
                       apply.assignment_id AS assignmentId, 
                       teacher.NAME        AS teacherName, 
                       teacher.id          AS teacherId,
                       teacher.gender      AS teacherGender, 
                       teacher.age, 
                       teacher.university, 
                       teacher.grade       AS teacherGrade, 
                       teacher.univ_status AS univStatus, 
                       teacher.phone, 
                       teacher.available 
                FROM   apply 
                       INNER JOIN teacher 
                              ON teacher.id = apply.teacher_id 
                                 AND apply.status = 1
                                 AND apply.deleted_at IS NULL
                                ) AS TCR 
               RIGHT JOIN (SELECT student.NAME            AS studentName, 
                                  student.gender          AS studentGender, 
                                  student.address1, 
                                  student.address2, 
                                  student.address3, 
                                  student.school_name     AS schoolName, 
                                  student.grade           AS studentGrade, 
                                  assignment.id           AS assignmentId, 
                                  assignment.subject, 
                                  assignment.class_form   AS classForm, 
                                  assignment.student_memo AS studentMemo, 
                                  assignment.first_date   AS firstDate, 
                                  assignment.book 
                           FROM   student 
                                  INNER JOIN assignment 
                                          ON student.id = assignment.student_id 
                                             AND assignment.id = :assignId) AS STD 
                       ON STD.assignmentid = TCR.assignmentid  `;
        return Model.sequelize.query(sql, {
            replacements: {
              assignId: assignId
            },
            type: Model.sequelize.QueryTypes.SELECT
          });
    }
    //매칭 전 특정 학생정보 조회
    /* 선생님 배정 */


    static match(applyId, assignId, teacherName, teacherId){
        var studentInfo = new Object();
        return Model.sequelize.transaction(t => {
            return Model.Apply.update( //
                {
                    status: 2
                },{
                    where: {
                        id: applyId
                    }
                },{
                    transaction: t
            }).then((results) => {
                return Model.Assignment.update( //assignment에 배정된 선생님 정보 및 상태 업뎃
                    {
                        assignStatus: 3,
                        teacherId: teacherId,
                        teacherName: teacherName
                    },{
                        where: {
                            id: assignId
                        }
                    },{
                        transaction: t
                }).then(() => {
                    return Model.Assignment.findOne({ //course 및 turn 테이블에 들어갈 것들
                        attributes: ['studentId', 'studentName', 'subject', 'firstDate'],
                        where: {
                            id: assignId
                        }
                    },{
                        transaction: t
                    }).then(assignment => {
                        studentInfo.name = assignment.dataValues.studentName;
                        studentInfo.subject = assignment.dataValues.subject;
                        return Model.Course.create({
                            assignmentId: assignId,
                            studentId: assignment.dataValues.studentId,
                            teacherId: teacherId,
                            nextDate: assignment.dataValues.firstDate,
                            subject: assignment.dataValues.subject
                        }, {
                            transaction: t
                        }).then(result => {
                            return Model.Turn.create({
                                courseId: result.dataValues.id
                            }, {
                                transaction: t
                            }).then(() => {
                                return Model.Apply.destroy({ //배정된 선생님을 제외한 apply는 삭제
                                    where: {
                                        teacherId: {
                                            $not: teacherId
                                        }
                                    }
                                }).then(() => {
                                    return Model.Teacher.findOne({ //푸시 및 문자 보낼 선생님 핸드폰 정보
                                        attributes: ['phone', 'fcmToken'],
                                        where: {
                                            id: teacherId
                                        }
                                    }, {
                                        transaction: t
                                    }).then((teacher) => {
                                            return Promise.resolve([studentInfo, {
                                                phone: teacher.dataValues.phone, 
                                                fcmToken: teacher.dataValues.fcmToken
                                            }]);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }

}

module.exports = AssignService;//매칭 대기중인 학생 정보 및 각 학생에게 신청된 선생님 수 조회

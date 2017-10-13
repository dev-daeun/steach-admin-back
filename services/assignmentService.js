const Models = require('../models');
const Assign = require('../models').Assignment;
const Apply = require('../models').Apply;
const Student = require('../models').Student;
const Teacher = require('../models').Teacher;
const sequelize = require('sequelize'); 
const moment = require('moment');

class AssignService{

    static getAll(){
        return Assign.findAll({
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
                model: Student,
                as: 'student',
                required: true,
                where: {
                    id: Assign.student_id,
                    id: {
                        $not: null
                    }
                }
            },{
                model: Apply,
                as: 'applys',
                required: false,
                where: {
                    status: 1,
                    assignment_id: Assign.id,
                    assignment_id: {
                        $not: null
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

    static getOne(assignId){
        let sql = `SELECT * 
        FROM   (SELECT apply.id            AS applyId, 
                       apply.assignment_id AS assignmentId, 
                       teacher.NAME        AS teacherName, 
                       teacher.gender      AS teacherGender, 
                       teacher.age, 
                       teacher.university, 
                       teacher.grade       AS teacherGrade, 
                       teacher.univ_status AS univStatus, 
                       teacher.phone, 
                       teacher.available 
                FROM   apply 
                       LEFT JOIN teacher 
                              ON teacher.id = apply.teacher_id 
                                 AND apply.status = 1) AS TCR 
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
        return Models.sequelize.query(sql, {
            replacements: {
              assignId: assignId
            },
            type: Models.sequelize.QueryTypes.SELECT
          });
    }
    //매칭 전 특정 학생정보 조회

    
}

module.exports = AssignService;//매칭 대기중인 학생 정보 및 각 학생에게 신청된 선생님 수 조회

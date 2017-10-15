const Model = require('../models');
const sequelize = require('../models/index').sequelize;


const moment = require('moment');

class StudentService{

    
    static register(student, assignment){
        return Model.sequelize.transaction(t => {
            return Model.Student.create(
                student, {
                transaction: t
            })
            .then(newStudent => {
                assignment.studentId = newStudent.dataValues.id;
                return Model.Assignment.create(
                    assignment, {
                    transaction: t
                });
            });
        });
    }

    //학생정보 수정 할 때 이전 정보 조회
    static getOneById(studentId, assignId){
        return Promise.all([
            Model.Student.findOne({ //학생, 희망정보 
                include: [{
                    model: Model.Assignment,
                    as: 'assignment',
                    required: true,
                    where: {
                        student_id: Model.Student.id,
                        student_id: {
                            $not: null
                        },
                        id: assignId
                    }
                }],
                where: {
                    id: studentId
                }
            }),
            Model.Teacher.findOne({ //학생한테 배정된 선생님 정보
                include: [{
                    model: Model.Apply,
                    required: true,
                    where: {
                        studentId: studentId,
                        assignmentId: assignId,
                        status: 2,
                        deletedAt: null
                    }
                }],
            }),
            Model.Course.findAll({ //학생과 선생이 진행중인 수업
                include: [{
                    model: Model.Turn,
                    as: 'turns',
                    required: true,
                    where: {
                        courseCount: Model.Course.courseCount,
                        courseCount: {
                            $not: null
                        },
                        courseId: Model.Course.id,
                        courseId: {
                            $not: null
                        },
                        deletedAt: null
                        
                    },
                },{
                    model: Model.Grade, //학생이 수강하는 수업 성적?
                    as: 'grades',
                    required: false,
                    where: {
                        courseId: Model.Course.id,
                        courseId: {
                            $not: null
                        },
                        deletedAt: null
                    }
                },{
                    model: Model.Schedule, //스케줄
                    as: 'schedules',
                    required: false,
                    where: {
                        courseId: Model.Course.id,
                        courseId: {
                            $not: null
                        },
                        deletedAt: null
                    }
                }],
                where: {
                    assignmentId: assignId,
                    studentId: studentId
                }
            })
        ], ([student, teacher, course]) => {
            return Promise.resolve([
                student, 
                teacher, 
                course
            ]);
        });
    }
    
   
    
    

    // //학생 정보 수정(기본정보, 과외정보, 매칭된 선생님 배정취소)
    static editStudentInfo(expectation, student, matched, s_id, e_id, t_id){
        return new Promise((resolve, reject) => {
            Mysql.getTransConn()
            .then(connection => {
                return Student.updateById(connection, student, s_id)
            })
            .then(connection => {
                return Expect.updateById(connection, expectation, e_id)
            })
            .then(connection => {
                if(matched){
                    Mysql.commitTransConn(connection)
                    .then(() => { resolve(); });
                }
                else { //배정된 선생님이 배정취소되면
                    Assign.deleteByStudentTeacherExpectId(connection, s_id, t_id, e_id) //assignment에서 사라짐
                    .then(connection => {
                        return Expect.updateById(connection, {assign_status: 2}, e_id) //해당 괴외정보의 상태는 선생님 배정대기중으로 변경
                    })
                    .then(connection => {
                            //  return Course.deleteByStudentTeacherExpectId(connection, s_id, t_id, e_id) //수업정보도 삭제  
                        return Mysql.commitTransConn(connection)
                    
                    })
                    .then(() => { resolve(); });
                }
            })
            .catch(([err, connection]) => {
                if(connection) {
                    Mysql.rollbackTransConn(connection)
                    .then(() => { reject(err); });
                }
                else reject(err);
            });
        }); 
    }



    static getJoined(){
        return Model.Student.findAll({   
            include: [{
                model: Model.Assignment,
                as: 'assignment',
                required: true,
                where: { 
                    assignStatus: {
                        $not: 0
                    },
                    student_id: Model.Student.id,
                    student_id: {
                        $not: null
                    }
                },
                order: [
                    ['assignment', 'updated_at', 'desc']  
                ]
            }]
        });
    }


    static getRetired(){
        return Model.Student.findAll({
            include: [{
                model: Model.Assignment,
                as: 'assignment',
                required: true,
                where: {
                    assignStatus: 0,
                    student_id: Model.Student.id,
                    student_id: {
                        $not: null
                    }
                },
                order: [
                    ['assignment', 'id', 'desc']
                ]
            }],
            order: [
                ['id', 'desc']
            ]
        });
     
    }
}

module.exports = StudentService;
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
                    studentId: studentId,
                    deletedAt: null
                }
            })
        ], ([student, teacher, course]) => {
                return Promise.resolve([student, teacher, course]);
        });
    }
    

    // //학생 정보 수정(기본정보, 과외정보, 매칭된 선생님 배정취소)
    static edit(assignment, student, matched, studentId, assignId, teacherId){
        return Model.sequelize.transaction(t => {
            return Model.Student.update(student, {
                where: {
                    id: studentId
                    }
                }, {
                    transaction: t
            }).then(() => {
                    return Model.Assignment.update(assignment, {
                        where: {
                            id: assignId
                        }
                        }, {
                            transaction: t
                    }).then(() => {
                        if(matched==="배정취소") 
                            return Model.Apply.destroy({
                                where: {
                                    studentId: studentId,
                                    assignmentId: assignId,
                                    teacherId: teacherId,
                                    status: 2
                                }
                            }, {
                                transaction: t
                            }).then(()=> {
                                return Model.Assignment.update({
                                    teacherName: null,
                                    teacherId: null
                                },{
                                    where: {
                                        id: assignId
                                    }
                                },{
                                    transaction: t
                                });
                            });
                        else return Promise.resolve();
                    });
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
            }],
           
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
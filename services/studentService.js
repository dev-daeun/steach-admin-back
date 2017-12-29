const Model = require('../models');
const sequelize = require('../models/index').sequelize;
const Op = sequelize.Op;

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
            Model.Course.findAll({ 
                /* 학생과 선생이 진행중인 수업
                    현재 진행중인 수업의 총 회차 = turn.totalCount 
                    현재 진행중인 수업의 앞으로 다가올 회차 = turn.nextCount
                    현재 진행중인 수업의 앞으로 다가올 회차의 수업날짜 = course.nextDate */
                include: [{
                    model: Model.Turn,
                    as: 'turns',
                    required: false,
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
                    model: Model.Schedule, //스케줄 (수업시간 = schedule.day, startTime, endTime)
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
            }),
            Model.Grade.findAll({
                where: {
                    studentId: {
                        [Op.eq]: studentId
                    },
                    assignmentId: {
                        [Op.eq]: assignId
                    }
                }
            })
        ], ([student, teacher, course]) => {
                return Promise.resolve([student, teacher, course, grade]);
        });
    }
    

    // //학생 정보 수정(기본정보, 과외정보, 매칭된 선생님 배정취소)
    static edit(assignment, student, matchCanceled, studentId, assignId, teacherId){
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
                        if(matchCanceled) { //선생님 배정취소 있으면
                            return Model.Apply.destroy({
                                where: {
                                    studentId: studentId,
                                    assignmentId: assignId,
                                    teacherId: teacherId,
                                    status: 2
                                }
                            },
                            {
                                transaction: t
                            }).then(()=> { //assignment에 선생님 정보 null로 변경
                                return Model.Assignment.update({
                                    teacherName: null,
                                    teacherId: null,
                                    assignStatus: 2
                                },{
                                    where: {
                                        id: assignId
                                    }
                                },{
                                    transaction: t
                                });
                            }).then(()=>{ // 진행중이던 수업 course 조회
                                return Model.Course.findOne({
                                    attribute: ['id'],
                                    where: {
                                        studentId: {
                                            [Op.eq]: studentId
                                        },
                                        teacherId: {
                                            [Op.eq]: teacherId
                                        },
                                        assignmentId: {
                                            [Op.eq]: assignId
                                        }
                                    }
                                });
                            },{
                                transaction: t
                            }).then((course)=> { //수업 정보도 모두 삭제
                                let courseId = course.dataValues.id;
                                Promise.all([
                                    Model.Course.destroy({
                                        where: {
                                            id: {
                                                [Op.eq]: courseId
                                            }
                                        }  
                                    },{
                                        transaction: t
                                    }),
                                    Model.Turn.destroy({
                                        where: {
                                            courseId: {
                                                [Op.eq]: courseId
                                            }
                                        }
                                    },{
                                        transaction: t
                                    }),
                                    Model.Lesson.destroy({
                                        where: {
                                            courseId: {
                                                [Op.eq]: courseId
                                            }
                                        }
                                    },{
                                        transaction: t
                                    }),
                                    Model.Schedule.destroy({
                                        where: {
                                            courseId: {
                                                [Op.eq]: courseId
                                            }
                                        }
                                    },{
                                        transaction: t
                                    })
                                ]).then(()=>{
                                    Promise.resolve();
                                });
                            });
                        }
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
                    consultStatus: {
                        $not: 0
                    },
                    student_id: Model.Student.id,
                    student_id: {
                        $not: null
                    }
                },
                order: [
                    ['assignment', 'updatedAt', 'desc']
                ]
            }],
           order: [
               [ 'id' ]
           ]
        });
    }


    static getRetired(){
        return Model.Student.findAll({
            include: [{
                model: Model.Assignment,
                as: 'assignment',
                required: true,
                where: {
                    consultStatus: 0,
                    student_id: Model.Student.id,
                    student_id: {
                        $not: null
                    }
                },
                order: [
                    ['assignment', 'updatedAt', 'desc']
                ]
            }]
        });
     
    }
}

module.exports = StudentService;
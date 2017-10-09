const Student = require('../model/student');
const Teacher = require('../model/teacher');
const Expect = require('../model/expectation');
const Course = require('../model/course');
const Assign = require('../model/assignment');
const Mysql = require('../utils/mysql');
const express = require('express');
const router  = express.Router();
// const bookshelf = require('../utils/bookshelf').bookshelf;
// const knex = bookshelf.knex;
const ejs = require('ejs');
const fs = require('fs');
const moment = require('moment');
const adminName = require('../config.json').admin_name;
const info = require('../libs/info');

class StudentClass{

    //학생정보 수정 할 때 이전 정보 조회
    static showStudentInfoBeforeEdit(s_id, e_id){
        return new Promise((resolve, reject) => {
            Mysql.getConn()
            .then(connection => {
                return Student.selectById(connection, s_id)
            })
            .then(([student, connection]) => {
                Teacher.selectByStudent(connection, s_id, e_id)
                .then(([teacher, conenction]) => {
                    if(teacher.length===0) { //배정된 선생님이 없으면
                        Mysql.releaseConn(connection)
                        .then(() => {
                            resolve({
                                student: student[0],
                                teacher: {},
                                course: {
                                    next_count: 0,
                                    next_date: '00-00-00',
                                    total_count: 0,
                                    first_date: ''
                                },
                                schedule: [],
                                grade: [],
                                info: info       
                            });
                        });
                    }
                    else{
                        Course.selectByStudentTeacherId(connection, s_id, e_id, teacher[0].teacher_id) //선생님이 있으면 학생이 듣는 수업 select
                        .then(([course, connection]) => {
                                 //select된 수업 id로 schdule, grade select
                        Promise.all([
                            Mysql.getConn()
                            .then(connection => {
                                return Course.getScheduleByCourseId(connection, course[0].id);
                            })
                            .then(([schedules, connection]) => {
                                return Mysql.releaseConn(connection, schedules);
                            }),
                            Mysql.getConn()
                            .then(connection => {
                                return Course.getGradeByCourseId(connection, course[0].id); 
                            })
                            .then(([grades, connection]) => {
                                return Mysql.releaseConn(connection, grades);
                            }),
                        ]).then(([schedules, grades]) => {
                                course[0].next_date = moment(course[0].next_date).format('YYYY-MM-DD');
                                resolve({
                                    student: student[0],
                                    teacher: teacher[0],
                                    course: course[0],
                                    schedule: schedules,
                                    grade: grades,
                                    info: info       
                                });
                            });
                        });
                    }
                });
            })
            .catch(([err, connection])=> {
                if(connection){
                    Mysql.releaseConn(connection)
                    .then(() => {
                        reject(err);
                    });
                }
                else reject(err);
            });
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


    static getRetiredStudents(){
        //
        return knex.raw(`
        SELECT ATD.attendance, INF.* 
        FROM   ((SELECT attendance, 
                        course_id 
                 FROM   lesson) AS ATD 
                RIGHT JOIN (SELECT TC.teacher_name, 
                                   TC.course_id, 
                                   STU.* 
                            FROM   (SELECT c.student_id, 
                                           c.id   AS course_id, 
                                           t.NAME AS teacher_name 
                                    FROM   teacher t, 
                                           course c 
                                    WHERE  c.teacher_id = t.id) AS TC 
                                    RIGHT JOIN (SELECT s.id AS student_id, 
                                                       e.id AS expect_id, 
                                                       assign_status, 
                                                       fail_reason, 
                                                       subject, 
                                                       school_name, 
                                                       grade, 
                                                       concat(address1, ' ', address2) AS address, 
                                                       NAME AS student_name, 
                                                       called_consultant, 
                                                       visited_consultant, 
                                                       class_form, 
                                                       fee, 
                                                       deposit_day,
                                                       deposit_fee,
                                                       calling_day, 
                                                       visiting_day, 
                                                       first_date 
                                    FROM   student s, expectation e 
                                    WHERE  s.id = e.student_id 
                                           AND e.assign_status = 0) AS STU 
                                    ON STU.student_id = TC.student_id) AS INF 
                  ON ATD.course_id = INF.course_id )`);
    }
}



module.exports = StudentClass;
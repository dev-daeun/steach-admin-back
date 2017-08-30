const pool = require('../utils/mysql').getPool();

class Assign{}

//매칭 대기중인 학생 정보 및 각 학생에게 신청된 선생님 수 조회
Assign.getStudents = function(){
    return new Promise(function(resolve, reject){
        return new Promise(function(resolve, reject){
            pool.getConnection(function(err, connection){
                if(err) reject(err);
                else resolve(connection);
            });
        }).then(function(connection){
            return new Promise(function(resolve, reject){
               connection.query(
                `select * from 
                (select s.id as s_id, e.id as e_id, s.name, s.gender, s.school_name, s.grade, concat(s.address1, ' ', s.address2) as address, e.subject, e.class_form, e.student_memo, e.first_date, e.regular_date, e.book
                from student s, expectation e
                where s.id = e.student_id and e.assign_status = 2) as STU
                left join
                (select count(teacher_id) as requested, expectation_id from assignment where status = 1 group by expectation_id) as AST
                on STU.e_id = AST.expectation_id`,
                 function(err, result){
                     connection.release();
                     if(err) reject(err);
                     else resolve(result);
                 }); 
            });
        }).then(function(result){
            resolve(result);
        }).catch(function(err){
            reject(err);
        });
    });
};

//매칭 전 특정 학생정보 조회
Assign.getOneStudent = function(id){
    return new Promise(function(resolve, reject){
        return new Promise(function(resolve, reject){
            pool.getConnection(function(err, connection){
                if(err) reject(err);
                else resolve(connection);
            });
        }).then(function(connection){
            return new Promise(function(resolve, reject){
               connection.query(
                `select s.id as s_id, e.id as e_id, s.name, s.gender, s.address1, s.address2, s.address3, s.school_name, s.grade, e.subject, e.class_form, e.student_memo, e.first_date, e.regular_date, e.book
                from student s, expectation e
                where s.id = e.student_id and e.id = ?`, id, 
                 function(err, result){
                     connection.release();
                     if(err) reject(err);
                     else resolve(result);
                 }); 
            });
        }).then(function(result){
            resolve(result);
        }).catch(function(err){
            reject(err);
        });
    });
};

//매칭 신청한 선생님들 조회
Assign.getTeachers = function(id){
    return new Promise(function(resolve, reject){
        return new Promise(function(resolve, reject){
            pool.getConnection(function(err, connection){
                if(err) reject(err);
                else resolve(connection);
            });
        }).then(function(connection){
            return new Promise(function(resolve, reject){
               connection.query(
                `select teacher.id, name, gender, age, university, grade, univ_status, phone, available, status 
                from teacher, assignment 
                where assignment.teacher_id = teacher.id and assignment.expectation_id = ? `, id, 
                 function(err, result){
                     connection.release();
                     if(err) reject(err);
                     else resolve(result);
                 }); 
            });
        }).then(function(result){
            resolve(result);
        }).catch(function(err){
            reject(err);
        });
    });
};


/* 선생님 배정 취소 */
Assign.unmatch = function(t_id, e_id){
    return new Promise(function(resolve, reject){ 
        return new Promise(function(resolve, reject){
            pool.getConnection(function(err, connection){
                if(err) reject(err);
                else resolve(connection);
            });
        }).then(function(connection){
            return new Promise(function(resolve, reject){
                connection.beginTransaction(function(err){
                    if(err) {
                        connection.release();
                        reject(err);
                    }
                    else resolve(connection);
                });
            });
        }).then(function(connection){
            return new Promise(function(resolve, reject){
                    /* assignment 상태를 배정대기중으로 수정 */
                connection.query(`update assignment set status = 1 where teacher_id = ? and expectation_id = ?`,[t_id, e_id], function(err){
                    if(err) reject([err,connection]);
                    else resolve(connection);
                }); 
            });
        }).then(function(connection){
            return new Promise(function(resolve, reject){
                /* 매칭대기정보 상태를 배정중(배정을 기다리는 상태)으로 수정 */
                connection.query('update expectation set assign_status = 2 where id = ?', e_id, function(err){
                    if(err) reject([err,connection]);
                    else resolve(connection);
                });
            });
        }).then(function([result, connection]){
            return new Promise(function(resolve, reject){
                /* 수업 삭제 */
                connection.query('delete from course where expectation_id = ? and teacher_id = ?', [e_id, t_id], function(err){
                    if(err) reject([err, connection]);
                    else resolve(connection);
                });
            });
        }).then(function(connection){
            connection.commit(function(err){
                if(err) {
                    connection.rollback(function(){ connection.release(); });
                    reject(err);
                }
                else {
                    connection.release();
                    resolve();
                }
            });
        }).catch(function([err,connection]){
                if(connection) connection.rollback(function(){ connection.release(); });
                reject(err);
        });
    });
}


/* 선생님 배정 */
Assign.match = function(t_id, e_id){
    return new Promise(function(resolve, reject){ 
        return new Promise(function(resolve, reject){
            pool.getConnection(function(err, connection){
                if(err) reject(err);
                else resolve(connection);
            });
        }).then(function(connection){
            return new Promise(function(resolve, reject){
                connection.beginTransaction(function(err){
                    if(err) {
                        connection.release();
                        reject(err);
                    }
                    else resolve(connection);
                });
            });
        }).then(function(connection){
            return new Promise(function(resolve, reject){
                    /* assignment 상태를 배정완료로 수정 */
                connection.query(`update assignment set status = 2 where teacher_id = ? and expectation_id = ?`,[t_id, e_id], function(err){
                    if(err) reject([err,connection]);
                    else resolve(connection);
                }); 
            });
        }).then(function(connection){
            return new Promise(function(resolve, reject){
                /* 매칭대기정보 상태를 대기중(선생님은 배정되었지만 첫 수업은 시작하지 않은 상태)으로 수정 */
                connection.query('update expectation set assign_status = 3 where id = ?', e_id, function(err){
                    if(err) reject([err,connection]);
                    else resolve(connection);
                });
            });
        }).then(function(connection){ /* course 테이블에 들어갈 수업정보 */
            return new Promise(function(resolve, reject){
                connection.query('select student_id, first_date, subject from expectation where id = ?', e_id, function(err, result){
                    if(err) reject([err, connection]);
                    else resolve([result[0], connection]);
                });
            });
        }).then(function([result, connection]){
            return new Promise(function(resolve, reject){
                var record = {
                    expectation_id: e_id,
                    student_id: result.student_id,
                    teacher_id: t_id,
                    next_date: result.first_date,
                    subject: result.subject
                }; /* 수업 생성 */
                connection.query('insert into course set ?', record, function(err, result){
                    if(err) reject([err, connection]);
                    else resolve([result.insertId, connection]);
                });
            }); 
        }).then(function([course_id, connection]){
            return new Promise(function(resolve, reject){
                /* 만들어진 수업의 turn 생성 */
                connection.query('insert into turn set ?', {course_id: course_id}, function(err){
                    if(err) reject([err, connection]);
                    else resolve(connection);
                });
            });
        }).then(function(connection){
            connection.commit(function(err){
                if(err) {
                    connection.rollback(function(){ connection.release(); });
                    reject(err);
                }
                else {
                    connection.release();
                    resolve();
                }
            });
        }).catch(function([err,connection]){
                if(connection) connection.rollback(function(){ connection.release(); });
                reject(err);
        });
    });
}

module.exports = Assign;
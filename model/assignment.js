const pool = require('../utils/mysql').getPool();

class Assign{}


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
                connection.query('delete from apply where assignment_id = ? and teacher_id = ?', [e_id, t_id], function(err){
                    if(err) reject([err, connection]);
                    else resolve(connection);
                })
        }).then(function(connection){
            return new Promise(function(resolve, reject){
                /* 수업 삭제 */
                connection.query('delete from course where assignment_id = ? and teacher_id = ?', [e_id, t_id], function(err){
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
        }).catch(function([err, connection]){
                if(connection) connection.rollback(function(){ connection.release(); });
                reject(err);
        });
    });
}


Assign.deleteByStudentTeacherExpectId = function(connection, s_id, t_id, e_id){
    return new Promise((resolve, reject) => {
        console.log("S : ", s_id);
        console.log("T : ", t_id);
        console.log("E : ", e_id);
        connection.query('delete from apply where student_id = ? and teacher_id = ? and assignment_id = ?',
        [s_id, t_id, e_id], (err) => {
            if(err) reject([err, connection]);
            else resolve(connection);
        });
    });
};

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
                connection.query(`update apply set status = 2 where teacher_id = ? and assignment_id = ?`,[t_id, e_id], function(err){
                    if(err) reject([err,connection]);
                    else resolve(connection);
                }); 
            });
        }).then(function(connection){
            return new Promise(function(resolve, reject){
                /* 매칭대기정보 상태를 대기중(선생님은 배정되었지만 첫 수업은 시작하지 않은 상태)으로 수정 */
                connection.query('update assignment set assign_status = 3 where id = ?', e_id, function(err){
                    if(err) reject([err,connection]);
                    else resolve(connection);
                });
            });
        }).then(function(connection){ /* course 테이블에 들어갈 수업정보 */
            return new Promise(function(resolve, reject){
                connection.query('select student_id, first_date, subject from assignment where id = ?', e_id, function(err, result){
                    if(err) reject([err, connection]);
                    else resolve([result[0], connection]);
                });
            });
        }).then(function([result, connection]){
            return new Promise(function(resolve, reject){
                var record = {
                    assignment_id: e_id,
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
            console.log('match done');
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
const pool = require('../utils/mysql').getPool();
const async = require('async');

class Teacher{}
Teacher.getWaitingTeachers = function(){
    return new Promise(function(resolve, reject){
        async.waterfall([
            function(callback){
                pool.getConnection(function(err, connection){
                    if(err) callback(err);
                    else callback(null, connection);
                });
            },
            function(connection, callback){
                connection.query(`select id, employed, address1, age, name, gender, university, grade, univ_status 
                                  from teacher where join_status = 0 order by id`, 
                    function(err, teachers){
                        if(err) callback(err);
                        else callback(null, [teachers, connection]);
                    });
            } 
        ], function(err, [teachers, connection]){
                connection.release();
                if(err) reject(err);
                else resolve(teachers);
        });
    });
};

/* 가입된 선생님 목록 조회 */
Teacher.getJoinedTeachers = function(){
    return new Promise(function(resolve, reject){
        async.waterfall([
            function(callback){
                pool.getConnection(function(err, connection){
                    if(err) callback(err);
                    else callback(null, connection);
                });
            },
            function(connection, callback){
                connection.query(`select id as t_id , employed, address1, age, name, gender, university, grade, 
                (select sum(fee) from expectation, assignment where expectation.id = assignment.expectation_id and assignment.teacher_id = t_id) as profit, 
                univ_status, account_number from teacher where join_status = 1 order by id desc`, function(err, teachers){
                    if(err) callback(err);
                    else callback(null, teachers, connection);
                });
            },
            function(teachers, connection, callback){
                async.each(teachers, function(element, done){
                    connection.query(`select pay_day, subject, name from expectation as e, assignment as a, student as s 
                    where e.id = a.expectation_id and a.student_id = s.id and a.teacher_id = ? and a.status = 5`, element.t_id, function(err, result){
                        if(err) done(err);
                        else {
                            element.payday = result;
                            done();
                        }
                    });
                }, function(err){
                    if(err) callback(err);
                    else callback(null, teachers, connection);
                });
            }
        ], 
        function(err, teachers, connection){
            connection.release();
            if(err) reject(err);
            else resolve(teachers);
        });
    });
}

Teacher.delete = function(teacher_id){
    return new Promise(function(resolve, reject){
        pool.getConnection(function(err ,connection){
            if(err) reject(err);
            else resolve(connection);
        });
    }).then(function(connection){
        return new Promise(function(resolve, reject){
            connection.query('delete from teacher where id = ?', teacher_id, function(err){
                connection.release();
                if(err) reject(err);
                else resolve();
            });
        });
    }).then(function(){
        resolve();
    }).catch(function(err){
        reject(err);
    });
};

/* 회원가입 요청한 선생님 가입 승인/거절 */
Teacher.givePermission = function(teacher_id){
    return new Promise(function(resolve, reject){
            async.waterfall([
                function(callback){
                    pool.getConnection(function(err, connection){
                        if(err) callback(err);
                        else callback(null, connection);
                    });
                },
                function(connection, callback){
                    connection.query('update teacher set join_status = 1 where id = ?', teacher_id, function(err, result){
                        if(err) callback(err);
                        else callback(null, connection);
                    });
                }
            ], function(err, connection){
                connection.release();
                if(err) reject(err);
                else resolve();
            });
    });
};

Teacher.selectPhone = function(teacher_id){
    return new Promise(function(resolve, reject){
        async.waterfall([
            function(callback){
                pool.getConnection(function(err, connection){
                    if(err) callback(err);
                    else callback(null, connection);
                });
            },
            function(connection, callback){
                connection.query('select phone, fcm_token from teacher where id = ?', teacher_id, function(err, result){
                    if(err) callback(err);
                    else callback(null, [result, connection]);
                });
            }
        ], function(err, [result, connection]){
            connection.release();
            if(err) reject(err);
            else resolve(result);
        }); 
    });
};

Teacher.getOne = function(field, data){
    return new Promise(function(resolve, reject){
        return new Promise(function(resolve, reject){
            pool.getConnection(function(err ,connection){
                if(err) reject(err);
                else resolve(connection);
            });
        }).then(function(connection){ 
            return new Promise(function(resolve, reject){
                connection.query(`select t.id as teacher_id, name, age, gender, university, grade, univ_status, concat(address1, ' ', address2) address from teacher t, assignment a where a.teacher_id = t.id and a.status = 2 and ?? = ?`, [field, data], function(err, result){
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
}                

module.exports = Teacher;
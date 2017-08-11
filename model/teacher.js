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
                    where e.id = a.expectation_id and a.student_id = s.id and a.teacher_id = ?`, element.t_id, function(err, result){
                        if(err) done(err);
                        else {
                            element.payday = result;
                            done();
                        }
                    });
                }, function(err){
                    if(err) callback(err);
                    else callback(null, [teachers, connection]);
                });
            }
        ], 
        function(err, [teachers, connection]){
            connection.release();
            if(err) reject(err);
            else resolve(teachers);
        });
    });
}


/* 회원가입 요청한 선생님 가입 승인/거절 */
Teacher.givePermission = function(teacher_id, is_permitted){
    return new Promise(function(resolve, reject){
            async.waterfall([
                function(callback){
                    pool.getConnection(function(err, connection){
                        if(err) callback(err);
                        else callback(null, connection);
                    });
                },
                function(connection, callback){
                    connection.query('update teacher set join_status = ? where id = ?', [ is_permitted ? 1 : 2, teacher_id], function(err, result){
                        if(err) callback(err);
                        else callback(null, connection);
                    });
                }
            ], function(err, connection){
                connection.release();
                if(err) reject(err);
                else resolve(true);
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

module.exports = Teacher;
const pool = require('../utils/mysql').getPool();
const async = require('async');
module.exports.getWaitingTeachers = function(){
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
        ], function(err, result){
                result[1].release();
                if(err) reject(err);
                else resolve(result[0]);
        });
    });
};

/* 회원가입 요청한 선생님 가입 승인/거절 */
module.exports.givePermission = function(teacher_id, is_permitted){
    return new Promise(function(resolve, reject){
        if(is_permitted==1){
            aync.waterfall([
                function(callback){
                    pool.getConnection(function(err, connection){
                        if(err) callback(err);
                        else callback(null, connection);
                    });
                },
                function(connection, callback){
                    connection.query('update teacher set join_status = 1 where id = ?', [teacher_id], function(err){
                        if(err) callback(err);
                        else callback(null, connection);
                    });
                }
            ], function(err, connection){
                connection.release();
                if(err) reject(err);
                else resolve(true);
            });
        }
        else resolve(false);
    });
};
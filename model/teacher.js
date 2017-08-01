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
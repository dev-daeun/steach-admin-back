const pool = require('../utils/mysql').getPool();
class Course{}

Course.getConn = function(){
    return new Promise(function(resolve, reject){
        pool.getConnection(function(err, connection){
            if(err) reject(err);
            else resolve(connection);
        });
    });
};

Course.getCourse = function(s_id, t_id){
    return new Promise(function(resolve, reject){
        Course.getConn()
        .then(function(connection){
            return new Promise(function(resolve, reject){
                connection.query('select id, now_count, next_date, total_count from course where student_id = ? and teacher_id = ?', [s_id, t_id], function(err, result){
                    connection.release();
                    if(err) reject(err);
                    else resolve(result);
                });
            }).then(function(result){
                resolve(result);
            }).catch(function(err){
                reject(err);
            });
        });
    });
}

Course.getSchedule = function(field, data){
    return new Promise(function(resolve, reject){
        Course.getConn()
        .then(function(connection){
            return new Promise(function(resolve, reject){
                connection.query('select course_id, day, start_time, end_time from schedule where ?? = ?', [field, data], function(err, result){
                    connection.release();
                    if(err) reject(err);
                    else resolve(result);
                });
            }).then(function(result){
                resolve(result);
            }).catch(function(err){
                reject(err);
            });
        });
    });
};

Course.getGrade = function(field, data){
    return new Promise(function(resolve, reject){
        Course.getConn()
        .then(function(connection){
            return new Promise(function(resolve, reject){
                connection.query('select test_form1, test_form2, score, rating, year from grade where ?? = ? order by id desc', [field, data], function(err, result){
                    connection.release();
                    if(err) reject(err);
                    else resolve(result);
                });
            }).then(function(result){
                resolve(result);
            }).catch(function(err){
                reject(err);
            });
        });
    });
};

Course.getLesson = function(field, data){
    return new Promise(function(resolve, reject){
        Course.getConn()
        .then(function(connection){
            return new Promise(function(resolve, reject){
                connection.query('select date from lesson where now_count = 1 and course_count = 1 and ?? = ?', [field, data], function(err, result){
                    connection.release();
                    if(err) reject(err);
                    else resolve(result);
                });
            }).then(function(result){
                resolve(result);
            }).catch(function(err){
                reject(err);
            });
        });
    });
}

module.exports = Course;
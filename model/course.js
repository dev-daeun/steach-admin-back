const pool = require('../utils/mysql').getPool();
const moment = require('moment');
class Course{}

Course.getConn = function(){
    return new Promise(function(resolve, reject){
        pool.getConnection(function(err, connection){
            if(err) reject(err);
            else resolve(connection);
        });
    });
};

Course.selectByStudentTeacherId = function(connection, s_id, e_id, t_id){
    return new Promise(function(resolve, reject){
        connection.query(`
        SELECT lsn.first_date, crs.* 
        FROM ( 
                 SELECT   date AS first_date, 
                          course_id 
                 FROM     lesson 
                 WHERE    course_count = 1 
                 ORDER BY date limit 1
             ) AS lsn 
        RIGHT JOIN (      
            SELECT  course.id, 
                    turn.next_count, 
                    course.next_date, 
                    course.subject,
                    turn.total_count                  
            FROM    course, turn 
            WHERE   course.id = turn.course_id 
                    AND student_id = ?
                    AND assignment_id = ?
                    AND teacher_id = ? 
        ) AS crs 
        ON crs.id = lsn.course_id
        `, [s_id, e_id, t_id], function(err, result){
            if(err) reject([err, connection]);
            else resolve([result, connection]);
        });
    });
}

Course.getScheduleByCourseId = function(connection, id){
    return new Promise(function(resolve, reject){
        connection.query('select course_id, day, start_time, end_time from schedule where course_id = ? order by day', [id], function(err, result){
            if(err) reject(err);
            else resolve([result, connection]);
        });       
    });
};

Course.getGradeByCourseId = function(connection, id){
    return new Promise(function(resolve, reject){
        connection.query('select score, rating, year from grade where course_id = ? order by id desc', [id], function(err, result){
            if(err) reject(err);
            else resolve([result, connection]);
        });
    });
};

Course.deleteByStudentTeacherExpectId = function(connection, s_id, t_id, e_id){
    return new Promise((resolve, reject) => {
        connection.query('delete from course where student_id = ? and teacher_id = ? and assignment_id = ?', [s_id, t_id, e_id], (err) => {
            if(err) reject([err, connection]);
            else resolve(connection);
        });
    });
};

module.exports = Course;
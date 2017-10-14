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



module.exports = Assign;
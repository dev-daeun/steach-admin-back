const pool = require('../utils/mysql').getPool();

class Student{}

Student.getConn = function(){
    return new Promise(function(resolve, reject){
        pool.getConnection(function(err, connection){
            if(err) {
                console.log(err);
                reject([err]);
            }
            else resolve(connection); //에러 없으면 커낵션 객체 resolve(다음 then으로 넘어감)
        });
    });
};

Student.beginTrans = function(connection){
    return new Promise(function(resolve, reject){
        connection.beginTransaction(function(err){
            if(err) {
                console.log(err);
                connection.release();
                reject(err);
            }
            else resolve(connection); //에러 없으면 커낵션 객체 resolve(다음 then으로 넘어감)
        });
    });
};



Student.insert = function(connection, table, record){
    return new Promise(function(resolve, reject){
        connection.query('insert into ?? set ? ', [table, record], function(err, result){
            if(err) {
                console.log(err);
                reject(err, connection);
            }
            else {
                
                resolve([connection, result]); //커낵션 객체와 삽입된 결과가 다음 then으로 넘어감
            }
        });
    });
};

Student.registerStudent = function(student, student_log, expectation){
    return new Promise(function(resolve, reject){
        Student.getConn()
        .then(function(connection){
            return new Promise(function(resolve, reject){
                connection.beginTransaction(function(err){
                    if(err) {
                        console.log(err);
                        connection.release();
                        reject([err]);
                    }
                    else resolve(connection); //에러 없으면 커낵션 객체 resolve(다음 then으로 넘어감)
                });
            });
        }).then(function(connection){
            return new Promise(function(resolve, reject){
                console.log('first query');
                connection.query('insert into student set ?', student, function(err, result){
                    if(err) reject([err, connection]);
                    else resolve([connection, result.insertId]);
                });
            });
        }).then(function([connection, id]){
            return new Promise(function(resolve, reject){
                console.log('second query');
                student_log.student_id = id;
                connection.query('insert into student_log set ? ', student_log, function(err){
                    if(err) reject([err, connection]);
                    else resolve([connection, id]);
                });
            });
        }).then(function([connection, id]){
            return new Promise(function(resolve, reject){
                expectation.student_id = id;
                connection.query('insert into expectation set ? ', expectation, function(err){
                     console.log('third query');
                    if(err) reject([err, connection]);
                    else  {
                        connection.commit(function(err){
                            if(err){
                                connection.rollback(function(){
                                    connection.release();
                                });
                            }
                            else {
                                connection.release();
                                resolve();
                            }
                        });
                    }
                });
            });
        })
        .then(function(){ resolve(); })
        .catch(function([err,connection]){
            if(connection){
                connection.rollback(function(){
                    connection.release();
                    reject(err);
                });
            }
            else reject(err);
        });
    });
};


module.exports = Student;
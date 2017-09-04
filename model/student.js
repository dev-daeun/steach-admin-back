const pool = require('../utils/mysql').getPool();

class Student{}

Student.getConn = function(){
    return new Promise(function(resolve, reject){
        pool.getConnection(function(err, connection){
            if(err) reject(err);
            else resolve(connection); //에러 없으면 커낵션 객체 resolve(다음 then으로 넘어감)
        });
    });
};

Student.getAll = function(){
    return new Promise(function(resolve, reject){
        Student.getConn()
        .then(function(connection){ 
            return new Promise(function(resolve, reject){
                let query = `
                SELECT STU.*, TEA.t_name 
                FROM   (SELECT e.id                                AS e_id, 
                               e.assign_status, 
                               e.deposit_fee, 
                               e.subject, 
                               s.id                                AS s_id, 
                               s.school_name, 
                               s.grade, 
                               Concat(s.address1, ' ', s.address2) AS address, 
                               s.NAME                              AS s_name, 
                               s.mother_phone, 
                               s.father_phone, 
                               e.class_form, 
                               e.fee, 
                               e.deposit_day, 
                               e.called_consultant, 
                               e.visited_consultant, 
                               e.calling_day, 
                               e.visiting_day, 
                               e.first_date 
                        FROM   student s, 
                               expectation e 
                        WHERE  s.id = e.student_id 
                        ORDER  BY s.id DESC) AS STU 
                       LEFT OUTER JOIN (SELECT t.NAME           AS t_name, 
                                               a.expectation_id AS e_id 
                                        FROM   assignment a, 
                                               teacher t 
                                        WHERE  a.teacher_id = t.id and a.status = 2) AS TEA 
                                    ON STU.e_id = TEA.e_id 
                ORDER  BY STU.e_id DESC 
                `;
                connection.query(query, function(err, result){
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

Student.selectById = function(connection, id){
    return new Promise(function(resolve, reject){
        connection.query(
        `SELECT prev_start_term AS start_term, 
                prev_end_term   AS end_term, 
                prev_program    AS program, 
                prev_used_book  AS used_book, 
                prev_score      AS current_score, 
                prev_pros       AS pros, 
                prev_cons       AS cons, 
                called_consultant,
                visited_consultant,
                etc,
                known_path,
                car_provided,
                student_memo,
                subject,
                fail_reason,
                name, 
                gender, 
                school_name, 
                father_phone, 
                mother_phone, 
                grade, 
                address1, 
                address2, 
                address3, 
                phone, 
                school, 
                s.id            AS s_id, 
                e.id            AS e_id
        FROM   student s, expectation e 
        WHERE  s.id = e.student_id 
                AND s.id = ? `, [id], (err, result) => {
            if(err) reject([err, connection]);
            else resolve([result, connection]);
        });
    });
};

Student.registerStudent = function(student, expectation){
    return new Promise(function(resolve, reject){
        Student.getConn()
        .then(function(connection){
            return new Promise(function(resolve, reject){
                connection.beginTransaction(function(err){
                    if(err) {
                        connection.release();
                        reject(err);
                    }
                    else resolve(connection); //에러 없으면 커낵션 객체 resolve(다음 then으로 넘어감)
                });
            });
        }).then(function(connection){
            return new Promise(function(resolve, reject){
                connection.query('insert into student set ?', student, function(err, result){
                    if(err) reject([err, connection]);
                    else resolve([connection, result.insertId]);
                });
            });
        }).then(function([connection, id]){
            return new Promise(function(resolve, reject){
                expectation.student_id = id;
                connection.query('insert into expectation set ? ', expectation, function(err){
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





Student.updateById = function(connection, record, id){
    return new Promise(function(resolve, reject){
        console.log('record : ', record);
        connection.query('update student set ? where id = ?', [record, id], (err) => {
            if(err) reject([err, connection]);
            else resolve(connection);
        });
    });
};

module.exports = Student;
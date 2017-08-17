const pool = require('../utils/mysql').getPool();

class Assign{}

//매칭 대기중인 학생 정보 및 각 학생에게 신청된 선생님 수 조회
Assign.getStudents = function(){
    return new Promise(function(resolve, reject){
        return new Promise(function(resolve, reject){
            pool.getConnection(function(err, connection){
                if(err) reject(err);
                else resolve(connection);
            });
        }).then(function(connection){
            return new Promise(function(resolve, reject){
               connection.query(
                `select * from 
                (select s.id as s_id, e.id as e_id, s.name, s.gender, s.school_name, s.grade, concat(s.address1, ' ', s.address2) as address, e.subject, e.class_form, e.student_memo, e.first_date, e.regular_date, e.book
                from student s, expectation e
                where s.id = e.student_id and (e.assign_status = 2 or e.assign_status = 3 )) as STU
                join
                (select count(teacher_id) as requested, expectation_id from assignment where status = 1 group by expectation_id) as AST
                where STU.e_id = AST.expectation_id`,
                 function(err, result){
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

//매칭 전 특정 학생정보 조회
Assign.getOneStudent = function(id){
    return new Promise(function(resolve, reject){
        return new Promise(function(resolve, reject){
            pool.getConnection(function(err, connection){
                if(err) reject(err);
                else resolve(connection);
            });
        }).then(function(connection){
            return new Promise(function(resolve, reject){
               connection.query(
                `select s.id as s_id, e.id as e_id, s.name, s.gender, s.address1, s.address2, s.address3, s.school_name, s.grade, e.subject, e.class_form, e.student_memo, e.first_date, e.regular_date, e.book
                from student s, expectation e
                where s.id = e.student_id and e.id = ?`, id, 
                 function(err, result){
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

//매칭 신청한 선생님들 조회
Assign.getTeachers = function(id){
    return new Promise(function(resolve, reject){
        return new Promise(function(resolve, reject){
            pool.getConnection(function(err, connection){
                if(err) reject(err);
                else resolve(connection);
            });
        }).then(function(connection){
            return new Promise(function(resolve, reject){
               connection.query(
                `select teacher.id, name, gender, age, university, grade, univ_status, phone, available, status 
                from teacher, assignment 
                where assignment.teacher_id = teacher.id and assignment.expectation_id = ? `, id, 
                 function(err, result){
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


/* 주어진 상태에 따라 배정상태(승인대기중, 최종선정, 거절됨) 변경*/
Assign.update = function(status, t_id, e_id){
    return new Promise(function(resolve, reject){ 
        return new Promise(function(resolve, reject){
            pool.getConnection(function(err, connection){
                if(err) reject(err);
                else resolve(connection);
            });
        }).then(function(connection){
            return new Promise(function(resolve, reject){
               connection.query(`update assignment set status = ? where teacher_id = ? and expectation_id = ?`,[status, t_id, e_id],
                 function(err){
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
    });
}

module.exports = Assign;
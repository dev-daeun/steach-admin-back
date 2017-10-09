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



Student.selectById = function(connection, s_id, e_id){
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
        FROM   student s, assignment e 
        WHERE  s.id = e.student_id 
                AND s.id = ? and e.id = ?`, [s_id, e_id], (err, result) => {
            if(err) reject([err, connection]);
            else resolve([result, connection]);
        });
    });
};





Student.updateById = function(connection, record, id){
    return new Promise(function(resolve, reject){
        connection.query('update student set ? where id = ?', [record, id], (err) => {
            if(err) reject([err, connection]);
            else resolve(connection);
        });
    });
};

module.exports = Student;
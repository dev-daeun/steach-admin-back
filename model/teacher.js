const pool = require('../utils/mysql').getPool();
const async = require('async');

class Teacher{}


Teacher.selectByStudent = function(connection, s_id, e_id){
    return new Promise((resolve, reject) => {
        connection.query(
        `select t.id as teacher_id, name, age, gender, university, grade, univ_status, concat(address1, ' ', address2) address 
        from teacher t, apply a
        where a.teacher_id = t.id and a.status = 2 and student_id = ? and assignment_id = ?`, [s_id, e_id], (err, result) => {
            if(err) reject([err, connection]);
            else resolve([result, connection]);
        });
    });
};                

module.exports = Teacher;
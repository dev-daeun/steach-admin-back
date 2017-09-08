const bookshelf = require('../utils/bookshelf').bookshelf;
const knex = bookshelf.knex;
const Assignment = require('./AssignmentModel');
const Expectation = require('./ExpectationModel');
const Course = require('./CourseModel');

const Student = bookshelf.Model.extend({
        tableName: 'student',
        constructor: function(){
            bookshelf.Model.apply(this, arguments);
        },
        expectation: function(){
            return this.hasMany(Expectation);
        },
        assignment: function(){
            return this.hasMany(Assignment);
        },
        course: function(){
            return this.hasMany(Course);
        },
    },
    {  
        selectRetired: function(){
            return knex.raw(`
                SELECT ATD.attendance, INF.* 
                FROM   ((SELECT attendance, 
                                course_id 
                         FROM   lesson) AS ATD 
                        RIGHT JOIN (SELECT TC.teacher_name, 
                                           TC.course_id, 
                                           STU.* 
                                    FROM   (SELECT c.student_id, 
                                                   c.id   AS course_id, 
                                                   t.NAME AS teacher_name 
                                            FROM   teacher t, 
                                                   course c 
                                            WHERE  c.teacher_id = t.id) AS TC 
                                            RIGHT JOIN (SELECT s.id AS student_id, 
                                                               e.id AS expect_id, 
                                                               assign_status, 
                                                               fail_reason, 
                                                               subject, 
                                                               school_name, 
                                                               grade, 
                                                               concat(address1, ' ', address2) AS address, 
                                                               NAME AS student_name, 
                                                               called_consultant, 
                                                               visited_consultant, 
                                                               class_form, 
                                                               fee, 
                                                               calling_day, 
                                                               visiting_day, 
                                                               first_date 
                                            FROM   student s, expectation e 
                                            WHERE  s.id = e.student_id 
                                                   AND e.assign_status = 0) AS STU 
                                            ON STU.student_id = TC.student_id) AS INF 
                          ON ATD.course_id = INF.course_id )`);
        }
    }
);

module.exports = Student;
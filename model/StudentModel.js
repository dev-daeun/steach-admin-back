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
        }
    }
);

module.exports = Student;
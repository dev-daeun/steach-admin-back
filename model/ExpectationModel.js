const bookshelf = require('../utils/bookshelf').bookshelf;
const Student = require('./StudentModel');
const Assignment = require('./AssignmentModel');
const Course = require('./CourseModel');

const Expectation = bookshelf.Model.extend({
    tableName: 'expectation',
    student: function(){
        return this.belongsTo(Student);
    },
    assignment: function(){
        return this.hasMany(Assignment);
    },
    course: function(){
        return this.hasMany(Course);
    }
});

module.exports = Expectation;
const bookshelf = require('../utils/bookshelf').bookshelf;
const Assignment = require('./AssignmentModel');
const Expectation = require('./ExpectationModel');
const Course = require('./CourseModel');
const Talk = require('./TalkModel');

const Teacher = bookshelf.Model.extend({
    tableName: 'teacher',
    expectation: function(){
        return this.hasMany(Expectation);
    },
    assignment: function(){
        return this.hasMany(Assignment);
    },
    course: function(){
        return this.hasMany(Course);
    },
    talk: function(){
        return this.hasMany(Talk);
    }
});

module.exports = Teacher;
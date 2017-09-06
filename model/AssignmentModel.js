const bookshelf = require('../utils/bookshelf').bookshelf;
const Expectation = require('./ExpectationModel');
const Student = require('./StudentModel');
const Teacher = require('./TeacherModel');

const Assignment = bookshelf.Model.extend({
    tableName: 'assignment',
    expectation: function(){
        return this.belongsTo(Expectation);
    },
    student: function(){
        return this.belongsTo(Student);
    },
    teacher: function(){
        return this.belongsTo(Teacher);
    }
});

module.exports = Assignment;
const bookshelf = require('../utils/bookshelf').bookshelf;
const Course = require('./CourseModel');
const Parent = require('./ParentModel');
const Teacher = require('./TeacherModel');
const TalkMessage = require('./TalkMessageModel');
const Talk = bookshelf.Model.extend({
    tableName: 'talk',
    teacher: function(){
        return this.belongsTo(Teacher);
    },
    parent: function(){
        return this.belongsTo(Parent);
    },
    course: function(){
        return this.hasOne(Course);
    }
});

module.exports = Talk;
const bookshelf = require('../utils/bookshelf').bookshelf;
const Expectation = require('./ExpectationModel');
const Student = require('./StudentModel');
const Teacher = require('./TeacherModel');
const Talk = require('./TalkModel');
const TalkMessage = require('./TalkMessageModel');
const Schedule = require('./ScheduleModel');
const Grade = require('./GradeModel');
const Lesson = require('./LessonModel');
const Turn = require('./TurnModel');

const Course = bookshelf.Model.extend({
    tableName: 'course',
    expectation: function(){
        return this.belongsTo(Expectation);
    },
    student: function(){
        return this.belongsTo(Student);
    },
    teacher: function(){
        return this.belongsTo(Teacher);
    },
    talk: function(){
        return this.hasOne(Talk);
    },
    talkMessage: function(){
        return this.hasMany(TalkMessage);
    },
    schedule: function(){
        return this.hasMany(Schedule);
    },
    grade: function(){
        return this.hasMany(Grade);
    },
    lesson: function(){
        return this.hasMany(Lesson);
    },
    turn: function(){
        return this.hasMany(Turn);
    }
});

module.exports = Course;
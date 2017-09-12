const bookshelf = require('../utils/bookshelf').bookshelf;
const Course = require('./CourseModel');
const Homework = require('./HomeworkModel');
const CommentImage = require('./CommentImageModel');

const Lesson = bookshelf.Model.extend({
    tableName: 'lesson',
    course: function(){
        return this.belongsTo(Course);
    },
    homework: function(){
        return this.hasMany(Homework);
    },
    commentImage: function(){
        return this.hasMany(CommentImage);
    }
});

module.exports = Lesson;
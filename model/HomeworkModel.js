const bookshelf = require('../utils/bookshelf').bookshelf;
const Lesson = require('./LessonModel');

const Homework = bookshelf.Model.extend({
    tableName: 'homework',
    course: function(){
        return this.belongsTo(Lesson);
    }
});

module.exports = Homework;
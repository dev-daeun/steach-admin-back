const bookshelf = require('../utils/bookshelf').bookshelf;
const Lesson = require('./LessonModel');

const CommentImage = bookshelf.Model.extend({
    tableName: 'comment_image',
    course: function(){
        return this.belongsTo(Lesson);
    }
});

module.exports = CommentImage;
const bookshelf = require('../utils/bookshelf').bookshelf;
const Course = require('./CourseModel');

const TalkMessage = bookshelf.Model.extend({
    tableName: 'talk_message',
    course: function(){
        return this.belongsTo(Course);
    }
});

module.exports = TalkMessage;
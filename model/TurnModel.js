const bookshelf = require('../utils/bookshelf').bookshelf;
const Course = require('./CourseModel');
const Talk = require('./TalkModel');

const Turn = bookshelf.Model.extend({
    tableName: 'turn',
    course: function(){
        return this.belongsTo(Course);
    }
});

module.exports = Turn;
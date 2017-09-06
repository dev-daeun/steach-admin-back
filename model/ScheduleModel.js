const bookshelf = require('../utils/bookshelf').bookshelf;
const Course = require('./CourseModel');

const Schedule = bookshelf.Model.extend({
    tableName: 'schedule',
    course: function(){
        return this.belongsTo(Course);
    }

});

module.exports = Schedule;
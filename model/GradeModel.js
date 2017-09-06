const bookshelf = require('../utils/bookshelf').bookshelf;
const Course = require('./CourseModel');

const Grade = bookshelf.Model.extend({
    tableName: 'grade',
    course: function(){
        return this.belongsTo(Course);
    }
});

module.exports = Grade;
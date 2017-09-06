const bookshelf = require('../utils/bookshelf').bookshelf;
const Talk = require('./TalkModel');

const Parent = bookshelf.Model.extend({
    tableName: 'parents',
    talk: function(){
        return this.hasMany(Talk);
    }
});

module.exports = Parent;
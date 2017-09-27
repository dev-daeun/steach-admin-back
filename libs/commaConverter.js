    
module.exports.setComma = function(won) {
        won = String(won);
        return won.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
};

module.exports.unsetComma = function(won){
    str = String(won);
    return parseInt(won.replace(/[^\d]+/g, ''));
}



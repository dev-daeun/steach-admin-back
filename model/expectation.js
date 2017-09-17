class Expectation {}


Expectation.updateById = function(connection, record, id){
    return new Promise((resolve, reject) => {
        connection.query('update assignment set ? where id = ?', [record, id], (err) => {
            console.log('expect done');
            if(err) reject([err, connection]);
            else resolve(connection);
        });
    });
};


module.exports = Expectation;
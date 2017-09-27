module.exports = function(array){
    let statusObj = {
        attending: 0,
        waiting: 0,
        assigning: 0
    };

    for(let i in array){
        switch(array[i].assignStatus){
            case 2: statusObj.assigning += 1; break;
            case 3: statusObj.waiting += 1; break;
            case 4: statusObj.attending += 1;
        }
    }
    return statusObj;

}
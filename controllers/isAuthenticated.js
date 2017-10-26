const Jwt = require('../utils/jwt');
const CustomError = require('../libs/customError');


module.exports = function(req, res, next){
    if(!req.cookies.SteachToken) return res.redirect('/signin');
    Jwt.verify(req.cookies.SteachToken)
    .then(decoded => {
        if(parseInt(decoded)!==req.session.passport.user) 
            return next(new CustomError(401, '유효하지 않은 사용자 정보입니다.'));
        next();  
    })
    .catch(err => {
        return next(new CustomError(500, err.message || err));
    });
};
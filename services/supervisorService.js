const Supervisor = require('../models').Supervisor;


class SupervisorService{
    static findByUser(user){
        return Supervisor.findOne({
            raw: true,
            where: {
                user: user
            }
        });
    }
}

module.exports = SupervisorService;
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

    static findById(id){
        return Supervisor.findOne({
            raw: true,
            where: {
                id: id
            }
        });
    }
}

module.exports = SupervisorService;
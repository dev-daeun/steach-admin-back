
const Model = require('../models');
const sequelize = require('../models').sequelize;

class TeacherService {
    /* 가입승인된 선생님 목록 */
    static getJoined(){
        return Model.Teacher.findAll({
            include: [{
                model: Model.Assignment,
                required: false,
                where: { 
                    teacher_id: Teacher.id, 
                    teacher_id: {
                        $not: null
                    }
                }  
            }], 
            where: {
                employed: {
                    $ne: 0
                }
            },
            order: [
                ['id', 'desc']
            ]
        });
    }

    /* 가입 미승인된 선생님 목록 */
    static getUnjoined(){
        return Model.Teacher.findAll({
            attributes: ['id', 
                        'employed', 
                        'address1', 
                        'age', 
                        'name', 
                        'gender', 
                        'university', 
                        'grade',
                        'univStatus'
            ],
            where: {
                employed: 0
            },
            order: [
                ['id', 'desc']
            ]
        });
    }

    static setJoinedById(teacherId){
        return Model.Teacher.update({
            employed: 1
            },{
                where: {
                    id: teacherId
            }
        });
    }

    static getOneById(teacherId){
        return Model.Teacher.findOne({
            where: {
                id: teacherId
            }
        });
    }

    static deleteById(teacherId){
        return Model.Teacher.destroy({
            where: {
                id: teacherId
            }
        });
    }
}







module.exports = TeacherService;
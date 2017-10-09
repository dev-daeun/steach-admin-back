
/* 쿼리빌더 사용 */
const Teacher = require('../models').Teacher;
const Assignment = require('../models').Assignment;
const Apply = require('../models').Apply;
const Student = require('../models').Student;
const sequelize = require('../models').sequelize;

class TeacherService {
    /* 가입승인된 선생님 목록 */
    static getJoinedTeachers(){
        return Teacher.findAll({
            include: [{
                model: Assignment,
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
    static getUnjoinedTeachers(){
        return Teacher.findAll({
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

    static setTeacherJoined(teacherId){
        return Teacher.update({
            employed: 1
            },{
                where: {
                    id: teacherId
            }
        });
    }

    static getTeacherById(teacherId){
        return Teacher.findOne({
            where: {
                id: teacherId
            }
        });
    }

    static deleteTeacherById(teacherId){
        return Teacher.destroy({
            where: {
                id: teacherId
            }
        });
    }
}







module.exports = TeacherService;
const pool = require('../utils/mysql').getPool();



function getDepositDate(student_id){
    return new Promise(function(resolve, reject){
        return new Promise(function(resolve, reject){
            pool.getConnection(function(err, connection){
                if(err) reject(err);
                else resolve(connection);
            });            
        }).then(function(connection){
            return new Promise(function(resolve, reject){
                connection.query('select first_date, total_count, now_count, course_count from expectation e, course c where c.expectation_id = e.id and c.student_id = ?', student_id, function(err ,result){
                    if(err) reject(err);
                    else {
                        if(result[0].course_count==1) resolve(28) //첫 세트면 다음 수강료 지급일은 첫 수업 날짜 + 28일 후
                        else{
                            /* 두번 째 수업료 지급일 = 첫 번째 수업료 지급일 + 28 * 1
                               세번 째 수업료 지급일 = 두번 째 수업료 지급일 + 28 * 1  = 첫 번째 수업료 지급일 + 28 * 2 
                               now_count = 3 (3회차 째라면 다음 수업료 지급일 =  4회차 첫 번째 수업일 = 첫번째 수업료 지급일 + 28 * 3) */
                        }
                    }     
                });
            });
        }).then(function(first_date){
            return new Promise(function(resolve, reject){
                connection.query('')
            });
        })

    })
} 
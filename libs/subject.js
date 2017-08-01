var async = require('async');


// 금액 설정 -> err
function setFee(subjectId, fee, conn, callback){
  var sql = 'update subject set fee = ? where id = ?';
  var values = [fee, subjectId];
  conn.query(sql, values, function(err, result){
    if (err)
      return callback(err);
    callback();
  });
}

// 총 회차 설정 -> err
function setTotalCount(subjectId, totalCount, conn, callback){
  var sql = 'update subject set total_count = ? where id = ?';
  var values = [totalCount, subjectId];
  conn.query(sql, values, function(err, result){
    if (err)
      return callback(err);
    callback();
  });
}


// 스케쥴 삭제 -> err
function deleteSchdule(subjectId, conn, callback){
  var sql = 'delete from schedule where subject_id = ?';
  var values = [subjectId];
  conn.query(sql, values, function(err, result){
    if (err)
      return callback(err);
    callback();
  });
}


// 스케쥴 추가 -> err
function addSchdules(subjectId, schedules, conn, callback){
  var sql = 'insert into schedule(day, start_time, end_time, subject_id) values ?';
  var values = [];
  for (var i in schedules)
    values.push([schedules[i].day, schedules[i].start_time, schedules[i].end_time, subjectId]);
  conn.query(sql, [values], function(err, result){
    if (err)
      return callback(err);
    callback();
  });
}

// 스케쥴 정보 얻기 -> err, results
function getSchedules(subjectId, conn, callback){
  var sql = 'select day, start_time, end_time from schedule where subject_id = ?';
  var values = [subjectId];
  conn.query(sql, values, function(err, rows){
    if (err || rows.length < 1)
      return callback(err ? err : "Rows length : 0");
    callback(null, rows);
  });
}

// 과목 정보 얻기 -> err, subject
function getSubject(subjectId, conn, callback){
  var sql = 'select * from subject sub left join class cls on sub.id = cls.subject_id where sub.id = ? and sub.set_count = cls.set_count and sub.total_count = cls.continuation;';
  var values = [subjectId];
  conn.query(sql, values, function(err, rows){
    if (err || rows.length < 1)
      return callback(err ? err : "Rows length : 0");
    callback(null, rows[0]);
  });
}


// 수업 삭제 : 전달 받은 회차 이후의 수업 모두 삭제 -> err
function deleteLessons(subjectId, continuation, setCount, conn, callback){
  var sql = 'delete from class where subject_id = ? and continuation > ? and set_count = ?';
  var values = [subjectId, continuation, setCount];
  conn.query(sql, values, function(err, result){
    if (err)
      return callback(err);
    callback();
  });
}

// 수업 추가 -> err, lessons
function addLessons(lessons, conn, callback){
  async.forEachOf(lessons, function(lesson, index, callback){
    var sql = 'insert into class(subject_id, date, start_time, end_time, continuation, set_count) values(?,?,?,?,?,?)';
    var values = [lesson.subject_id, lesson.date, lesson.start_time, lesson.end_time, lesson.continuation, lesson.set_count];
    conn.query(sql, values, function(err, result){
      if (err)
        return callback(err);
      lessons[index].id = result.insertId;
      callback();
    });
  },
  function(err){
    if (err)
      return callback(err);
    callback(null, lessons);
  });
}



module.exports = {
  setFee : setFee,
  setTotalCount : setTotalCount,
  deleteSchdule : deleteSchdule,
  addSchdules : addSchdules,
  getSubject : getSubject,
  getSchedules : getSchedules,
  deleteLessons : deleteLessons,
  addLessons : addLessons
};
// aidan.bae@kakaocorp.com
// 010-7752-3224
// 월 아침 10시까지 형식적인 이력서
// 대학생활을 중심으로 나의 개발인생

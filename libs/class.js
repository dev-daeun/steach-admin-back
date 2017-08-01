var async = require('async');
var push = require('../utils/push.js');
var coolsms = require('../utils/coolsms.js');
var moment = require("moment");



function setClassDate(req, userId, conn, callback){
  async.series([
    // class_id에 해당하는 수업 일정 변경
    function(callback){
      var sql = "update class set date = ?, start_time = ?, end_time = ? where id = ?";
      conn.query(sql, [moment(req.body.date).format("YYYY-MM-DD Z"), req.body.start_time, req.body.end_time, req.params.class_id], function(error, rows){
        if (error)
          return callback(error, "update date");
        callback();
      });
    },
    // 회차 변수 생성
    function(callback){
      var sql = "set @? := 0;";
      conn.query(sql, [userId], function(error, rows){
        if (error)
          return callback(error, "set variable");
        callback();
      });
    },
    // 회차 변수 초기화
    function(callback){
      var sql = "select min(continuation)-1 into @? from class where subject_id = ? and set_count = ?;";
      conn.query(sql, [userId, req.body.subject_id, req.body.set_count], function(error, rows){
        if (error)
          return callback(error, "set variable");
        callback();
      });
    },
    // 모든 수업 회차 변경
    function(callback){
      var sql = "update class c1, (select id, @? := @?+1 as rownum from class where subject_id = ? and set_count = ? order by date, start_time) c2 set c1.continuation = c2.rownum where c1.id = c2.id;";
      conn.query(sql, [userId, userId, req.body.subject_id, req.body.set_count], function(error, rows){
        if (error)
          return callback(error, "update count");
        callback(null, "update count");
      });
    }
  ],
  function(error, results){
    if (error)
      return callback(error, 500);
    callback(null, 204);
  });
}


function setClassReview(req, conn, callback){
  async.waterfall([
    // 코멘트+수행률 등록
    function (callback){
      var sql = 'update subject s left join class c on s.id = c.subject_id set s.now_count = if(c.attendance = 0, s.now_count+1, s.now_count), c.comment = if(c.attendance = 0, ?, c.comment), c.evaluation_title = if(c.attendance = 0, ?, c.evaluation_title), c.evaluation = if(c.attendance = 0, ?, c.evaluation), c.attendance = if(c.attendance = 0, 1, c.attendance) where s.id = ? and c.id = ?;';
      var values = [req.body.comment, req.body.evaluation_title, req.body.evaluation, req.body.subject_id, req.params.class_id];
      conn.query(sql, values, function(error, result){
        if (error)
          return callback(error, "update comment");
        if (result.changedRows === 0)
          return callback("Already attendance class", "400");
        callback();
      });
    },
    function (callback){
      if (!req.files || req.files.length < 1)
        return callback();
      var sql = 'insert into review_image(class_id, image) values ?';
      var values = [];
      for (var i in req.files)
        values.push([req.params.class_id, req.files[i].location]);
      conn.query(sql, [values], function(error, result){
        if (error)
          return callback(error, 'insert image');
        callback();
      });
    },
    // 스티치 톡 추가
    function (callback){
      var sql = "insert into talk_message(talk_id, class_id, sender, message) values(?,?,0,?)";
      var values = [req.body.subject_id, req.params.class_id, req.body.comment];
      conn.query(sql, values, function(error, result){
        if (error)
          return callback(error, "talk");
        callback(null, result.insertId);
      });
    },
    // 스티치 톡 추가
    function (talkMessageId, callback){
      var sql = "update talk set parents_unread = parents_unread + 1, last_message_id = ? where subject_id = ?";
      var values = [talkMessageId, req.body.subject_id];
      conn.query(sql, values, function(error, rows){
        if (error)
          return callback(error, "talk");
        callback();
      });
    },
    // push 발송
    function (callback){
      var sql = "select std.parents_phone, std.fcm_token, std.name, sub.name as subject_name, sub.now_count, sub.total_count, cls.date from class cls, subject sub, (select std.id, std.name, std.parents_phone, ps.fcm_token from student std left join parents ps on std.parents_id = ps.id) std where cls.id = ? and cls.subject_id = sub.id and sub.student_id = std.id;";
      conn.query(sql, [req.params.class_id], function(error, rows){
        if (error){
          callback(error, "push");
        }
        else {
          if (rows.length > 0){
            var title = "[Steach 알림]";
            var body, code;
            var link = "\nhttps://goo.gl/IKLCbo";
            if (rows[0].now_count == rows[0].total_count+1){
              body = rows[0].name + "의 " + rows[0].subject_name + " 수업이 " + rows[0].total_count + "회까지 모두 완료되었습니다.\n선생님이 이어서하기를 하면 다음 1회차부터 다시 출석알림을 받을 수 있습니다.";
              code = 'D05';
            }
            else {
              body = moment(rows[0].date).format('MMM Do') + " " + rows[0].name + " " + rows[0].subject_name + " 수업의 출석이 완료되었습니다.";
              code = 'E01';
            }

            if (rows[0].fcm_token){
              push.pushMessage(title, body, rows[0].fcm_token);
            }
            else if (rows[0].parents_phone){
              if (code == 'E01'){
                body += "\n선생님께서 정성스럽게 남겨주신 코멘트는 어플을 통해 확인하실 수 있습니다." + link;
              }
              else {
                body += "\n자세한 진도사항은 스티치 어플을 통해 확인 하실 수 있습니다." + link;
              }
              coolsms.coolMessage(rows[0].parents_phone, body, code);
            }
          }
          callback(null, "push");
        }
      });
    }
  ],
  function(error, results){
    if (error){
      if (results == "400")
        return callback(error, 400);
      return callback(error, 500);
    }
      return callback(null, 204);
  });
}


function setHomework(req, conn, callback){
  if (!req.body.homeworks)
    return callback(null, 400);
  req.body.homeworks = JSON.parse(req.body.homeworks);
  async.series([
    // 과제 추가
    function (callback){
      if (!req.body.homeworks.add || req.body.homeworks.add.length < 1)
        return callback();
      var sql = 'insert into homework(class_id, title, content) values ?';
      var values = [];
      for (var i in req.body.homeworks.add)
        values.push([req.params.class_id, req.body.homeworks.add[i].title, req.body.homeworks.add[i].content]);
      conn.query(sql, [values], function(error, result){
        if (error)
          return callback(error, 'insert');
        callback();
      });
    },
    // 과제 삭제
    function (callback){
      if (!req.body.homeworks.delete || req.body.homeworks.delete.length < 1)
        return callback();
      var sql = 'delete from homework where id in(?)';
      var values = [];
      for (var i in req.body.homeworks.delete)
        values.push(req.body.homeworks.delete[i].id);
      conn.query(sql, [values], function(error, result){
        if (error)
          return callback(error, 'delete');
        callback();
      });
    },
    // 과제 수정
    function (callback){
      if (!req.body.homeworks.modify || req.body.homeworks.modify.length < 1)
        return callback(null, "modify");
      async.eachSeries(req.body.homeworks.modify, function(modify, callback){
        conn.query('update homework set title = ?, content = ? where id = ?', [modify.title, modify.content, modify.id], function(error, result){
          if (error)
            return callback(error);
          callback(null);
        });
      },
      function(error){
        if (error)
          return callback(error, "modify");
        return callback(null, "modify");
      });
    }
  ],
  function(error, results){
    if (error)
      return callback(results + ":" + error, 500);
    return callback(null, 204);
  });
}


module.exports = {
  setClassDate: setClassDate,
  setClassReview: setClassReview,
  setHomework: setHomework
};

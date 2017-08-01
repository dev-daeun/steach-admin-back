
Date.prototype.yyyymmdd = function()
{
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString();
    var dd = this.getDate().toString();


    return yyyy + (mm[1] ? mm : '0' + mm[0]) + (dd[1] ? dd : '0' + dd[0]);
};

function getDateList(startDate, dates, count, extension) {

  var day_list = [];
  var k;
  var tempStartDate = startDate; // 오늘 날짜
  if (extension)
    startDate.setDate(startDate.getDate()+1);
  var day_label = startDate.getDay(); // 오늘
  var class_dates = [];
  if (dates.length > 1){
    var large = [];
    var small = [];

    for (var i = 0; i<dates.length; i++ ){
      if ((tempStartDate).getDay() > dates[i].day)
        small.push(dates[i]);
      else
        large.push(dates[i]);
    }
    dates = large.concat(small);
    var dates_count = 0;

    for (var j = 0; j < count; j++){
      if (dates_count == dates.length){
        dates_count = 0;
      }
      day_list.push(dates[dates_count++]);
    }

  }
  else {
    for (var p = 0; p < count; p++)
      day_list.push(dates[0]);
  }


  if (dates.length>1){
    for (k = 0; k< day_list.length; k++){
      if (day_label > day_list[k].day){
        class_dates.push({date : (new Date(startDate.setDate(startDate.getDate()+7-(day_label-day_list[k].day)))).yyyymmdd(), start_time : day_list[k].start_time, end_time : day_list[k].end_time});

      }
      else {
        class_dates.push({date : (new Date(startDate.setDate(startDate.getDate()+day_list[k].day-day_label))).yyyymmdd(), start_time : day_list[k].start_time, end_time : day_list[k].end_time});
      }
      day_label = day_list[k].day;
    }
  }
  else {
    if (day_label > day_list[0].day)
      class_dates.push({date : (new Date(startDate.setDate(startDate.getDate()+7-(day_label-day_list[0].day)))).yyyymmdd(), start_time : day_list[0].start_time, end_time : day_list[0].end_time});
    else
      class_dates.push({date : (new Date(startDate.setDate(startDate.getDate()+day_list[0].day-day_label))).yyyymmdd(), start_time : day_list[0].start_time, end_time : day_list[0].end_time});
    day_label = day_list[0].day;

    for (k = 1; k< day_list.length; k++){
      class_dates.push({date : (new Date(startDate.setDate(startDate.getDate()+7))).yyyymmdd(), start_time : day_list[k].start_time, end_time : day_list[k].end_time});
      day_label = day_list[k].day;
    }
  }

  return class_dates;
}

module.exports = {
  getDateList: getDateList,
  yyyymmdd: Date.prototype.yyyymmdd
};

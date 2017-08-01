function createData(row, single, multi){
  var data = {};
  for (var sIdx in single)
    data[single[sIdx]] = row[single[sIdx]];
  for (var mIdx in multi){
    data[multi[mIdx]] = [];
    if (row[multi[mIdx]]) data[multi[mIdx]].push(row[multi[mIdx]]);
  }
  return data;
}

function addData(datas, row, single, multi){
  for (var dIdx in datas){
    for (var sIdx in single){
      if (datas[dIdx][single[sIdx]].toString() != row[single[sIdx]].toString())
        break;
      else if (sIdx == single.length-1){
        for (var mIdx in multi)
          if (row[multi[mIdx]]) datas[dIdx][multi[mIdx]].push(row[multi[mIdx]]);
        return true;
      }
    }
  }
  return false;
}


function rowsGenerator(rows, single, multi){
  var datas = [];
  for (var rIdx in rows){
    if (!addData(datas, rows[rIdx], single, multi))
      datas.push(createData(rows[rIdx], single, multi));
  }
  return datas;
}

module.exports = {
  rowsGenerator: rowsGenerator
};

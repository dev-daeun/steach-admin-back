module.exports = function(sequelize, DataTypes) {
  let Schedule = sequelize.define('Schedule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    courseId: {
      field: "course_id",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    day: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    startTime: {
      field: "start_time",
      type: DataTypes.TIME,
      allowNull: false
    },
    endTime: {
      field: "end_time",
      type: DataTypes.TIME,
      allowNull: false
    }
  }, {
    underscored: true,
    paranoid: true,
    tableName: "schedule"
  });
  return Schedule;
};

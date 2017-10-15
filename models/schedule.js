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
    },
    deletedAt: {
      field: 'deleted_at',
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    underscored: true,
    paranoid: true,
    tableName: "schedule"
  });
  Schedule.associate = (models) => {
    Schedule.belongsTo(models.Course, {
      foreignKey: "course_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };
  return Schedule;
};

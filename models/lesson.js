module.exports = function(sequelize, DataTypes) {
  let Lesson = sequelize.define("Lesson", {
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
    date: {
      type: DataTypes.DATEONLY,
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
    comment: {
      type: DataTypes.TEXT
    },
    comprehension: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    courseCount: {
      field: "course_count",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    attendance: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    sequence: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    underscored: true,
    paranoid: true,
    tableName: "lesson"
  });
  Lesson.associate = (models) => {
    Lesson.hasMany(models.Homework, {
      as: "homeworks",
      foreignKey: "lesson_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
    Lesson.hasMany(models.CommentIamge, {
      as: "images",
      foreignKey: "lesson_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };
  return Lesson;
};

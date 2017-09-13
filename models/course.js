module.exports = function(sequelize, DataTypes) {
  let Course = sequelize.define("Course", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    teacherId: {
      field: "teacher_id",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    studentId: {
      field: "student_id",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    assignmentId: {
      field: "assignment_id",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false
    },
    courseCount: {
      field: "course_count",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nextDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    underscored: true,
    paranoid: true,
    tableName: "course"
  });
  Course.associate = (models) => {
    Course.hasMany(models.Schedule, {
      as:'schedules',
      foreignKey: "course_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
    Course.hasMany(models.Turn, {
      as:'turns',
      foreignKey: "course_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
    Course.hasMany(models.Lesson, {
      as:'lessons',
      foreignKey: "course_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
    Course.hasMany(models.Grade, {
      as:'grades',
      foreignKey: "course_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };
  return Course;
};

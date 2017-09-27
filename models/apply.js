module.exports = function(sequelize, DataTypes) {
  let Apply = sequelize.define('Apply', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    assignmentId: {
      field: "assignment_id",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    studentId: {
      field: "student_id",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    teacherId: {
      field: "teacher_id",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    }
  }, {
    underscored: true,
    paranoid: true,
    tableName: "apply"
  });
  Apply.associate = (models) => {
    Apply.belongsTo(models.Assignment, {
      as:'assignment',
      foreignKey: "assignment_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
    Apply.belongsTo(models.Student, {
      as:'student',
      foreignKey: "student_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
    Apply.belongsTo(models.Teacher, {
      as:'teacher',
      foreignKey: "teacher_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };
  return Apply;
};

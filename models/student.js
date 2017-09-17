module.exports = function(sequelize, DataTypes) {
  let Student = sequelize.define("Student", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    supervisorId: {
      type: DataTypes.INTEGER,
      field: "supervisor_id",
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gender: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    schoolName: {
      field: "school_name",
      type: DataTypes.STRING,
      allowNull: false
    },
    grade: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    address1: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING
    },
    fatherPhone: {
      field: "father_phone",
      type: DataTypes.STRING
    },
    motherPhone: {
      field: "mother_phone",
      type: DataTypes.STRING
    },
    school: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    underscored: true,
    paranoid: true,
    tableName: "student"
  });
  Student.associate = (models) => {
    Student.hasMany(models.Apply, {
      as:'apply',
      foreignKey: "student_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
    Student.hasMany(models.Assignment, {
      as:'assignment',
      foreignKey: "student_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
    Student.hasMany(models.Course, {
      as:'courses',
      foreignKey: "student_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };
  return Student;
};

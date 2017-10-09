
module.exports = function(sequelize, DataTypes) {
  let Teacher = sequelize.define("Teacher", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    supervisorId: {
      field: "supervisor_id",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    fcmToken: {
      field: "fcm_token",
      type: DataTypes.STRING
    },
    gender: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    profile: {
      type: DataTypes.STRING
    },
    age: {
      type: DataTypes.STRING,
      allowNull: false
    },
    university: {
      type: DataTypes.STRING,
      allowNull: false
    },
    grade: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    univStatus: {
      field: "univ_status",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    address1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address2: {
      type: DataTypes.STRING,
      allowNull: false
    },
    employed: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    accountNumber: {
      field: "account_number",
      type: DataTypes.STRING,
      allowNull: false
    },
    available: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    underscored: true,
    paranoid: true,
    tableName: "teacher"
  });

  
  Teacher.associate = (models) => {
    Teacher.hasMany(models.Course, {
      foreignKey: "teacher_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
    Teacher.hasMany(models.Apply, {
      foreignKey: "teacher_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
    Teacher.hasMany(models.Assignment, {
      foreignKey: "teacher_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };
  return Teacher;
};

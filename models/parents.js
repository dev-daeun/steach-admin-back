module.exports = function(sequelize, DataTypes) {
  let Parents = sequelize.define("Parents", {
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
    user: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    gender: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    profile: {
      type: DataTypes.STRING
    },
    fcmToken: {
      field: "fcm_token",
      type: DataTypes.STRING
    }
  }, {
    underscored: true,
    paranoid: true,
    tableName: "parents"
  });
  return Parents;
};

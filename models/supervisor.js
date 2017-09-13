module.exports = function(sequelize, DataTypes) {
  let Supervisor = sequelize.define('Supervisor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    underscored: true,
    paranoid: true,
    tableName: "supervisor"
  });
  Supervisor.associate = (models) => {
    Supervisor.hasMany(models.Student, {
      foreignKey: 'supervisor_id',
      targetKey: 'id'
    });
    Supervisor.hasMany(models.Teacher, {
      foreignKey: 'supervisor_id',
      targetKey: 'id'
    });
    Supervisor.hasMany(models.Parents, {
      foreignKey: 'supervisor_id',
      targetKey: 'id'
    });
  };
  return Supervisor;
};

module.exports = function(sequelize, DataTypes) {
  let Homework = sequelize.define('Homework', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    lessonId: {
      field: "lesson_id",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT
    }
  }, {
    underscored: true,
    paranoid: true,
    tableName: "homework"
  });
  return Homework;
};

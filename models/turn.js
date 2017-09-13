module.exports = function(sequelize, DataTypes) {
  let Turn = sequelize.define('Turn', {
    courseId: {
      field: "course_id",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nextCount: {
      field: "next_count",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    totalCount: {
      field: "total_count",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    courseCount: {
      field: "course_count",
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    underscored: true,
    paranoid: true,
    tableName: "turn"
  });
  return Turn;
};

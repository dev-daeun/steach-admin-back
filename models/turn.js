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
      allowNull: true
    },
    totalCount: {
      field: "total_count",
      type: DataTypes.INTEGER,
      allowNull: true
    },
    courseCount: {
      field: "course_count",
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deletedAt: {
      field: "deleted_at",
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    underscored: true,
    paranoid: true,
    tableName: "turn"
  });
  Turn.associate = (models) => {
    Turn.belongsTo(models.Course, {
      foreignKey: "course_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };
  return Turn;
};

module.exports = function(sequelize, DataTypes) {
  let Grade = sequelize.define('Grade', {
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
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    year: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    deletedAt: {
      field: "deleted_at",
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    underscored: true,
    paranoid: true,
    tableName: "grade"
  });
  Grade.associate = (models) => {
    Grade.belongsTo(models.Course, {
      foreignKey: "course_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };
  return Grade;
};

module.exports = function(sequelize, DataTypes) {
  let CommentIamge = sequelize.define('CommentIamge', {
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
    image: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    underscored: true,
    paranoid: true,
    tableName: "comment_iamge"
  });
  return CommentIamge;
};

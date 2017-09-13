module.exports = function(sequelize, DataTypes) {
  let Assignment = sequelize.define('Assignment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    studentId: {
      field: "student_id",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    timesWeek: {
      field: "times_week",
      type: DataTypes.STRING,
      allowNull: false
    },
    classForm: {
      field: "class_form",
      type: DataTypes.STRING,
      allowNull: false
    },
    teacherGender: {
      field: "teacher_gender",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    teacherFee: {
      field: "teacher_fee",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    knownPath: {
      field: "known_path",
      type: DataTypes.STRING,
      allowNull: false
    },
    teacherAge: {
      field: "teacher_age",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    book: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fee: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    carProvided: {
      field: "car_provided",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    firstDate: {
      field: "first_date",
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    regularDate: {
      field: "regular_date",
      type: DataTypes.STRING,
      allowNull: false
    },
    assignStatus: {
      field: "assign_status",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    consultStatus: {
      field: "consult_status",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    failReason: {
      field: "fail_reason",
      type: DataTypes.TEXT,
      allowNull: false
    },
    payDay: {
      field: "pay_day",
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    depositFee: {
      field: "deposit_fee",
      type: DataTypes.INTEGER,
      defaultValue:0,
      allowNull: false
    },
    depositDay: {
      field: "deposit_day",
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    recommended: {
      type: DataTypes.STRING,
      allowNull: false
    },
    studentMemo: {
      field: "student_memo",
      type: DataTypes.STRING,
      allowNull: false
    },
    callingDay: {
      field: "calling_day",
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    visitingDay: {
      field: "visiting_day",
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    calledConsultant: {
      field: "called_consultant",
      type: DataTypes.STRING,
      allowNull: false
    },
    visitedConsultant: {
      field: "visited_consultant",
      type: DataTypes.STRING,
      allowNull: false
    },
    prevProgram: {
      field: "prev_program",
      type: DataTypes.STRING,
      allowNull: false
    },
    prevStartTerm: {
      field: "prev_start_term",
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    prevEndTerm: {
      field: "prev_end_term",
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    prevUsedBook: {
      field: "prev_used_book",
      type: DataTypes.STRING,
      allowNull: false
    },
    prevScore: {
      field: "prev_score",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    prevPros: {
      field: "prev_pros",
      type: DataTypes.STRING,
      allowNull: false
    },
    prevCons: {
      field: "prev_cons",
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    underscored: true,
    paranoid: true,
    tableName: "assignment"
  });

  Assignment.associate = (models) => {
    Assignment.hasMany(models.Apply, {
      as:'applys',
      foreignKey: "assignment_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
    Assignment.belongsTo(models.Student, {
      as:'student',
      foreignKey: "student_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };
  return Assignment;
};

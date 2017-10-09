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
    studentName: {
      field: "student_name",
      type: DataTypes.STRING,
      allowNull: true
    },
    teacherId: {
      field: "teacher_id",
      type: DataTypes.INTEGER,
      allowNull: true
    },
    teacherName: {
      field: "teacher_name",
      type: DataTypes.STRING,
      allowNull: true
    },
    attendance: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    timesWeek: {
      field: "times_week",
      type: DataTypes.STRING,
      allowNull: true
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
      allowNull: true,
      defaultValue: 0
    },
    knownPath: {
      field: "known_path",
      type: DataTypes.TEXT,
      allowNull: true
    },
    teacherAge: {
      field: "teacher_age",
      type: DataTypes.INTEGER,
      allowNull: true
    },
    book: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fee: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    carProvided: {
      field: "car_provided",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    firstDate: {
      field: "first_date",
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    regularDate: {
      field: "regular_date",
      type: DataTypes.STRING,
      allowNull: true
    },
    assignStatus: {
      field: "assign_status",
      type: DataTypes.INTEGER,
      defaultValue: 2,
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
      allowNull: true
    },
    payDay: {
      field: "pay_day",
      type: DataTypes.DATEONLY,
      allowNull: true
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
      allowNull: true
    },
    recommended: {
      type: DataTypes.STRING,
      allowNull: true
    },
    studentMemo: {
      field: "student_memo",
      type: DataTypes.STRING,
      allowNull: true
    },
    callingDay: {
      field: "calling_day",
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    visitingDay: {
      field: "visiting_day",
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    calledConsultant: {
      field: "called_consultant",
      type: DataTypes.STRING,
      allowNull: true
    },
    visitedConsultant: {
      field: "visited_consultant",
      type: DataTypes.STRING,
      allowNull: true
    },
    prevProgram: {
      field: "prev_program",
      type: DataTypes.STRING,
      allowNull: true
    },
    prevStartTerm: {
      field: "prev_start_term",
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    prevEndTerm: {
      field: "prev_end_term",
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    prevUsedBook: {
      field: "prev_used_book",
      type: DataTypes.STRING,
      allowNull: true
    },
    prevScore: {
      field: "prev_score",
      type: DataTypes.INTEGER,
      allowNull: true
    },
    prevPros: {
      field: "prev_pros",
      type: DataTypes.STRING,
      allowNull: true
    },
    prevCons: {
      field: "prev_cons",
      type: DataTypes.STRING,
      allowNull: true
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
    Assignment.belongsTo(models.Teacher, {
      as:'teacher',
      foreignKey: "teacher_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };
  return Assignment;
};

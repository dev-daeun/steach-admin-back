-- --------------------------------------------------------
-- 호스트:                          localhost
-- 서버 버전:                        5.5.54 - MySQL Community Server (GPL)
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  9.4.0.5125
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- steach_company 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `steach_company` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */;
USE `steach_company`;

-- 테이블 steach_company.assignment 구조 내보내기
CREATE TABLE IF NOT EXISTS `assignment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `expectation_id` int(11) NOT NULL DEFAULT '0',
  `student_id` int(11) NOT NULL DEFAULT '0',
  `teacher_id` int(11) NOT NULL DEFAULT '0',
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '배정실패-0, 배정대기중-1, 배정완료-2',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `assign_student_id` (`student_id`),
  KEY `assign_expectation_id` (`expectation_id`),
  KEY `assign_teacher_id` (`teacher_id`),
  CONSTRAINT `assign_expectation_id` FOREIGN KEY (`expectation_id`) REFERENCES `expectation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assign_student_id` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assign_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='학생-선생 매칭 테이블';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 steach_company.comment_image 구조 내보내기
CREATE TABLE IF NOT EXISTS `comment_image` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lesson_id` int(11) NOT NULL DEFAULT '0',
  `image` varchar(200) COLLATE utf8_unicode_ci NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `comment_lesson_id` (`lesson_id`),
  CONSTRAINT `comment_lesson_id` FOREIGN KEY (`lesson_id`) REFERENCES `lesson` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='레슨 별 코멘트에 추가되는 이미지들 테이블';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 steach_company.course 구조 내보내기
CREATE TABLE IF NOT EXISTS `course` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `expectation_id` int(11) DEFAULT NULL,
  `student_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `subject` int(11) NOT NULL COMMENT '과목명',
  `memo` text COLLATE utf8_unicode_ci COMMENT '학생 특이사항',
  `total_count` tinyint(4) DEFAULT NULL COMMENT '총 회차',
  `now_count` tinyint(4) DEFAULT NULL COMMENT '현재 회차(ex. total_count = 8 -> 0<=now_count<=8 (8회차를 다 돌면 now_count = 0)',
  `course_count` tinyint(4) DEFAULT NULL COMMENT '현재 몇 세트 째인지 나타냄(ex. 총 8회차를 2번째 돈다 -> course_count = 2)',
  `next_date` date DEFAULT NULL COMMENT '가장 가까운 날에 예정된 다음 수업 날짜',
  PRIMARY KEY (`id`),
  KEY `course_expectation_id` (`expectation_id`),
  KEY `course_student_id` (`student_id`),
  KEY `course_teacher_id` (`teacher_id`),
  CONSTRAINT `course_expectation_id` FOREIGN KEY (`expectation_id`) REFERENCES `expectation` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `course_student_id` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `course_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='배정된 학생-선생이 진행하는 과목 테이블';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 steach_company.expectation 구조 내보내기
CREATE TABLE IF NOT EXISTS `expectation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `subject` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT '과목',
  `class_form` tinyint(4) NOT NULL DEFAULT '0' COMMENT '원내그룹-1, 개인방문-2',
  `known_path` tinyint(4) NOT NULL DEFAULT '0' COMMENT '알게 된 경로(아파트게시판-1, 명함-2, 소개-3, 인터넷-4, 기타-5)',
  `apart_name` varchar(20) COLLATE utf8_unicode_ci DEFAULT '0' COMMENT '아파트 명',
  `teacher_age` tinyint(4) DEFAULT NULL COMMENT '희망하는 선생님 연령대(20,30,40..)',
  `book` text COLLATE utf8_unicode_ci COMMENT '희망하는 교재',
  `fee` int(11) DEFAULT NULL COMMENT '수강료(차후 수정시 이 컬럼 수정)',
  `car_provided` tinyint(4) NOT NULL DEFAULT '0' COMMENT '차량지원 희망여부. 희망-1, 비희망-0',
  `first_date` date DEFAULT NULL COMMENT '희망하는 첫 수업 날짜',
  `regular_date` text COLLATE utf8_unicode_ci NOT NULL COMMENT '희망하는 정기수업일/시간',
  `assign_status` tinyint(4) NOT NULL COMMENT '배정상태(실패-0, 배정실패-1, 배정중-2, 대기중-3, 재원중-4)',
  `consult_status` tinyint(4) NOT NULL COMMENT '상담상태(성공-3, 전화실패-2, 취소-1, 퇴원-0)',
  `fail_reason` text COLLATE utf8_unicode_ci COMMENT '상담실패사유',
  `teacher_memo` text COLLATE utf8_unicode_ci COMMENT '희망하는 선생님 성향',
  `pay_day` date DEFAULT NULL COMMENT '수강료 지급일',
  `student_memo` text COLLATE utf8_unicode_ci COMMENT '신규등록하는 학생 성향',
  `calling_day` date DEFAULT NULL COMMENT '전화온 날짜',
  `visiting_day` date DEFAULT NULL COMMENT '방문한 날짜',
  `called_consultant` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '전화상담가 이름',
  `visited_consultant` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '방문상담가 이름',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `expect_student_id` (`student_id`),
  CONSTRAINT `expect_student_id` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='신규등록 하는 학생 희망정보';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 steach_company.grade 구조 내보내기
CREATE TABLE IF NOT EXISTS `grade` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) DEFAULT NULL,
  `test_form1` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT 'ex. 내신, 모의평가, 기타',
  `test_form2` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT 'ex. 중간, 기말, 3,6,9,월, 쪽지시험',
  `score` tinyint(4) NOT NULL COMMENT '시험점수',
  `rating` tinyint(4) DEFAULT NULL COMMENT '등급',
  `subject` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '과목',
  PRIMARY KEY (`id`),
  KEY `grade_course_id` (`course_id`),
  CONSTRAINT `grade_course_id` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='과목별 학생 성적 테이블';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 steach_company.homework 구조 내보내기
CREATE TABLE IF NOT EXISTS `homework` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lesson_id` int(11) NOT NULL COMMENT '레슨 id',
  `title` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT '숙제 제목',
  `content` text COLLATE utf8_unicode_ci NOT NULL COMMENT '내용',
  PRIMARY KEY (`id`),
  KEY `homework_lession_id` (`lesson_id`),
  CONSTRAINT `homework_lession_id` FOREIGN KEY (`lesson_id`) REFERENCES `lesson` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='레슨 별 숙제 테이블';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 steach_company.lesson 구조 내보내기
CREATE TABLE IF NOT EXISTS `lesson` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `subject` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT '과목',
  `date` date NOT NULL COMMENT '수업 날짜',
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `comment` text COLLATE utf8_unicode_ci COMMENT '수업 코멘트',
  `comprehension` tinyint(4) DEFAULT NULL COMMENT '수업이해도',
  `course_count` tinyint(4) NOT NULL COMMENT '몇 번째 세트?',
  `now_count` tinyint(4) NOT NULL COMMENT '현재 회차',
  `attendance` tinyint(4) NOT NULL COMMENT '출석 여부(미출석-0, 출석-1)',
  PRIMARY KEY (`id`),
  KEY `lesson_course_id` (`course_id`),
  KEY `lesson_student_id` (`student_id`),
  KEY `lesson_teacher_id` (`teacher_id`),
  CONSTRAINT `lesson_course_id` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lesson_student_id` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lesson_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='회차 별 레슨 테이블';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 steach_company.parents 구조 내보내기
CREATE TABLE IF NOT EXISTS `parents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `password` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `name` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `gender` tinyint(4) NOT NULL COMMENT '남-0 여-1',
  `profile` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `fcm_token` varchar(300) COLLATE utf8_unicode_ci DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `user` (`user`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='학부모 기본정보 테이블';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 steach_company.schedule 구조 내보내기
CREATE TABLE IF NOT EXISTS `schedule` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL DEFAULT '0',
  `day` tinyint(4) NOT NULL DEFAULT '0' COMMENT '요일 (월화수목금토일 = 1234567)',
  `start_time` time NOT NULL COMMENT '시작 시간',
  `end_time` time NOT NULL COMMENT '종료 시간',
  PRIMARY KEY (`id`),
  KEY `schedule_course_id` (`course_id`),
  CONSTRAINT `schedule_course_id` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='각 course의 정기 수업 요일&시간';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 steach_company.student 구조 내보내기
CREATE TABLE IF NOT EXISTS `student` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `gender` tinyint(4) NOT NULL COMMENT '남-0 여-1',
  `school` tinyint(4) NOT NULL COMMENT '초-1 중-2 고-3 성인-4',
  `school_name` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `grade` tinyint(4) DEFAULT NULL COMMENT '1,2,3 (학년)',
  `address1` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '시',
  `address2` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '군구',
  `address3` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '상세주소',
  `phone` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `father_phone` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `mother_phone` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `fcm_token` varchar(300) COLLATE utf8_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='학생 기본정보 테이블';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 steach_company.student_log 구조 내보내기
CREATE TABLE IF NOT EXISTS `student_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL DEFAULT '0',
  `subject` varchar(20) COLLATE utf8_unicode_ci DEFAULT '0' COMMENT '과목',
  `program` tinyint(5) DEFAULT '0' COMMENT '수강했던 프로그램(학원-1, 과외-2, 인강-3, 독학-4, 기타-5)',
  `start_term` date DEFAULT '0000-00-00' COMMENT '수강 시작날짜',
  `end_term` date DEFAULT '0000-00-00' COMMENT '수강 종료날짜',
  `book` varchar(15) COLLATE utf8_unicode_ci DEFAULT '0' COMMENT '사용했던 교재이름',
  `pros` varchar(200) COLLATE utf8_unicode_ci DEFAULT '0' COMMENT '좋았던 점',
  `cons` varchar(200) COLLATE utf8_unicode_ci DEFAULT '0' COMMENT '아쉬웠던 점',
  PRIMARY KEY (`id`),
  KEY `studentlog_student_id` (`student_id`),
  CONSTRAINT `studentlog_student_id` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='학생 과거 기록';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 steach_company.supervisor 구조 내보내기
CREATE TABLE IF NOT EXISTS `supervisor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='관리자 계정 테이블';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 steach_company.talk 구조 내보내기
CREATE TABLE IF NOT EXISTS `talk` (
  `teacher_id` int(11) DEFAULT NULL,
  `parents_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `teacher_unread` int(11) NOT NULL DEFAULT '0' COMMENT '선생님이 읽지 않은 메세지 수',
  `parents_unread` int(11) NOT NULL DEFAULT '0' COMMENT '학부모가 읽지 않은 메세지 수',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_message_id` int(11) DEFAULT '0' COMMENT '가장 마지막으로 날아온 메세지 id',
  KEY `talk_teacher_id` (`teacher_id`),
  KEY `talk_parents_id` (`parents_id`),
  KEY `talk_course_id` (`course_id`),
  CONSTRAINT `talk_course_id` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `talk_parents_id` FOREIGN KEY (`parents_id`) REFERENCES `parents` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `talk_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='학부모-선생 톡 정보 테이블';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 steach_company.talk_message 구조 내보내기
CREATE TABLE IF NOT EXISTS `talk_message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `message` text COLLATE utf8_unicode_ci NOT NULL,
  `sender` tinyint(4) NOT NULL DEFAULT '0' COMMENT '보낸 사람 (선생님-0, 학부모-1)',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `talkmessage_course_id` (`course_id`),
  CONSTRAINT `talkmessage_course_id` FOREIGN KEY (`course_id`) REFERENCES `talk` (`course_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='각 톡방에 있는 메세지 테이블';

-- 내보낼 데이터가 선택되어 있지 않습니다.
-- 테이블 steach_company.teacher 구조 내보내기
CREATE TABLE IF NOT EXISTS `teacher` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT '본명',
  `password` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `user` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT '아이디',
  `phone` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `fcm_token` varchar(300) COLLATE utf8_unicode_ci DEFAULT NULL,
  `gender` tinyint(4) NOT NULL COMMENT '남-0 여-1',
  `profile` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `age` tinyint(4) NOT NULL,
  `university` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `major` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `grade` tinyint(4) NOT NULL COMMENT '1,2,3,4(학년)',
  `univ_status` tinyint(4) NOT NULL COMMENT '1-재학, 2-휴학, 3-수료, 4-졸업',
  `address1` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `address2` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `employed` tinyint(4) NOT NULL COMMENT '0-퇴직, 1-재직, 2-만강, 3-대기',
  `account_number` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `join_status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '관리자에 의한 가입승인 여부 미승인-0 승인 -1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user` (`user`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='선생님 기본정보 테이블';

-- 내보낼 데이터가 선택되어 있지 않습니다.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;

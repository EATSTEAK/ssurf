CREATE TABLE `personal_course_schedule` (
	`studentId` text NOT NULL,
	`year` integer NOT NULL,
	`semester` integer NOT NULL,
	`weekday` integer NOT NULL,
	`name` text NOT NULL,
	`professor` text NOT NULL,
	`time` text NOT NULL,
	`classroom` text NOT NULL,
	PRIMARY KEY(`studentId`, `year`, `semester`, `weekday`, `name`, `time`)
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_chapel_attendances` (
	`studentId` text NOT NULL,
	`year` integer NOT NULL,
	`semester` integer NOT NULL,
	`date` text NOT NULL,
	`division` integer,
	`category` text,
	`instructor` text,
	`instructorDepartment` text,
	`title` text,
	`attendance` text,
	`result` text,
	`note` text,
	PRIMARY KEY(`studentId`, `year`, `semester`, `date`)
);
--> statement-breakpoint
INSERT INTO `__new_chapel_attendances`("studentId", "year", "semester", "date", "division", "category", "instructor", "instructorDepartment", "title", "attendance", "result", "note") SELECT "studentId", "year", "semester", "date", "division", "category", "instructor", "instructorDepartment", "title", "attendance", "result", "note" FROM `chapel_attendances`;--> statement-breakpoint
DROP TABLE `chapel_attendances`;--> statement-breakpoint
ALTER TABLE `__new_chapel_attendances` RENAME TO `chapel_attendances`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_chapel_general` (
	`studentId` text NOT NULL,
	`year` integer NOT NULL,
	`semester` integer NOT NULL,
	`division` integer,
	`time` text,
	`room` text,
	`floor` integer,
	`seat` text,
	`absenceTime` integer,
	`result` text,
	`note` text,
	PRIMARY KEY(`studentId`, `year`, `semester`)
);
--> statement-breakpoint
INSERT INTO `__new_chapel_general`("studentId", "year", "semester", "division", "time", "room", "floor", "seat", "absenceTime", "result", "note") SELECT "studentId", "year", "semester", "division", "time", "room", "floor", "seat", "absenceTime", "result", "note" FROM `chapel_general`;--> statement-breakpoint
DROP TABLE `chapel_general`;--> statement-breakpoint
ALTER TABLE `__new_chapel_general` RENAME TO `chapel_general`;--> statement-breakpoint
CREATE TABLE `__new_class_grades` (
	`studentId` text NOT NULL,
	`year` integer NOT NULL,
	`semester` integer NOT NULL,
	`code` text NOT NULL,
	`className` text NOT NULL,
	`gradePoints` real NOT NULL,
	`scoreType` text NOT NULL,
	`scoreValue` integer,
	`rank` text NOT NULL,
	`professor` text NOT NULL,
	`detailJson` text,
	PRIMARY KEY(`studentId`, `year`, `semester`, `code`)
);
--> statement-breakpoint
INSERT INTO `__new_class_grades`("studentId", "year", "semester", "code", "className", "gradePoints", "scoreType", "scoreValue", "rank", "professor", "detailJson") SELECT "studentId", "year", "semester", "code", "className", "gradePoints", "scoreType", "scoreValue", "rank", "professor", "detailJson" FROM `class_grades`;--> statement-breakpoint
DROP TABLE `class_grades`;--> statement-breakpoint
ALTER TABLE `__new_class_grades` RENAME TO `class_grades`;--> statement-breakpoint
CREATE TABLE `__new_grade_summary` (
	`studentId` text NOT NULL,
	`type` text NOT NULL,
	`attemptedCredits` real NOT NULL,
	`earnedCredits` real NOT NULL,
	`gradePointsSum` real NOT NULL,
	`gradePointsAverage` real NOT NULL,
	`arithmeticMean` real NOT NULL,
	`pfEarnedCredits` real NOT NULL,
	PRIMARY KEY(`studentId`, `type`)
);
--> statement-breakpoint
INSERT INTO `__new_grade_summary`("studentId", "type", "attemptedCredits", "earnedCredits", "gradePointsSum", "gradePointsAverage", "arithmeticMean", "pfEarnedCredits") SELECT "studentId", "type", "attemptedCredits", "earnedCredits", "gradePointsSum", "gradePointsAverage", "arithmeticMean", "pfEarnedCredits" FROM `grade_summary`;--> statement-breakpoint
DROP TABLE `grade_summary`;--> statement-breakpoint
ALTER TABLE `__new_grade_summary` RENAME TO `grade_summary`;--> statement-breakpoint
CREATE TABLE `__new_semester_grades` (
	`studentId` text NOT NULL,
	`year` integer NOT NULL,
	`semester` integer NOT NULL,
	`attemptedCredits` real NOT NULL,
	`earnedCredits` real NOT NULL,
	`pfEarnedCredits` real NOT NULL,
	`gradePointsAverage` real NOT NULL,
	`gradePointsSum` real NOT NULL,
	`arithmeticMean` real NOT NULL,
	`semesterRankFirst` integer,
	`semesterRankSecond` integer,
	`generalRankFirst` integer,
	`generalRankSecond` integer,
	`academicProbation` integer NOT NULL,
	`consult` integer NOT NULL,
	`flunked` integer NOT NULL,
	PRIMARY KEY(`studentId`, `year`, `semester`)
);
--> statement-breakpoint
INSERT INTO `__new_semester_grades`("studentId", "year", "semester", "attemptedCredits", "earnedCredits", "pfEarnedCredits", "gradePointsAverage", "gradePointsSum", "arithmeticMean", "semesterRankFirst", "semesterRankSecond", "generalRankFirst", "generalRankSecond", "academicProbation", "consult", "flunked") SELECT "studentId", "year", "semester", "attemptedCredits", "earnedCredits", "pfEarnedCredits", "gradePointsAverage", "gradePointsSum", "arithmeticMean", "semesterRankFirst", "semesterRankSecond", "generalRankFirst", "generalRankSecond", "academicProbation", "consult", "flunked" FROM `semester_grades`;--> statement-breakpoint
DROP TABLE `semester_grades`;--> statement-breakpoint
ALTER TABLE `__new_semester_grades` RENAME TO `semester_grades`;--> statement-breakpoint
CREATE TABLE `__new_graduation_requirements` (
	`studentId` text NOT NULL,
	`name` text NOT NULL,
	`requirement` integer,
	`calculation` real,
	`difference` real,
	`result` integer NOT NULL,
	`category` text NOT NULL,
	`lectures` text NOT NULL,
	PRIMARY KEY(`studentId`, `name`)
);
--> statement-breakpoint
INSERT INTO `__new_graduation_requirements`("studentId", "name", "requirement", "calculation", "difference", "result", "category", "lectures") SELECT "studentId", "name", "requirement", "calculation", "difference", "result", "category", "lectures" FROM `graduation_requirements`;--> statement-breakpoint
DROP TABLE `graduation_requirements`;--> statement-breakpoint
ALTER TABLE `__new_graduation_requirements` RENAME TO `graduation_requirements`;--> statement-breakpoint
CREATE TABLE `__new_graduation_requirements_general` (
	`studentId` text PRIMARY KEY NOT NULL,
	`isGraduatable` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_graduation_requirements_general`("studentId", "isGraduatable", "updatedAt") SELECT "studentId", "isGraduatable", "updatedAt" FROM `graduation_requirements_general`;--> statement-breakpoint
DROP TABLE `graduation_requirements_general`;--> statement-breakpoint
ALTER TABLE `__new_graduation_requirements_general` RENAME TO `graduation_requirements_general`;--> statement-breakpoint
CREATE TABLE `__new_graduation_student` (
	`studentId` text PRIMARY KEY NOT NULL,
	`number` integer NOT NULL,
	`name` text NOT NULL,
	`grade` integer NOT NULL,
	`semester` integer NOT NULL,
	`status` text NOT NULL,
	`applyYear` integer NOT NULL,
	`applyType` text NOT NULL,
	`department` text NOT NULL,
	`majors` text NOT NULL,
	`auditDate` text NOT NULL,
	`graduationPoints` real NOT NULL,
	`completedPoints` real NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_graduation_student`("studentId", "number", "name", "grade", "semester", "status", "applyYear", "applyType", "department", "majors", "auditDate", "graduationPoints", "completedPoints") SELECT "studentId", "number", "name", "grade", "semester", "status", "applyYear", "applyType", "department", "majors", "auditDate", "graduationPoints", "completedPoints" FROM `graduation_student`;--> statement-breakpoint
DROP TABLE `graduation_student`;--> statement-breakpoint
ALTER TABLE `__new_graduation_student` RENAME TO `graduation_student`;--> statement-breakpoint
CREATE TABLE `__new_scholarships` (
	`studentId` text NOT NULL,
	`year` integer NOT NULL,
	`semester` integer NOT NULL,
	`name` text NOT NULL,
	`receivedAmount` text NOT NULL,
	`receiveType` text,
	`status` text,
	`processedAt` text,
	`selectedAmount` text,
	`refundedAmount` text,
	`replacedAmount` text,
	`replacedBy` text,
	`dropReason` text,
	`note` text,
	`workedAt` text,
	PRIMARY KEY(`studentId`, `year`, `semester`, `name`)
);
--> statement-breakpoint
INSERT INTO `__new_scholarships`("studentId", "year", "semester", "name", "receivedAmount", "receiveType", "status", "processedAt", "selectedAmount", "refundedAmount", "replacedAmount", "replacedBy", "dropReason", "note", "workedAt") SELECT "studentId", "year", "semester", "name", "receivedAmount", "receiveType", "status", "processedAt", "selectedAmount", "refundedAmount", "replacedAmount", "replacedBy", "dropReason", "note", "workedAt" FROM `scholarships`;--> statement-breakpoint
DROP TABLE `scholarships`;--> statement-breakpoint
ALTER TABLE `__new_scholarships` RENAME TO `scholarships`;--> statement-breakpoint
CREATE TABLE `__new_cache` (
	`studentId` text NOT NULL,
	`key` text NOT NULL,
	`updatedAt` integer,
	PRIMARY KEY(`studentId`, `key`)
);
--> statement-breakpoint
INSERT INTO `__new_cache`("studentId", "key", "updatedAt") SELECT "studentId", "key", "updatedAt" FROM `cache`;--> statement-breakpoint
DROP TABLE `cache`;--> statement-breakpoint
ALTER TABLE `__new_cache` RENAME TO `cache`;
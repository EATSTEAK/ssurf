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
);--> statement-breakpoint
DROP TABLE `chapel_attendances`;--> statement-breakpoint
ALTER TABLE `__new_chapel_attendances` RENAME TO `chapel_attendances`;--> statement-breakpoint
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
);--> statement-breakpoint
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
);--> statement-breakpoint
DROP TABLE `class_grades`;--> statement-breakpoint
ALTER TABLE `__new_class_grades` RENAME TO `class_grades`;--> statement-breakpoint
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
);--> statement-breakpoint
DROP TABLE `semester_grades`;--> statement-breakpoint
ALTER TABLE `__new_semester_grades` RENAME TO `semester_grades`;--> statement-breakpoint
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
);--> statement-breakpoint
DROP TABLE `scholarships`;--> statement-breakpoint
ALTER TABLE `__new_scholarships` RENAME TO `scholarships`;--> statement-breakpoint
CREATE TABLE `__new_cache` (
	`studentId` text NOT NULL,
	`key` text NOT NULL,
	`updatedAt` integer,
	PRIMARY KEY(`studentId`, `key`)
);--> statement-breakpoint
DROP TABLE `cache`;--> statement-breakpoint
ALTER TABLE `__new_cache` RENAME TO `cache`;--> statement-breakpoint
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
);--> statement-breakpoint
DROP TABLE `grade_summary`;--> statement-breakpoint
ALTER TABLE `__new_grade_summary` RENAME TO `grade_summary`;--> statement-breakpoint
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
);--> statement-breakpoint
DROP TABLE `graduation_requirements`;--> statement-breakpoint
ALTER TABLE `__new_graduation_requirements` RENAME TO `graduation_requirements`;--> statement-breakpoint
CREATE TABLE `__new_graduation_requirements_general` (
	`studentId` text PRIMARY KEY NOT NULL,
	`isGraduatable` integer NOT NULL,
	`updatedAt` integer NOT NULL
);--> statement-breakpoint
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
);--> statement-breakpoint
DROP TABLE `graduation_student`;--> statement-breakpoint
ALTER TABLE `__new_graduation_student` RENAME TO `graduation_student`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
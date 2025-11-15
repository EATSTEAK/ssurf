CREATE TABLE `class_grades` (
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
	PRIMARY KEY(`year`, `semester`, `code`)
);
--> statement-breakpoint
CREATE TABLE `grade_summary` (
	`type` text NOT NULL,
	`attemptedCredits` real NOT NULL,
	`earnedCredits` real NOT NULL,
	`gradePointsSum` real NOT NULL,
	`gradePointsAverage` real NOT NULL,
	`arithmeticMean` real NOT NULL,
	`pfEarnedCredits` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `semester_grades` (
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
	PRIMARY KEY(`year`, `semester`)
);

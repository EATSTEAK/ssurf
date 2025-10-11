CREATE TABLE `chapel_attendances` (
	`year` integer,
	`semester` integer,
	`date` text,
	`division` integer,
	`category` text,
	`instructor` text,
	`instructorDepartment` text,
	`title` text,
	`attendance` text,
	`result` text,
	`note` text
);
--> statement-breakpoint
CREATE TABLE `chapel_general` (
	`year` integer,
	`semester` integer,
	`division` integer,
	`time` text,
	`room` text,
	`floor` integer,
	`seat` text,
	`absenceTime` integer,
	`result` text,
	`note` text
);

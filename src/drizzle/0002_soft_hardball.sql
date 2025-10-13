PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_chapel_attendances` (
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
	PRIMARY KEY(`year`, `semester`, `date`)
);
--> statement-breakpoint
INSERT INTO `__new_chapel_attendances`("year", "semester", "date", "division", "category", "instructor", "instructorDepartment", "title", "attendance", "result", "note") SELECT "year", "semester", "date", "division", "category", "instructor", "instructorDepartment", "title", "attendance", "result", "note" FROM `chapel_attendances`;--> statement-breakpoint
DROP TABLE `chapel_attendances`;--> statement-breakpoint
ALTER TABLE `__new_chapel_attendances` RENAME TO `chapel_attendances`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_chapel_general` (
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
	PRIMARY KEY(`year`, `semester`)
);
--> statement-breakpoint
INSERT INTO `__new_chapel_general`("year", "semester", "division", "time", "room", "floor", "seat", "absenceTime", "result", "note") SELECT "year", "semester", "division", "time", "room", "floor", "seat", "absenceTime", "result", "note" FROM `chapel_general`;--> statement-breakpoint
DROP TABLE `chapel_general`;--> statement-breakpoint
ALTER TABLE `__new_chapel_general` RENAME TO `chapel_general`;
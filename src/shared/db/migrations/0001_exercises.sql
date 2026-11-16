CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`primary_muscle_group` text NOT NULL,
	`secondary_muscle_groups` text DEFAULT '[]' NOT NULL,
	`equipment` text,
	`origin` text NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);

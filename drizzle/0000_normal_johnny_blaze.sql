CREATE TABLE `leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`service` text NOT NULL,
	`area` text NOT NULL,
	`problem` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'New' NOT NULL,
	`assigned_vendor` text DEFAULT 'Auto match ready' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`business_name` text NOT NULL,
	`phone` text NOT NULL,
	`service` text NOT NULL,
	`areas` text NOT NULL,
	`status` text DEFAULT 'New' NOT NULL,
	`rating` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);

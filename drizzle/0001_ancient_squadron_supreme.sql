ALTER TABLE `leads` ADD `package_name` text DEFAULT 'Basic Visit' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `address` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `time_slot` text DEFAULT 'Anytime today' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `payment_mode` text DEFAULT 'Cash after service' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `customer_rating` integer DEFAULT 0 NOT NULL;
CREATE TABLE `recurring_expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`item_name` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`currency` text DEFAULT 'SGD' NOT NULL,
	`category_id` text NOT NULL,
	`frequency` text NOT NULL,
	`day_of_month` integer,
	`day_of_week` integer,
	`interval_days` integer,
	`month_of_year` integer,
	`start_date` text NOT NULL,
	`end_date` text,
	`last_logged_date` text,
	`note` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);

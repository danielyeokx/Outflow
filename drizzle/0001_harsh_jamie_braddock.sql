CREATE TABLE `learned_keywords` (
	`keyword` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);

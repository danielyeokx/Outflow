// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo
// SQL inlined to avoid Metro bundler issues with .sql imports

import journal from './meta/_journal.json';

const m0000 = `CREATE TABLE \`categories\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`name\` text NOT NULL,
	\`color\` text NOT NULL,
	\`icon\` text NOT NULL,
	\`sort_order\` integer DEFAULT 0 NOT NULL,
	\`is_default\` integer DEFAULT true NOT NULL,
	\`created_at\` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE \`expenses\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`category_id\` text NOT NULL,
	\`amount_cents\` integer NOT NULL,
	\`currency\` text DEFAULT 'SGD' NOT NULL,
	\`item_name\` text NOT NULL,
	\`spent_at\` text NOT NULL,
	\`note\` text,
	\`created_at\` text NOT NULL,
	FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE no action
);`;

const m0001 = `CREATE TABLE \`learned_keywords\` (
	\`keyword\` text PRIMARY KEY NOT NULL,
	\`category_id\` text NOT NULL,
	\`updated_at\` text NOT NULL,
	FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE no action
);`;

export default {
  journal,
  migrations: {
    m0000,
    m0001,
  }
};

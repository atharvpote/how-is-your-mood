CREATE TABLE `Journal` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`date` integer NOT NULL,
	`preview` text DEFAULT '' NOT NULL,
	`summery` text DEFAULT '' NOT NULL,
	`mood` text DEFAULT '' NOT NULL,
	`subject` text DEFAULT '' NOT NULL,
	`sentiment` real,
	`emoji` text DEFAULT '' NOT NULL,
	`embedded` integer DEFAULT 0 NOT NULL,
	`userId` text(36),
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`clerkId` text(36) NOT NULL,
	`email` text(320) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `date_idx` ON `Journal` (`date`);--> statement-breakpoint
CREATE INDEX `usedId_idx` ON `Journal` (`userId`);--> statement-breakpoint
CREATE INDEX `usedId_date_idx` ON `Journal` (`userId`,`date`);--> statement-breakpoint
CREATE UNIQUE INDEX `id_userId_idx` ON `Journal` (`id`,`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_clerkId_unique` ON `User` (`clerkId`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_unique` ON `User` (`email`);--> statement-breakpoint
CREATE INDEX `clerkId_idx` ON `User` (`clerkId`);
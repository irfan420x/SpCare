CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(80) NOT NULL,
	`nameBn` varchar(120) NOT NULL,
	`nameEn` varchar(120) NOT NULL,
	`subtitleBn` varchar(220),
	`iconKey` varchar(64) NOT NULL DEFAULT 'building',
	`accent` varchar(32) NOT NULL DEFAULT 'green',
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `featuredItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceId` int,
	`titleBn` varchar(180) NOT NULL,
	`tagBn` varchar(80) NOT NULL,
	`locationBn` varchar(180) NOT NULL,
	`ratingLabel` varchar(80),
	`imageUrl` text NOT NULL,
	`ctaLabelBn` varchar(80) NOT NULL DEFAULT 'বিস্তারিত দেখুন',
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`startsAt` timestamp,
	`endsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `featuredItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`districtBn` varchar(120) NOT NULL DEFAULT 'শেরপুর',
	`upazilaBn` varchar(120),
	`slug` varchar(120) NOT NULL,
	`latitude` varchar(32),
	`longitude` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`),
	CONSTRAINT `locations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `mediaAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`publicUrl` text NOT NULL,
	`altTextBn` varchar(240),
	`mimeType` varchar(100) NOT NULL,
	`bytes` int,
	`status` enum('pending','ready','archived') NOT NULL DEFAULT 'ready',
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mediaAssets_id` PRIMARY KEY(`id`),
	CONSTRAINT `mediaAssets_fileKey_unique` UNIQUE(`fileKey`)
);
--> statement-breakpoint
CREATE TABLE `notices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`titleBn` varchar(220) NOT NULL,
	`bodyBn` text NOT NULL,
	`sourceBn` varchar(180),
	`severity` enum('info','important','urgent') NOT NULL DEFAULT 'info',
	`status` enum('draft','published','expired','archived') NOT NULL DEFAULT 'published',
	`publishAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notices_id` PRIMARY KEY(`id`),
	CONSTRAINT `notices_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `serviceListings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`locationId` int NOT NULL,
	`slug` varchar(160) NOT NULL,
	`nameBn` varchar(180) NOT NULL,
	`nameEn` varchar(180),
	`shortDescriptionBn` text,
	`addressBn` text,
	`phone` varchar(32),
	`hoursBn` varchar(160),
	`imageUrl` text,
	`mapUrl` text,
	`status` enum('draft','published','suspended','archived') NOT NULL DEFAULT 'published',
	`isVerified` boolean NOT NULL DEFAULT false,
	`lastVerifiedAt` timestamp,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serviceListings_id` PRIMARY KEY(`id`),
	CONSTRAINT `serviceListings_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `featuredItems` ADD CONSTRAINT `featuredItems_serviceId_serviceListings_id_fk` FOREIGN KEY (`serviceId`) REFERENCES `serviceListings`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `serviceListings` ADD CONSTRAINT `serviceListings_categoryId_categories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `serviceListings` ADD CONSTRAINT `serviceListings_locationId_locations_id_fk` FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `categories_active_order_idx` ON `categories` (`isActive`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `featured_active_order_idx` ON `featuredItems` (`isActive`,`sortOrder`,`startsAt`,`endsAt`);--> statement-breakpoint
CREATE INDEX `media_status_idx` ON `mediaAssets` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `notice_status_publish_idx` ON `notices` (`status`,`publishAt`,`expiresAt`);--> statement-breakpoint
CREATE INDEX `service_directory_idx` ON `serviceListings` (`status`,`categoryId`,`locationId`);--> statement-breakpoint
CREATE INDEX `service_verified_idx` ON `serviceListings` (`isVerified`,`lastVerifiedAt`);
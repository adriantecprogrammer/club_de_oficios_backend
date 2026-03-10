CREATE TABLE `users` (
  `id` text PRIMARY KEY NOT NULL,
  `first_name` text,
  `last_name` text,
  `email` text,
  `password_hash` text,
  `phone` text,
  `role` text,
  `avatar_url` text,
  `is_active` integer,
  `created_at` text,
  `updated_at` text,
  `deleted_at` text
);

CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);

CREATE TABLE `provider_profiles` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text REFERENCES `users`(`id`),
  `bio` text,
  `experience_years` integer,
  `verified` integer,
  `rating_avg` real,
  `rating_count` integer,
  `completed_jobs` integer,
  `created_at` text,
  `updated_at` text
);

CREATE UNIQUE INDEX `provider_profiles_user_id_unique` ON `provider_profiles` (`user_id`);

CREATE TABLE `categories` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text,
  `description` text,
  `created_at` text
);

CREATE TABLE `provider_categories` (
  `provider_id` text NOT NULL REFERENCES `provider_profiles`(`id`),
  `category_id` text NOT NULL REFERENCES `categories`(`id`),
  PRIMARY KEY (`provider_id`, `category_id`)
);

CREATE TABLE `service_requests` (
  `id` text PRIMARY KEY NOT NULL,
  `client_id` text REFERENCES `users`(`id`),
  `provider_id` text REFERENCES `provider_profiles`(`id`),
  `category_id` text REFERENCES `categories`(`id`),
  `title` text,
  `description` text,
  `location_address` text,
  `location_lat` real,
  `location_lng` real,
  `status` text,
  `scheduled_at` text,
  `estimated_price` real,
  `final_price` real,
  `created_at` text,
  `updated_at` text,
  `completed_at` text
);

CREATE TABLE `reviews` (
  `id` text PRIMARY KEY NOT NULL,
  `request_id` text REFERENCES `service_requests`(`id`),
  `client_id` text REFERENCES `users`(`id`),
  `provider_id` text REFERENCES `provider_profiles`(`id`),
  `rating` integer,
  `comment` text,
  `created_at` text
);

CREATE UNIQUE INDEX `reviews_request_id_unique` ON `reviews` (`request_id`);

CREATE TABLE `achievements` (
  `id` text PRIMARY KEY NOT NULL,
  `provider_id` text REFERENCES `provider_profiles`(`id`),
  `title` text,
  `description` text,
  `issued_at` text
);

CREATE TABLE `conversations` (
  `id` text PRIMARY KEY NOT NULL,
  `request_id` text REFERENCES `service_requests`(`id`),
  `client_id` text REFERENCES `users`(`id`),
  `provider_id` text REFERENCES `provider_profiles`(`id`),
  `created_at` text
);

CREATE TABLE `messages` (
  `id` text PRIMARY KEY NOT NULL,
  `conversation_id` text REFERENCES `conversations`(`id`),
  `sender_id` text REFERENCES `users`(`id`),
  `content` text,
  `read_at` text,
  `created_at` text
);

CREATE TABLE `payments` (
  `id` text PRIMARY KEY NOT NULL,
  `request_id` text REFERENCES `service_requests`(`id`),
  `client_id` text REFERENCES `users`(`id`),
  `provider_id` text REFERENCES `provider_profiles`(`id`),
  `amount` real,
  `platform_fee` real,
  `status` text,
  `payment_provider` text,
  `provider_reference_id` text,
  `created_at` text,
  `paid_at` text
);

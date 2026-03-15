import { sqliteTable, AnySQLiteColumn, text, foreignKey, real, primaryKey, uniqueIndex, integer } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const categories = sqliteTable("categories", {
	id: text().primaryKey().notNull(),
	name: text(),
	description: text(),
	createdAt: text("created_at"),
});

export const payments = sqliteTable("payments", {
	id: text().primaryKey().notNull(),
	requestId: text("request_id").references(() => serviceRequests.id),
	clientId: text("client_id").references(() => users.id),
	providerId: text("provider_id").references(() => providerProfiles.id),
	amount: real(),
	platformFee: real("platform_fee"),
	status: text(),
	paymentProvider: text("payment_provider"),
	providerReferenceId: text("provider_reference_id"),
	createdAt: text("created_at"),
	paidAt: text("paid_at"),
});

export const providerCategories = sqliteTable("provider_categories", {
	providerId: text("provider_id").notNull().references(() => providerProfiles.id),
	categoryId: text("category_id").notNull().references(() => categories.id),
},
(table) => [
	primaryKey({ columns: [table.providerId, table.categoryId], name: "provider_categories_provider_id_category_id_pk"})
]);

export const providerProfiles = sqliteTable("provider_profiles", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").references(() => users.id),
	bio: text(),
	experienceYears: integer("experience_years"),
	verified: integer(),
	ratingAvg: real("rating_avg"),
	ratingCount: integer("rating_count"),
	completedJobs: integer("completed_jobs"),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
},
(table) => [
	uniqueIndex("provider_profiles_user_id_unique").on(table.userId),
]);

export const reviews = sqliteTable("reviews", {
	id: text().primaryKey().notNull(),
	requestId: text("request_id").references(() => serviceRequests.id),
	clientId: text("client_id").references(() => users.id),
	providerId: text("provider_id").references(() => providerProfiles.id),
	rating: integer(),
	comment: text(),
	createdAt: text("created_at"),
},
(table) => [
	uniqueIndex("reviews_request_id_unique").on(table.requestId),
]);

export const serviceRequests = sqliteTable("service_requests", {
	id: text().primaryKey().notNull(),
	clientId: text("client_id").references(() => users.id),
	providerId: text("provider_id").references(() => providerProfiles.id),
	categoryId: text("category_id").references(() => categories.id),
	title: text(),
	description: text(),
	locationAddress: text("location_address"),
	locationLat: real("location_lat"),
	locationLng: real("location_lng"),
	status: text(),
	scheduledAt: text("scheduled_at"),
	estimatedPrice: real("estimated_price"),
	finalPrice: real("final_price"),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
	completedAt: text("completed_at"),
});

export const users = sqliteTable("users", {
	id: text().primaryKey().notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	email: text(),
	passwordHash: text("password_hash"),
	phone: text(),
	role: text(),
	avatarUrl: text("avatar_url"),
	isActive: integer("is_active"),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
	deletedAt: text("deleted_at"),
},
(table) => [
	uniqueIndex("users_email_unique").on(table.email),
]);


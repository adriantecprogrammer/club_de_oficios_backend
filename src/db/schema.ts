import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  phone: text("phone"),
  role: text("role"),
  avatarUrl: text("avatar_url"),
  isActive: integer("is_active"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const providerProfiles = sqliteTable("provider_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .unique()
    .references(() => users.id),
  bio: text("bio"),
  experienceYears: integer("experience_years"),
  verified: integer("verified"),
  ratingAvg: real("rating_avg"),
  ratingCount: integer("rating_count"),
  completedJobs: integer("completed_jobs"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  createdAt: text("created_at"),
});

export const providerCategories = sqliteTable(
  "provider_categories",
  {
    providerId: text("provider_id")
      .notNull()
      .references(() => providerProfiles.id),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
  },
  (table) => [
    primaryKey({ columns: [table.providerId, table.categoryId] }),
  ]
);

export const serviceRequests = sqliteTable("service_requests", {
  id: text("id").primaryKey(),
  clientId: text("client_id").references(() => users.id),
  providerId: text("provider_id").references(() => providerProfiles.id),
  categoryId: text("category_id").references(() => categories.id),
  title: text("title"),
  description: text("description"),
  locationAddress: text("location_address"),
  locationLat: real("location_lat"),
  locationLng: real("location_lng"),
  status: text("status"),
  scheduledAt: text("scheduled_at"),
  estimatedPrice: real("estimated_price"),
  finalPrice: real("final_price"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
  completedAt: text("completed_at"),
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  requestId: text("request_id")
    .unique()
    .references(() => serviceRequests.id),
  clientId: text("client_id").references(() => users.id),
  providerId: text("provider_id").references(() => providerProfiles.id),
  rating: integer("rating"),
  comment: text("comment"),
  createdAt: text("created_at"),
});

export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey(),
  providerId: text("provider_id").references(() => providerProfiles.id),
  title: text("title"),
  description: text("description"),
  issuedAt: text("issued_at"),
});

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  requestId: text("request_id").references(() => serviceRequests.id),
  clientId: text("client_id").references(() => users.id),
  providerId: text("provider_id").references(() => providerProfiles.id),
  createdAt: text("created_at"),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").references(() => conversations.id),
  senderId: text("sender_id").references(() => users.id),
  content: text("content"),
  readAt: text("read_at"),
  createdAt: text("created_at"),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  requestId: text("request_id").references(() => serviceRequests.id),
  clientId: text("client_id").references(() => users.id),
  providerId: text("provider_id").references(() => providerProfiles.id),
  amount: real("amount"),
  platformFee: real("platform_fee"),
  status: text("status"),
  paymentProvider: text("payment_provider"),
  providerReferenceId: text("provider_reference_id"),
  createdAt: text("created_at"),
  paidAt: text("paid_at"),
});

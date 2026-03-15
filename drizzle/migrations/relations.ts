import { relations } from "drizzle-orm/relations";
import { providerProfiles, payments, users, serviceRequests, categories, providerCategories, reviews } from "./schema";

export const paymentsRelations = relations(payments, ({one}) => ({
	providerProfile: one(providerProfiles, {
		fields: [payments.providerId],
		references: [providerProfiles.id]
	}),
	user: one(users, {
		fields: [payments.clientId],
		references: [users.id]
	}),
	serviceRequest: one(serviceRequests, {
		fields: [payments.requestId],
		references: [serviceRequests.id]
	}),
}));

export const providerProfilesRelations = relations(providerProfiles, ({one, many}) => ({
	payments: many(payments),
	providerCategories: many(providerCategories),
	user: one(users, {
		fields: [providerProfiles.userId],
		references: [users.id]
	}),
	reviews: many(reviews),
	serviceRequests: many(serviceRequests),
}));

export const usersRelations = relations(users, ({many}) => ({
	payments: many(payments),
	providerProfiles: many(providerProfiles),
	reviews: many(reviews),
	serviceRequests: many(serviceRequests),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({one, many}) => ({
	payments: many(payments),
	reviews: many(reviews),
	category: one(categories, {
		fields: [serviceRequests.categoryId],
		references: [categories.id]
	}),
	providerProfile: one(providerProfiles, {
		fields: [serviceRequests.providerId],
		references: [providerProfiles.id]
	}),
	user: one(users, {
		fields: [serviceRequests.clientId],
		references: [users.id]
	}),
}));

export const providerCategoriesRelations = relations(providerCategories, ({one}) => ({
	category: one(categories, {
		fields: [providerCategories.categoryId],
		references: [categories.id]
	}),
	providerProfile: one(providerProfiles, {
		fields: [providerCategories.providerId],
		references: [providerProfiles.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	providerCategories: many(providerCategories),
	serviceRequests: many(serviceRequests),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	providerProfile: one(providerProfiles, {
		fields: [reviews.providerId],
		references: [providerProfiles.id]
	}),
	user: one(users, {
		fields: [reviews.clientId],
		references: [users.id]
	}),
	serviceRequest: one(serviceRequests, {
		fields: [reviews.requestId],
		references: [serviceRequests.id]
	}),
}));
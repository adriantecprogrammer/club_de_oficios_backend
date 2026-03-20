import { eq, and } from 'drizzle-orm'
import { providerProfiles, users, providerCategories, categories } from '../db/schema'
import type { Database } from '../db/client'

export function getAllProviders(db: Database) {
  return db.select().from(providerProfiles)
}

export function getProviderById(db: Database, id: string) {
  return db.select().from(providerProfiles).where(eq(providerProfiles.id, id))
}

export async function getProviderWithUser(db: Database, id: string) {
  const profile = await db
    .select()
    .from(providerProfiles)
    .where(eq(providerProfiles.id, id))

  if (profile.length === 0) return null

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, profile[0].userId!))

  return { ...user[0], provider: profile[0] }
}

export async function createProvider(
  db: Database,
  data: {
    id: string
    userId: string
    bio?: string
    experienceYears?: number
    verified?: number
  }
) {
  const now = new Date().toISOString()

  await db.insert(providerProfiles).values({
    id: data.id,
    userId: data.userId,
    bio: data.bio,
    experienceYears: data.experienceYears,
    verified: data.verified ?? 0,
    ratingAvg: 0,
    ratingCount: 0,
    completedJobs: 0,
    createdAt: now,
    updatedAt: now,
  })
}

export async function addCategoriesToProvider(db: Database, providerId: string, categoryIds: string[]) {
  const values = categoryIds.map((categoryId) => ({
    providerId,
    categoryId,
  }))

  await db.insert(providerCategories).values(values).onConflictDoNothing()
}

export function getProviderCategories(db: Database, providerId: string) {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      description: categories.description,
      createdAt: categories.createdAt,
    })
    .from(providerCategories)
    .innerJoin(categories, eq(providerCategories.categoryId, categories.id))
    .where(eq(providerCategories.providerId, providerId))
}

export async function removeProviderCategory(db: Database, providerId: string, categoryId: string) {
  await db
    .delete(providerCategories)
    .where(
      and(
        eq(providerCategories.providerId, providerId),
        eq(providerCategories.categoryId, categoryId)
      )
    )
}

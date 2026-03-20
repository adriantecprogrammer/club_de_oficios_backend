import { eq } from 'drizzle-orm'
import { categories } from '../db/schema'
import type { Database } from '../db/client'

export function getAllCategories(db: Database) {
  return db.select().from(categories)
}

export function getCategoryById(db: Database, id: string) {
  return db.select().from(categories).where(eq(categories.id, id))
}

export async function createCategory(
  db: Database,
  data: { id: string; name: string; description?: string }
) {
  const now = new Date().toISOString()

  await db.insert(categories).values({
    id: data.id,
    name: data.name,
    description: data.description,
    createdAt: now,
  })
}

export async function updateCategory(
  db: Database,
  id: string,
  data: { name?: string; description?: string },
  existing: { name: string | null; description: string | null }
) {
  await db
    .update(categories)
    .set({
      name: data.name ?? existing.name,
      description: data.description ?? existing.description,
    })
    .where(eq(categories.id, id))
}

export async function deleteCategory(db: Database, id: string) {
  await db.delete(categories).where(eq(categories.id, id))
}

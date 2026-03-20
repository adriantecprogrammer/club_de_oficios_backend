import { eq } from 'drizzle-orm'
import { users } from '../db/schema'
import type { Database } from '../db/client'

export function getAllUsers(db: Database) {
  return db.select().from(users)
}

export function getUserById(db: Database, id: string) {
  return db.select().from(users).where(eq(users.id, id))
}

export async function createUser(
  db: Database,
  data: {
    id: string
    firstName: string
    lastName: string
    email: string
    passwordHash: string
    phone?: string
    role: 'client' | 'provider'
  }
) {
  const now = new Date().toISOString()

  await db.insert(users).values({
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    passwordHash: data.passwordHash,
    phone: data.phone,
    role: data.role,
    isActive: 1,
    createdAt: now,
    updatedAt: now,
  })
}

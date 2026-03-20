import { eq } from 'drizzle-orm'
import { serviceRequests } from '../db/schema'
import type { Database } from '../db/client'

export function getRequestById(db: Database, id: string) {
  return db.select().from(serviceRequests).where(eq(serviceRequests.id, id))
}

export function getRequestsByClient(db: Database, clientId: string) {
  return db.select().from(serviceRequests).where(eq(serviceRequests.clientId, clientId))
}

export function getJobsByProvider(db: Database, providerId: string) {
  return db.select().from(serviceRequests).where(eq(serviceRequests.providerId, providerId))
}

export async function createRequest(
  db: Database,
  data: {
    id: string
    clientId: string
    categoryId?: string
    title: string
    description?: string
    locationAddress?: string
    locationLat?: number
    locationLng?: number
    estimatedPrice?: number
  }
) {
  const now = new Date().toISOString()

  await db.insert(serviceRequests).values({
    id: data.id,
    clientId: data.clientId,
    categoryId: data.categoryId,
    title: data.title,
    description: data.description,
    locationAddress: data.locationAddress,
    locationLat: data.locationLat,
    locationLng: data.locationLng,
    estimatedPrice: data.estimatedPrice,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  })
}

export async function assignProvider(db: Database, requestId: string, providerId: string) {
  const now = new Date().toISOString()

  await db
    .update(serviceRequests)
    .set({
      providerId,
      status: 'assigned',
      updatedAt: now,
    })
    .where(eq(serviceRequests.id, requestId))
}

import { eq } from 'drizzle-orm'
import { serviceRequests } from '../db/schema'
import type { Database } from '../db/client'
import type { RequestStatus } from '../schemas/common'

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
    providerId: string
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
    providerId: data.providerId,
    categoryId: data.categoryId,
    title: data.title,
    description: data.description,
    locationAddress: data.locationAddress,
    locationLat: data.locationLat,
    locationLng: data.locationLng,
    estimatedPrice: data.estimatedPrice,
    status: 'pending' satisfies RequestStatus,
    createdAt: now,
    updatedAt: now,
  })
}

export async function updateRequestStatus(db: Database, requestId: string, status: RequestStatus) {
  const now = new Date().toISOString()

  await db
    .update(serviceRequests)
    .set({
      status,
      updatedAt: now,
      ...(status === 'completed' ? { completedAt: now } : {}),
    })
    .where(eq(serviceRequests.id, requestId))
}

export async function acceptRequest(db: Database, requestId: string, providerId: string) {
  const request = await getRequestById(db, requestId)

  if (request.length === 0) {
    throw new Error('REQUEST_NOT_FOUND')
  }

  if (request[0].providerId !== providerId) {
    throw new Error('NOT_ASSIGNED_PROVIDER')
  }

  if (request[0].status !== 'pending') {
    throw new Error('REQUEST_NOT_PENDING')
  }

  await updateRequestStatus(db, requestId, 'assigned')
}

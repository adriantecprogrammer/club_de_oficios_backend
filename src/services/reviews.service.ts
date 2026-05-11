import { eq } from 'drizzle-orm'
import { reviews } from '../db/schema'
import type { Database } from '../db/client'

export async function createReview(
  db: Database,
  data: {
    requestId: string
    clientId: string
    providerId: string
    rating: number
    comment?: string
  }
) {
  const now = new Date().toISOString()

  await db.insert(reviews).values({
    id: crypto.randomUUID(),
    requestId: data.requestId,
    clientId: data.clientId,
    providerId: data.providerId,
    rating: data.rating,
    comment: data.comment,
    createdAt: now,
  })
}

export function getReviewsByProviderId(db: Database, providerId: string) {
  return db.select().from(reviews).where(eq(reviews.providerId, providerId))
}

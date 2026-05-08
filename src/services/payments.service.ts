import { eq } from 'drizzle-orm'
import { payments, serviceRequests } from '../db/schema'
import type { Database } from '../db/client'

export async function createPayment(
  db: Database,
  data: {
    requestId: string
    clientId: string
    providerId: string
    amount: number
    platformFee?: number
    paymentProvider?: string
    providerReferenceId?: string
  }
) {
  const now = new Date().toISOString()

  await db.insert(payments).values({
    id: crypto.randomUUID(),
    requestId: data.requestId,
    clientId: data.clientId,
    providerId: data.providerId,
    amount: data.amount,
    platformFee: data.platformFee,
    paymentProvider: data.paymentProvider,
    providerReferenceId: data.providerReferenceId,
    status: 'pending',
    createdAt: now,
  })

  await db
    .update(serviceRequests)
    .set({ status: 'paid', updatedAt: now })
    .where(eq(serviceRequests.id, data.requestId))
}

export function getPaymentByRequestId(db: Database, requestId: string) {
  return db.select().from(payments).where(eq(payments.requestId, requestId))
}

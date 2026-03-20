import { z } from '@hono/zod-openapi'

export const uuidSchema = z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' })

export const roleSchema = z.enum(['client', 'provider']).openapi({ example: 'client' })

export const phoneSchema = z.string()
  .regex(/^\+?[\d\s-]{10,15}$/)
  .optional()
  .openapi({ example: '+52 123 456 7890' })

export const priceSchema = z.number()
  .min(0)
  .max(1_000_000)
  .openapi({ example: 500.00 })

export const ratingSchema = z.number()
  .int()
  .min(1)
  .max(5)

export const requestStatusSchema = z.enum([
  'pending',
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
])

export const paymentStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
])

import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { uuidSchema, paymentStatusSchema } from '../schemas/common'
import { createPayment, getPaymentByRequestId } from '../services/payments.service'
import type { Database } from '../db/client'

type Env = {
  Bindings: CloudflareBindings
  Variables: { db: Database }
}

const paymentsRoutes = new OpenAPIHono<Env>()

// POST /process
const createPaymentRoute = createRoute({
  method: 'post',
  path: '/process',
  tags: ['Payments'],
  summary: 'Registrar un pago',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            requestId: uuidSchema,
            clientId: uuidSchema,
            providerId: uuidSchema,
            amount: z.number().min(0).openapi({ example: 1500.00 }),
            platformFee: z.number().min(0).optional().openapi({ example: 150.00 }),
            paymentProvider: z.string().optional().openapi({ example: 'stripe' }),
            providerReferenceId: z.string().optional().openapi({ example: 'pi_1234567890' }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Pago registrado exitosamente',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
})

paymentsRoutes.openapi(createPaymentRoute, async (c) => {
  const body = c.req.valid('json')
  const db = c.get('db')

  await createPayment(db, {
    requestId: body.requestId,
    clientId: body.clientId,
    providerId: body.providerId,
    amount: body.amount,
    platformFee: body.platformFee,
    paymentProvider: body.paymentProvider,
    providerReferenceId: body.providerReferenceId,
  })

  return c.json({ message: 'Pago registrado exitosamente' }, 201)
})

// GET /request/{id}
const getPaymentByRequestIdRoute = createRoute({
  method: 'get',
  path: '/request/{id}',
  tags: ['Payments'],
  summary: 'Consultar estado de un pago por ID de solicitud',
  request: {
    params: z.object({
      id: uuidSchema,
    }),
  },
  responses: {
    200: {
      description: 'Estado del pago encontrado',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            requestId: z.string().nullable(),
            clientId: z.string().nullable(),
            providerId: z.string().nullable(),
            amount: z.number().nullable(),
            platformFee: z.number().nullable(),
            status: paymentStatusSchema.nullable(),
            paymentProvider: z.string().nullable(),
            providerReferenceId: z.string().nullable(),
            createdAt: z.string().nullable(),
            paidAt: z.string().nullable(),
          }),
        },
      },
    },
    404: {
      description: 'Pago no encontrado',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
})

paymentsRoutes.openapi(getPaymentByRequestIdRoute, async (c) => {
  const { id } = c.req.valid('param')
  const db = c.get('db')

  const result = await getPaymentByRequestId(db, id)

  if (result.length === 0) {
    return c.json({ message: 'Pago no encontrado' }, 404)
  }

  return c.json(result[0], 200)
})

export default paymentsRoutes

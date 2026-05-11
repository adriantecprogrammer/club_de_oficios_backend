import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { uuidSchema, ratingSchema } from '../schemas/common'
import { createReview, getReviewsByProviderId } from '../services/reviews.service'
import type { Database } from '../db/client'

type Env = {
  Bindings: CloudflareBindings
  Variables: { db: Database }
}

const reviewsRoutes = new OpenAPIHono<Env>()

// POST /add
const createReviewRoute = createRoute({
  method: 'post',
  path: '/add',
  tags: ['Reviews'],
  summary: 'Publicar una reseña',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            requestId: uuidSchema,
            clientId: uuidSchema,
            providerId: uuidSchema,
            rating: ratingSchema.openapi({ example: 5 }),
            comment: z.string().max(500).optional().openapi({
              example: 'Excelente servicio, muy profesional y puntual',
            }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Reseña publicada exitosamente',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
})

reviewsRoutes.openapi(createReviewRoute, async (c) => {
  const body = c.req.valid('json')
  const db = c.get('db')

  await createReview(db, {
    requestId: body.requestId,
    clientId: body.clientId,
    providerId: body.providerId,
    rating: body.rating,
    comment: body.comment,
  })

  return c.json({ message: 'Reseña publicada exitosamente' }, 201)
})

// GET /:providerId
const getReviewsByProviderRoute = createRoute({
  method: 'get',
  path: '/{providerId}',
  tags: ['Reviews'],
  summary: 'Listar reseñas de un proveedor',
  request: {
    params: z.object({
      providerId: uuidSchema,
    }),
  },
  responses: {
    200: {
      description: 'Lista de reseñas del proveedor',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              id: z.string(),
              requestId: z.string().nullable(),
              clientId: z.string().nullable(),
              providerId: z.string().nullable(),
              rating: z.number().nullable(),
              comment: z.string().nullable(),
              createdAt: z.string().nullable(),
            })
          ),
        },
      },
    },
  },
})

reviewsRoutes.openapi(getReviewsByProviderRoute, async (c) => {
  const { providerId } = c.req.valid('param')
  const db = c.get('db')

  const result = await getReviewsByProviderId(db, providerId)

  return c.json(result, 200)
})

export default reviewsRoutes

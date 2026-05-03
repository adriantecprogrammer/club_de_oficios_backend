import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { uuidSchema, priceSchema, requestStatusSchema } from '../schemas/common'
import {
  getRequestById,
  getRequestsByClient,
  getJobsByProvider,
  createRequest,
  acceptRequest,
} from '../services/requests.service'
import type { Database } from '../db/client'

type Env = {
  Bindings: CloudflareBindings
  Variables: { db: Database }
}

const requestsRoutes = new OpenAPIHono<Env>()

// POST /new
const createRequestRoute = createRoute({
  method: 'post',
  path: '/new',
  tags: ['Service Requests'],
  summary: 'Crear una nueva solicitud de servicio',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            clientId: uuidSchema,
            providerId: uuidSchema,
            categoryId: uuidSchema.optional(),
            title: z.string().min(1).max(200).openapi({ example: 'Reparación de tubería' }),
            description: z.string().max(1000).optional().openapi({ example: 'Fuga en la cocina' }),
            locationAddress: z.string().max(300).optional().openapi({ example: 'Calle 123, Col. Centro' }),
            locationLat: z.number().min(-90).max(90).optional().openapi({ example: 19.4326 }),
            locationLng: z.number().min(-180).max(180).optional().openapi({ example: -99.1332 }),
            estimatedPrice: priceSchema.optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Solicitud de servicio creada exitosamente',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
})

requestsRoutes.openapi(createRequestRoute, async (c) => {
  const body = c.req.valid('json')
  const db = c.get('db')
  const id = crypto.randomUUID()

  await createRequest(db, {
    id,
    clientId: body.clientId,
    providerId: body.providerId,
    categoryId: body.categoryId,
    title: body.title,
    description: body.description,
    locationAddress: body.locationAddress,
    locationLat: body.locationLat,
    locationLng: body.locationLng,
    estimatedPrice: body.estimatedPrice,
  })

  return c.json({ message: 'Solicitud de servicio creada exitosamente' }, 201)
})

// GET /:id
const getRequestByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Service Requests'],
  summary: 'Obtener una solicitud de servicio por ID',
  request: {
    params: z.object({
      id: uuidSchema,
    }),
  },
  responses: {
    200: {
      description: 'Solicitud encontrada',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            clientId: z.string().nullable(),
            categoryId: z.string().nullable(),
            title: z.string().nullable(),
            description: z.string().nullable(),
            locationAddress: z.string().nullable(),
            locationLat: z.number().nullable(),
            locationLng: z.number().nullable(),
            estimatedPrice: z.number().nullable(),
            status: requestStatusSchema.nullable(),
            createdAt: z.string().nullable(),
            updatedAt: z.string().nullable(),
          }),
        },
      },
    },
    404: {
      description: 'Solicitud no encontrada',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
})

requestsRoutes.openapi(getRequestByIdRoute, async (c) => {
  const { id } = c.req.valid('param')
  const db = c.get('db')

  const request = await getRequestById(db, id)

  if (request.length === 0) {
    return c.json({ message: 'Solicitud no encontrada' }, 404)
  }

  return c.json(request[0], 200)
})

// GET /client/:clientId
const getRequestsByClientRoute = createRoute({
  method: 'get',
  path: '/client/{clientId}',
  tags: ['Service Requests'],
  summary: 'Listar solicitudes de servicio por cliente',
  request: {
    params: z.object({
      clientId: uuidSchema,
    }),
  },
  responses: {
    200: {
      description: 'Lista de solicitudes del cliente',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              id: z.string(),
              clientId: z.string().nullable(),
              providerId: z.string().nullable(),
              categoryId: z.string().nullable(),
              title: z.string().nullable(),
              description: z.string().nullable(),
              locationAddress: z.string().nullable(),
              estimatedPrice: z.number().nullable(),
              status: requestStatusSchema.nullable(),
              createdAt: z.string().nullable(),
              updatedAt: z.string().nullable(),
            })
          ),
        },
      },
    },
  },
})

requestsRoutes.openapi(getRequestsByClientRoute, async (c) => {
  const { clientId } = c.req.valid('param')
  const db = c.get('db')

  const requests = await getRequestsByClient(db, clientId)

  return c.json(requests, 200)
})

// PUT /{id}/accept
const acceptRequestRoute = createRoute({
  method: 'put',
  path: '/{id}/accept',
  tags: ['Service Requests'],
  summary: 'Proveedor acepta una solicitud de servicio',
  request: {
    params: z.object({
      id: uuidSchema,
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            providerId: uuidSchema,
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Solicitud aceptada exitosamente',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: {
      description: 'Solicitud no encontrada',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    403: {
      description: 'Proveedor no autorizado o solicitud no pendiente',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
})

requestsRoutes.openapi(acceptRequestRoute, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')
  const db = c.get('db')

  try {
    await acceptRequest(db, id, body.providerId)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'UNKNOWN_ERROR'
    const statusMap: Record<string, number> = {
      REQUEST_NOT_FOUND: 404,
      NOT_ASSIGNED_PROVIDER: 403,
      REQUEST_NOT_PENDING: 403,
    }
    return c.json({ message }, statusMap[message] ?? 400)
  }

  return c.json({ message: 'Solicitud aceptada exitosamente' }, 200)
})

// GET /provider/:providerId/jobs
const getJobsByProviderRoute = createRoute({
  method: 'get',
  path: '/provider/{providerId}/jobs',
  tags: ['Service Requests'],
  summary: 'Listar trabajos asignados a un proveedor',
  request: {
    params: z.object({
      providerId: uuidSchema,
    }),
  },
  responses: {
    200: {
      description: 'Lista de trabajos del proveedor',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              id: z.string(),
              clientId: z.string().nullable(),
              providerId: z.string().nullable(),
              categoryId: z.string().nullable(),
              title: z.string().nullable(),
              description: z.string().nullable(),
              locationAddress: z.string().nullable(),
              estimatedPrice: z.number().nullable(),
              finalPrice: z.number().nullable(),
              status: requestStatusSchema.nullable(),
              createdAt: z.string().nullable(),
              updatedAt: z.string().nullable(),
              completedAt: z.string().nullable(),
            })
          ),
        },
      },
    },
  },
})

requestsRoutes.openapi(getJobsByProviderRoute, async (c) => {
  const { providerId } = c.req.valid('param')
  const db = c.get('db')

  const jobs = await getJobsByProvider(db, providerId)

  return c.json(jobs, 200)
})

export default requestsRoutes

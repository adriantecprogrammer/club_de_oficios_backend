import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { uuidSchema, priceSchema } from '../schemas/common'
import {
  getRequestById,
  getRequestsByClient,
  getJobsByProvider,
  createRequest,
  assignProvider,
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
            id: uuidSchema,
            clientId: uuidSchema,
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

  await createRequest(db, {
    id: body.id,
    clientId: body.clientId,
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
            status: z.string().nullable(),
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
              status: z.string().nullable(),
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

// PUT /{id}/assign
const assignProviderRoute = createRoute({
  method: 'put',
  path: '/{id}/assign',
  tags: ['Service Requests'],
  summary: 'Asignar un proveedor a una solicitud de servicio',
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
      description: 'Proveedor asignado exitosamente',
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
  },
})

requestsRoutes.openapi(assignProviderRoute, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')
  const db = c.get('db')

  const existing = await getRequestById(db, id)

  if (existing.length === 0) {
    return c.json({ message: 'Solicitud no encontrada' }, 404)
  }

  await assignProvider(db, id, body.providerId)

  return c.json({ message: 'Proveedor asignado exitosamente' }, 200)
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
              status: z.string().nullable(),
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

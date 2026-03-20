import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { eq } from 'drizzle-orm'
import { createDb } from '../db/client'
import { serviceRequests } from '../db/schema'

const requestsRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>()

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
            id: z.string().openapi({ example: 'uuid-789' }),
            client_id: z.string().openapi({ example: 'uuid-123' }),
            category_id: z.string().optional().openapi({ example: 'uuid-cat-1' }),
            title: z.string().openapi({ example: 'Reparación de tubería' }),
            description: z.string().optional().openapi({ example: 'Fuga en la cocina' }),
            location_address: z.string().optional().openapi({ example: 'Calle 123, Col. Centro' }),
            location_lat: z.number().optional().openapi({ example: 19.4326 }),
            location_lng: z.number().optional().openapi({ example: -99.1332 }),
            estimated_price: z.number().optional().openapi({ example: 500.0 }),
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
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN)

  const now = new Date().toISOString()

  await db.insert(serviceRequests).values({
    id: body.id,
    clientId: body.client_id,
    categoryId: body.category_id,
    title: body.title,
    description: body.description,
    locationAddress: body.location_address,
    locationLat: body.location_lat,
    locationLng: body.location_lng,
    estimatedPrice: body.estimated_price,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
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
      id: z.string().openapi({ example: 'uuid-789' }),
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
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN)

  const request = await db.select().from(serviceRequests).where(eq(serviceRequests.id, id))

  if (request.length === 0) {
    return c.json({ message: 'Solicitud no encontrada' }, 404)
  }

  return c.json(request[0], 200)
})

// GET /client/:client_id — Listar solicitudes por cliente
const getRequestsByClientRoute = createRoute({
  method: 'get',
  path: '/client/{client_id}',
  tags: ['Service Requests'],
  summary: 'Listar solicitudes de servicio por cliente',
  request: {
    params: z.object({
      client_id: z.string().openapi({ example: 'uuid-123' }),
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
  const { client_id } = c.req.valid('param')
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN)

  const requests = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.clientId, client_id))

  return c.json(requests, 200)
})

// PUT /{id}/assign — Asignar proveedor a una solicitud
const assignProviderRoute = createRoute({
  method: 'put',
  path: '/{id}/assign',
  tags: ['Service Requests'],
  summary: 'Asignar un proveedor a una solicitud de servicio',
  request: {
    params: z.object({
      id: z.string().openapi({ example: 'uuid-789' }),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            provider_id: z.string().openapi({ example: 'p001' }),
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
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN)

  const existing = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.id, id))

  if (existing.length === 0) {
    return c.json({ message: 'Solicitud no encontrada' }, 404)
  }

  const now = new Date().toISOString()

  await db
    .update(serviceRequests)
    .set({
      providerId: body.provider_id,
      status: 'assigned',
      updatedAt: now,
    })
    .where(eq(serviceRequests.id, id))

  return c.json({ message: 'Proveedor asignado exitosamente' }, 200)
})

// GET /provider/:provider_id/jobs — Listar trabajos asignados a un proveedor
const getJobsByProviderRoute = createRoute({
  method: 'get',
  path: '/provider/{provider_id}/jobs',
  tags: ['Service Requests'],
  summary: 'Listar trabajos asignados a un proveedor',
  request: {
    params: z.object({
      provider_id: z.string().openapi({ example: 'p001' }),
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
  const { provider_id } = c.req.valid('param')
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN)

  const jobs = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.providerId, provider_id))

  return c.json(jobs, 200)
})

export default requestsRoutes

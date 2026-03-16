import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { eq } from 'drizzle-orm'
import { createDb } from '../db/client'
import { providerProfiles, users } from '../db/schema'

const providersRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>()

// POST /create
const createProviderRoute = createRoute({
  method: 'post',
  path: '/create',
  tags: ['Providers'],
  summary: 'Crear un perfil de proveedor',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            id: z.string().openapi({ example: 'uuid-456' }),
            user_id: z.string().openapi({ example: 'uuid-123' }),
            bio: z.string().optional().openapi({ example: 'Plomero con 10 años de experiencia' }),
            experience_years: z.number().optional().openapi({ example: 10 }),
            verified: z.number().optional().openapi({ example: 0 }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Perfil de proveedor creado exitosamente',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
})

providersRoutes.openapi(createProviderRoute, async (c) => {
  const body = c.req.valid('json')
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN)

  const now = new Date().toISOString()

  await db.insert(providerProfiles).values({
    id: body.id,
    userId: body.user_id,
    bio: body.bio,
    experienceYears: body.experience_years,
    verified: body.verified ?? 0,
    ratingAvg: 0,
    ratingCount: 0,
    completedJobs: 0,
    createdAt: now,
    updatedAt: now,
  })

  return c.json({ message: 'Perfil de proveedor creado exitosamente' }, 201)
})

// GET /all
const getAllProvidersRoute = createRoute({
  method: 'get',
  path: '/all',
  tags: ['Providers'],
  summary: 'Obtener todos los perfiles de proveedores',
  responses: {
    200: {
      description: 'Lista de perfiles de proveedores',
      content: {
        'application/json': {
          schema: z.array(z.object({
            id: z.string(),
            userId: z.string().nullable(),
            bio: z.string().nullable(),
            experienceYears: z.number().nullable(),
            verified: z.number().nullable(),
            ratingAvg: z.number().nullable(),
            ratingCount: z.number().nullable(),
            completedJobs: z.number().nullable(),
            createdAt: z.string().nullable(),
            updatedAt: z.string().nullable(),
          })),
        },
      },
    },
  },
})

providersRoutes.openapi(getAllProvidersRoute, async (c) => {
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN)
  const allProfiles = await db.select().from(providerProfiles)
  return c.json(allProfiles, 200)
})

// GET /:id
const getProviderByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Providers'],
  summary: 'Obtener un perfil de proveedor por ID (incluye datos de usuario)',
  request: {
    params: z.object({
      id: z.string().openapi({ example: 'uuid-456' }),
    }),
  },
  responses: {
    200: {
      description: 'Perfil de proveedor encontrado',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            firstName: z.string().nullable(),
            lastName: z.string().nullable(),
            email: z.string(),
            phone: z.string().nullable(),
            role: z.string().nullable(),
            provider: z.object({
              id: z.string(),
              userId: z.string().nullable(),
              bio: z.string().nullable(),
              experienceYears: z.number().nullable(),
              verified: z.number().nullable(),
              ratingAvg: z.number().nullable(),
              ratingCount: z.number().nullable(),
              completedJobs: z.number().nullable(),
              createdAt: z.string().nullable(),
              updatedAt: z.string().nullable(),
            }),
          }),
        },
      },
    },
    404: {
      description: 'Perfil de proveedor no encontrado',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
})

providersRoutes.openapi(getProviderByIdRoute, async (c) => {
  const { id } = c.req.valid('param')
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN)

  const profile = await db
    .select()
    .from(providerProfiles)
    .where(eq(providerProfiles.id, id))

  if (profile.length === 0) {
    return c.json({ message: 'Perfil de proveedor no encontrado' }, 404)
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, profile[0].userId!))

  return c.json({ ...user[0], provider: profile[0] }, 200)
})

export default providersRoutes

import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { eq } from 'drizzle-orm'
import { createDb } from '../db/client'
import { users } from '../db/schema'

const usersRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>()

// POST /register
const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  tags: ['Users'],
  summary: 'Registrar un nuevo usuario',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            id: z.string().openapi({ example: 'uuid-123' }),
            first_name: z.string().openapi({ example: 'Juan' }),
            last_name: z.string().openapi({ example: 'Pérez' }),
            email: z.string().email().openapi({ example: 'juan@email.com' }),
            password_hash: z.string().openapi({ example: 'hashed_password' }),
            phone: z.string().optional().openapi({ example: '+52 123 456 7890' }),
            role: z.string().openapi({ example: 'client' }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Usuario registrado exitosamente',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
})

usersRoutes.openapi(registerRoute, async (c) => {
  const body = c.req.valid('json')
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN)

  const now = new Date().toISOString()

  await db.insert(users).values({
    id: body.id,
    firstName: body.first_name,
    lastName: body.last_name,
    email: body.email,
    passwordHash: body.password_hash,
    phone: body.phone,
    role: body.role,
    isActive: 1,
    createdAt: now,
    updatedAt: now,
  })

  return c.json({ message: 'Usuario registrado exitosamente' }, 201)
})

// GET /all
const getAllUsersRoute = createRoute({
  method: 'get',
  path: '/all',
  tags: ['Users'],
  summary: 'Obtener todos los usuarios',
  responses: {
    200: {
      description: 'Lista de usuarios',
      content: {
        'application/json': {
          schema: z.array(z.object({
            id: z.string(),
            firstName: z.string().nullable(),
            lastName: z.string().nullable(),
            email: z.string(),
            phone: z.string().nullable(),
            role: z.string().nullable(),
            isActive: z.number().nullable(),
            createdAt: z.string().nullable(),
            updatedAt: z.string().nullable(),
          })),
        },
      },
    },
  },
})

usersRoutes.openapi(getAllUsersRoute, async (c) => {
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN)
  const allUsers = await db.select().from(users)
  return c.json(allUsers, 200)
})

// GET /:id
const getUserByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Users'],
  summary: 'Obtener un usuario por ID',
  request: {
    params: z.object({
      id: z.string().openapi({ example: 'uuid-123' }),
    }),
  },
  responses: {
    200: {
      description: 'Usuario encontrado',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            firstName: z.string().nullable(),
            lastName: z.string().nullable(),
            email: z.string(),
            phone: z.string().nullable(),
            role: z.string().nullable(),
            isActive: z.number().nullable(),
            createdAt: z.string().nullable(),
            updatedAt: z.string().nullable(),
          }),
        },
      },
    },
    404: {
      description: 'Usuario no encontrado',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
})

usersRoutes.openapi(getUserByIdRoute, async (c) => {
  const { id } = c.req.valid('param')
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN)

  const user = await db.select().from(users).where(eq(users.id, id))

  if (user.length === 0) {
    return c.json({ message: 'Usuario no encontrado' }, 404)
  }

  return c.json(user[0], 200)
})

export default usersRoutes

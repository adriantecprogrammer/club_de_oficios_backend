import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { uuidSchema, roleSchema, phoneSchema } from '../schemas/common'
import { getAllUsers, getUserById, createUser } from '../services/users.service'
import type { Database } from '../db/client'

type Env = {
  Bindings: CloudflareBindings
  Variables: { db: Database }
}

const usersRoutes = new OpenAPIHono<Env>()

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
            id: uuidSchema,
            firstName: z.string().min(1).max(100).openapi({ example: 'Juan' }),
            lastName: z.string().min(1).max(100).openapi({ example: 'Pérez' }),
            email: z.string().email().openapi({ example: 'juan@email.com' }),
            passwordHash: z.string().min(1).openapi({ example: 'hashed_password' }),
            phone: phoneSchema,
            role: roleSchema,
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
  const db = c.get('db')

  await createUser(db, {
    id: body.id,
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    passwordHash: body.passwordHash,
    phone: body.phone,
    role: body.role,
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
  const db = c.get('db')
  const allUsers = await getAllUsers(db)
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
      id: uuidSchema,
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
  const db = c.get('db')

  const user = await getUserById(db, id)

  if (user.length === 0) {
    return c.json({ message: 'Usuario no encontrado' }, 404)
  }

  return c.json(user[0], 200)
})

export default usersRoutes

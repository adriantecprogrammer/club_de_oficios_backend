import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { uuidSchema } from '../schemas/common'
import {
  getAllProviders,
  getProviderById,
  getProviderWithUser,
  createProvider,
  addCategoriesToProvider,
  getProviderCategories,
  removeProviderCategory,
  getProvidersByCategoryId,
} from '../services/providers.service'
import type { Database } from '../db/client'

type Env = {
  Bindings: CloudflareBindings
  Variables: { db: Database }
}

const providersRoutes = new OpenAPIHono<Env>()

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
            userId: uuidSchema,
            bio: z.string().max(500).optional().openapi({ example: 'Plomero con 10 años de experiencia' }),
            experienceYears: z.number().int().min(0).max(50).optional().openapi({ example: 10 }),
            verified: z.number().int().min(0).max(1).optional().openapi({ example: 0 }),
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
          schema: z.object({ message: z.string(), id: z.string() }),
        },
      },
    },
  },
})

providersRoutes.openapi(createProviderRoute, async (c) => {
  const body = c.req.valid('json')
  const db = c.get('db')

  const providerId = await createProvider(db, {
    userId: body.userId,
    bio: body.bio,
    experienceYears: body.experienceYears,
    verified: body.verified,
  })

  return c.json({ message: 'Perfil de proveedor creado exitosamente', id: providerId }, 201)
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
  const db = c.get('db')
  const allProfiles = await getAllProviders(db)
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
      id: uuidSchema,
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
  const db = c.get('db')

  const result = await getProviderWithUser(db, id)

  if (!result) {
    return c.json({ message: 'Perfil de proveedor no encontrado' }, 404)
  }

  return c.json(result, 200)
})

// POST /:id/categories
const addProviderCategoriesRoute = createRoute({
  method: 'post',
  path: '/{id}/categories',
  tags: ['Provider Categories'],
  summary: 'Asignar una o más categorías a un proveedor',
  request: {
    params: z.object({
      id: uuidSchema,
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            categoryIds: z.array(uuidSchema).min(1).openapi({ example: ['cat-uuid-1', 'cat-uuid-2'] }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Categorías asignadas exitosamente',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: {
      description: 'Proveedor no encontrado',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
})

providersRoutes.openapi(addProviderCategoriesRoute, async (c) => {
  const { id } = c.req.valid('param')
  const { categoryIds } = c.req.valid('json')
  const db = c.get('db')

  const provider = await getProviderById(db, id)
  if (provider.length === 0) {
    return c.json({ message: 'Proveedor no encontrado' }, 404)
  }

  await addCategoriesToProvider(db, id, categoryIds)

  return c.json({ message: 'Categorías asignadas exitosamente' }, 201)
})

// GET /:id/categories
const getProviderCategoriesRoute = createRoute({
  method: 'get',
  path: '/{id}/categories',
  tags: ['Provider Categories'],
  summary: 'Obtener las categorías de un proveedor',
  request: {
    params: z.object({
      id: uuidSchema,
    }),
  },
  responses: {
    200: {
      description: 'Lista de categorías del proveedor',
      content: {
        'application/json': {
          schema: z.array(z.object({
            id: z.string(),
            name: z.string().nullable(),
            description: z.string().nullable(),
            createdAt: z.string().nullable(),
          })),
        },
      },
    },
    404: {
      description: 'Proveedor no encontrado',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
})

providersRoutes.openapi(getProviderCategoriesRoute, async (c) => {
  const { id } = c.req.valid('param')
  const db = c.get('db')

  const provider = await getProviderById(db, id)
  if (provider.length === 0) {
    return c.json({ message: 'Proveedor no encontrado' }, 404)
  }

  const result = await getProviderCategories(db, id)

  return c.json(result, 200)
})

// DELETE /:id/categories/:categoryId
const removeProviderCategoryRoute = createRoute({
  method: 'delete',
  path: '/{id}/categories/{categoryId}',
  tags: ['Provider Categories'],
  summary: 'Quitar una categoría de un proveedor',
  request: {
    params: z.object({
      id: uuidSchema,
      categoryId: uuidSchema,
    }),
  },
  responses: {
    200: {
      description: 'Categoría removida exitosamente',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
})

providersRoutes.openapi(removeProviderCategoryRoute, async (c) => {
  const { id, categoryId } = c.req.valid('param')
  const db = c.get('db')

  await removeProviderCategory(db, id, categoryId)

  return c.json({ message: 'Categoría removida exitosamente' }, 200)
})

// GET /by-category/{categoryId}
const getProvidersByCategoryRoute = createRoute({
  method: 'get',
  path: '/by-category/{categoryId}',
  tags: ['Providers'],
  summary: 'Listar proveedores por categoría',
  request: {
    params: z.object({
      categoryId: uuidSchema,
    }),
  },
  responses: {
    200: {
      description: 'Lista de proveedores en la categoría',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
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
            })
          ),
        },
      },
    },
  },
})

providersRoutes.openapi(getProvidersByCategoryRoute, async (c) => {
  const { categoryId } = c.req.valid('param')
  const db = c.get('db')

  const result = await getProvidersByCategoryId(db, categoryId)

  return c.json(result, 200)
})

export default providersRoutes

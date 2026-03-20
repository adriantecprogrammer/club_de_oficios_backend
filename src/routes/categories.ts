import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { uuidSchema } from '../schemas/common'
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categories.service'
import type { Database } from '../db/client'

type Env = {
  Bindings: CloudflareBindings
  Variables: { db: Database }
}

const categoriesRoutes = new OpenAPIHono<Env>()

// POST /create
const createCategoryRoute = createRoute({
  method: 'post',
  path: '/create',
  tags: ['Categories'],
  summary: 'Crear una nueva categoría',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            id: uuidSchema,
            name: z.string().min(1).max(100).openapi({ example: 'Electricidad' }),
            description: z.string().max(500).optional().openapi({
              example: 'Servicios de instalación y reparación eléctrica',
            }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Categoría creada exitosamente',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
})

categoriesRoutes.openapi(createCategoryRoute, async (c) => {
  const body = c.req.valid('json')
  const db = c.get('db')

  await createCategory(db, {
    id: body.id,
    name: body.name,
    description: body.description,
  })

  return c.json({ message: 'Categoría creada exitosamente' }, 201)
})

// GET /all
const getAllCategoriesRoute = createRoute({
  method: 'get',
  path: '/all',
  tags: ['Categories'],
  summary: 'Obtener todas las categorías',
  responses: {
    200: {
      description: 'Lista de categorías',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              id: z.string(),
              name: z.string().nullable(),
              description: z.string().nullable(),
              createdAt: z.string().nullable(),
            })
          ),
        },
      },
    },
  },
})

categoriesRoutes.openapi(getAllCategoriesRoute, async (c) => {
  const db = c.get('db')
  const allCategories = await getAllCategories(db)
  return c.json(allCategories, 200)
})

// GET /:id
const getCategoryByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Categories'],
  summary: 'Obtener una categoría por ID',
  request: {
    params: z.object({
      id: uuidSchema,
    }),
  },
  responses: {
    200: {
      description: 'Categoría encontrada',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            name: z.string().nullable(),
            description: z.string().nullable(),
            createdAt: z.string().nullable(),
          }),
        },
      },
    },
    404: {
      description: 'Categoría no encontrada',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
})

categoriesRoutes.openapi(getCategoryByIdRoute, async (c) => {
  const { id } = c.req.valid('param')
  const db = c.get('db')

  const category = await getCategoryById(db, id)

  if (category.length === 0) {
    return c.json({ message: 'Categoría no encontrada' }, 404)
  }

  return c.json(category[0], 200)
})

// PUT /:id
const updateCategoryRoute = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Categories'],
  summary: 'Actualizar una categoría',
  request: {
    params: z.object({
      id: uuidSchema,
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().min(1).max(100).optional().openapi({ example: 'Plomería' }),
            description: z.string().max(500).optional().openapi({
              example: 'Servicios de plomería en general',
            }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Categoría actualizada exitosamente',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: {
      description: 'Categoría no encontrada',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
})

categoriesRoutes.openapi(updateCategoryRoute, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')
  const db = c.get('db')

  const existing = await getCategoryById(db, id)

  if (existing.length === 0) {
    return c.json({ message: 'Categoría no encontrada' }, 404)
  }

  await updateCategory(db, id, body, existing[0])

  return c.json({ message: 'Categoría actualizada exitosamente' }, 200)
})

// DELETE /:id
const deleteCategoryRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Categories'],
  summary: 'Eliminar una categoría',
  request: {
    params: z.object({
      id: uuidSchema,
    }),
  },
  responses: {
    200: {
      description: 'Categoría eliminada exitosamente',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: {
      description: 'Categoría no encontrada',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
})

categoriesRoutes.openapi(deleteCategoryRoute, async (c) => {
  const { id } = c.req.valid('param')
  const db = c.get('db')

  const existing = await getCategoryById(db, id)

  if (existing.length === 0) {
    return c.json({ message: 'Categoría no encontrada' }, 404)
  }

  await deleteCategory(db, id)

  return c.json({ message: 'Categoría eliminada exitosamente' }, 200)
})

export default categoriesRoutes

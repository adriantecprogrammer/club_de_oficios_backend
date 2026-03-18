import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { createDb } from "../db/client";
import { categories } from "../db/schema";

const categoriesRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>();

// POST /create
const createCategoryRoute = createRoute({
  method: "post",
  path: "/create",
  tags: ["Categories"],
  summary: "Crear una nueva categoría",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            id: z.string().openapi({ example: "c1" }),
            name: z.string().openapi({ example: "Electricidad" }),
            description: z.string().optional().openapi({
              example: "Servicios de instalación y reparación eléctrica",
            }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Categoría creada exitosamente",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});

categoriesRoutes.openapi(createCategoryRoute, async (c) => {
  const body = c.req.valid("json");
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

  const now = new Date().toISOString();

  await db.insert(categories).values({
    id: body.id,
    name: body.name,
    description: body.description,
    createdAt: now,
  });

  return c.json({ message: "Categoría creada exitosamente" }, 201);
});

// GET /all
const getAllCategoriesRoute = createRoute({
  method: "get",
  path: "/all",
  tags: ["Categories"],
  summary: "Obtener todas las categorías",
  responses: {
    200: {
      description: "Lista de categorías",
      content: {
        "application/json": {
          schema: z.array(
            z.object({
              id: z.string(),
              name: z.string().nullable(),
              description: z.string().nullable(),
              createdAt: z.string().nullable(),
            }),
          ),
        },
      },
    },
  },
});

categoriesRoutes.openapi(getAllCategoriesRoute, async (c) => {
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);
  const allCategories = await db.select().from(categories);
  return c.json(allCategories, 200);
});

// GET /:id
const getCategoryByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Categories"],
  summary: "Obtener una categoría por ID",
  request: {
    params: z.object({
      id: z.string().openapi({ example: "c1" }),
    }),
  },
  responses: {
    200: {
      description: "Categoría encontrada",
      content: {
        "application/json": {
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
      description: "Categoría no encontrada",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});

categoriesRoutes.openapi(getCategoryByIdRoute, async (c) => {
  const { id } = c.req.valid("param");
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

  const category = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id));

  if (category.length === 0) {
    return c.json({ message: "Categoría no encontrada" }, 404);
  }

  return c.json(category[0], 200);
});

// PUT /:id
const updateCategoryRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Categories"],
  summary: "Actualizar una categoría",
  request: {
    params: z.object({
      id: z.string().openapi({ example: "c1" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().optional().openapi({ example: "Plomería" }),
            description: z
              .string()
              .optional()
              .openapi({ example: "Servicios de plomería en general" }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Categoría actualizada exitosamente",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: {
      description: "Categoría no encontrada",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});

categoriesRoutes.openapi(updateCategoryRoute, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

  const existing = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id));

  if (existing.length === 0) {
    return c.json({ message: "Categoría no encontrada" }, 404);
  }

  await db
    .update(categories)
    .set({
      name: body.name ?? existing[0].name,
      description: body.description ?? existing[0].description,
    })
    .where(eq(categories.id, id));

  return c.json({ message: "Categoría actualizada exitosamente" }, 200);
});

// DELETE /:id
const deleteCategoryRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Categories"],
  summary: "Eliminar una categoría",
  request: {
    params: z.object({
      id: z.string().openapi({ example: "c1" }),
    }),
  },
  responses: {
    200: {
      description: "Categoría eliminada exitosamente",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: {
      description: "Categoría no encontrada",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});

categoriesRoutes.openapi(deleteCategoryRoute, async (c) => {
  const { id } = c.req.valid("param");
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

  const existing = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id));

  if (existing.length === 0) {
    return c.json({ message: "Categoría no encontrada" }, 404);
  }

  await db.delete(categories).where(eq(categories.id, id));

  return c.json({ message: "Categoría eliminada exitosamente" }, 200);
});

export default categoriesRoutes;

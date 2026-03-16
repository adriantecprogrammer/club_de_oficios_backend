import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createDb } from "../db/client";
import { providerProfiles, users } from "../db/schema";

const providersRoutes = new Hono<{ Bindings: CloudflareBindings }>();

providersRoutes.post("/create", async (c) => {
  const body = await c.req.json();
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

  const now = new Date().toISOString();

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
  });

  return c.json({ message: "Perfil de proveedor creado exitosamente" }, 201);
});

providersRoutes.get("/all", async (c) => {
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

  const allProfiles = await db.select().from(providerProfiles);

  return c.json(allProfiles);
});

providersRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

  const profile = await db
    .select()
    .from(providerProfiles)
    .where(eq(providerProfiles.id, id));

  if (profile.length === 0) {
    return c.json({ message: "Perfil de proveedor no encontrado" }, 404);
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, profile[0].userId!));

  return c.json({ ...user[0], provider: profile[0] });
});

export default providersRoutes;

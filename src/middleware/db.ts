import { createMiddleware } from 'hono/factory'
import { createDb, type Database } from '../db/client'

type Env = {
  Bindings: CloudflareBindings
  Variables: { db: Database }
}

export const dbMiddleware = createMiddleware<Env>(async (c, next) => {
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN)
  c.set('db', db)
  await next()
})

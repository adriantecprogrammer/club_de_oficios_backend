import { Hono } from 'hono'
import { createDb } from './db/client'
import { users } from './db/schema'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/', (c) => {
  return c.text('Club de la chamba')
})

app.post('/users/register', async (c) => {
  const body = await c.req.json()
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

export default app

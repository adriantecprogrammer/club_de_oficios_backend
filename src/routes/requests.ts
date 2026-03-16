import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { createDb } from '../db/client'
import { serviceRequests } from '../db/schema'

const requestsRoutes = new Hono<{ Bindings: CloudflareBindings }>()

requestsRoutes.post('/new', async (c) => {
  const body = await c.req.json()
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

requestsRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN)

  const request = await db.select().from(serviceRequests).where(eq(serviceRequests.id, id))

  if (request.length === 0) {
    return c.json({ message: 'Solicitud no encontrada' }, 404)
  }

  return c.json(request[0])
})

export default requestsRoutes

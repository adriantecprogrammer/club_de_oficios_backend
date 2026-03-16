import { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import usersRoutes from './routes/users'
import providersRoutes from './routes/providers'
import requestsRoutes from './routes/requests'

const app = new OpenAPIHono<{ Bindings: CloudflareBindings }>()

app.get('/', (c) => {
  return c.text('Club de la chamba')
})

app.route('/users', usersRoutes)
app.route('/providers', providersRoutes)
app.route('/request', requestsRoutes)

// OpenAPI spec endpoint
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    title: 'Club de Oficios API',
    version: '1.0.0',
    description: 'API para conectar clientes con proveedores de servicios (oficios)',
  },
})

// Swagger UI
app.get('/swagger', swaggerUI({ url: '/doc' }))

export default app

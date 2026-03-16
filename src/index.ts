import { Hono } from 'hono'
import usersRoutes from './routes/users'
import providersRoutes from './routes/providers'
import requestsRoutes from './routes/requests'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/', (c) => {
  return c.text('Club de la chamba')
})

app.route('/users', usersRoutes)
app.route('/providers', providersRoutes)
app.route('/request', requestsRoutes)

export default app

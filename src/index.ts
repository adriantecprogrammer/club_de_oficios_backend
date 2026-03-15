import { Hono } from 'hono'
import usersRoutes from './routes/users'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/', (c) => {
  return c.text('Club de la chamba')
})

app.route('/users', usersRoutes)

export default app

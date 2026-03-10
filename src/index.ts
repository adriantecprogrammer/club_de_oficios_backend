import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Club de la chamba')
})

export default app

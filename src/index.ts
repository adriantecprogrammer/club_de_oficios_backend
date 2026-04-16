import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { dbMiddleware } from "./middleware/db";
import usersRoutes from "./routes/users";
import providersRoutes from "./routes/providers";
import requestsRoutes from "./routes/requests";
import categoriesRoutes from "./routes/categories";
import paymentsRoutes from "./routes/payments";
import reviewsRoutes from "./routes/reviews";

const app = new OpenAPIHono<{ Bindings: CloudflareBindings }>();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  }),
);

app.use("*", dbMiddleware);

app.get("/", (c) => {
  return c.text("Club de la chamba");
});

app.route("/users", usersRoutes);
app.route("/providers", providersRoutes);
app.route("/request", requestsRoutes);
app.route("/categories", categoriesRoutes);
app.route("/payments", paymentsRoutes);
app.route("/reviews", reviewsRoutes);

// OpenAPI spec endpoint
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "Club de la chamba API",
    version: "1.0.0",
    description:
      "API para conectar clientes con proveedores de servicios (oficios)",
  },
});

// Swagger UI
app.get("/swagger", swaggerUI({ url: "/doc" }));

// Scalar API Reference
app.get(
  "/scalar",
  apiReference({
    spec: { url: "/doc" },
    theme: "kepler",
  }),
);

export default app;

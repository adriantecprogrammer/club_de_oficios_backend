import type { MiddlewareHandler } from "hono";
import { verifyToken } from "../utils/jwt";

type Env = {
  Bindings: CloudflareBindings;
  Variables: {
    jwtPayload: { userId: string; role: string };
  };
};

export function authMiddleware(): MiddlewareHandler<Env> {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ message: "Token requerido" }, 401);
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(c, token);

    if (!payload) {
      return c.json({ message: "Token inválido o expirado" }, 401);
    }

    c.set("jwtPayload", payload as { userId: string; role: string });

    await next();
  };
}

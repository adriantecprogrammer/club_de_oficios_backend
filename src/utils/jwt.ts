import { sign, verify } from "hono/jwt";
import type { Context } from "hono";

export const JWT_EXPIRATION = "24h";

export async function generateToken(
  c: Context,
  payload: { userId: string; role: string },
): Promise<string> {
  const secret = c.env.JWT_SECRET;

  return sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    },
    secret,
  );
}

export async function verifyToken(c: Context, token: string) {
  const secret = c.env.JWT_SECRET;

  try {
    return await verify(token, secret);
  } catch {
    return null;
  }
}

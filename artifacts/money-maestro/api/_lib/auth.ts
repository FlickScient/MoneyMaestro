import { verifyToken } from "@clerk/backend";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export async function requireUserId(
  req: VercelRequest,
  res: VercelResponse,
): Promise<string | null> {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Not signed in" });
    return null;
  }

  if (!process.env.CLERK_SECRET_KEY) {
    res.status(500).json({ error: "Server misconfigured: CLERK_SECRET_KEY missing" });
    return null;
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    return payload.sub;
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired session" });
    return null;
  }
}

export const ADMIN_EMAIL = "smartmahid@gmail.com";

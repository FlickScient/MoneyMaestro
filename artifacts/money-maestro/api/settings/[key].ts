import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClerkClient } from "@clerk/backend";
import { getPool } from "../_lib/db.js";
import { requireUserId, ADMIN_EMAIL } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const user = await clerk.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;
  if (email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Only the admin can edit settings" });
  }

  const key = req.query.key as string;
  const { value } = (req.body ?? {}) as { value?: string };
  if (value == null) return res.status(400).json({ error: "value is required" });

  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
     RETURNING key, value`,
    [key, value],
  );
  return res.status(200).json(rows[0]);
}

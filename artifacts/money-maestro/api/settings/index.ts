import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPool } from "../_lib/db.js";
import { requireUserId } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const pool = getPool();
  const { rows } = await pool.query(`SELECT key, value FROM settings`);
  return res.status(200).json(rows);
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPool } from "../_lib/db.js";
import { requireUserId } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const pool = getPool();

  if (req.method === "GET") {
    const { rows } = await pool.query(
      `SELECT * FROM books WHERE user_id = $1 ORDER BY created_at ASC`,
      [userId],
    );
    res.status(200).json(rows);
    return;
  }

  if (req.method === "POST") {
    const { name, description, icon, color } = req.body ?? {};
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const { rows } = await pool.query(
      `INSERT INTO books (user_id, name, description, icon, color)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, name, description ?? null, icon ?? "📔", color ?? "#F97316"],
    );
    res.status(201).json(rows[0]);
    return;
  }

  res.setHeader("Allow", "GET, POST");
  res.status(405).json({ error: "Method not allowed" });
  return;
}

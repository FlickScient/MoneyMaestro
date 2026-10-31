import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPool } from "../_lib/db.js";
import { requireUserId } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const pool = getPool();

  if (req.method === "GET") {
    const { rows } = await pool.query(
      `SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const b = req.body ?? {};
    if (!b.name || b.amount == null) {
      return res.status(400).json({ error: "name and amount are required" });
    }
    const { rows } = await pool.query(
      `INSERT INTO transactions
         (user_id, name, amount, phone, type, given_date, due_date, status,
          reason, partial_paid, notes, book_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        userId,
        b.name,
        b.amount,
        b.phone ?? null,
        b.type ?? "Due",
        b.given_date ?? null,
        b.due_date ?? null,
        b.status ?? "Pending",
        b.reason ?? null,
        b.partial_paid ?? 0,
        b.notes ?? null,
        b.book_id ?? null,
      ],
    );
    return res.status(201).json(rows[0]);
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}

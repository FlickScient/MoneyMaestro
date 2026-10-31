import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPool } from "../_lib/db.js";
import { requireUserId } from "../_lib/auth.js";

const ALLOWED_FIELDS = [
  "name",
  "amount",
  "phone",
  "type",
  "given_date",
  "due_date",
  "status",
  "reason",
  "partial_paid",
  "notes",
  "book_id",
] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const id = req.query.id as string;
  const pool = getPool();

  if (req.method === "PUT" || req.method === "PATCH") {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const setClauses: string[] = [];
    const values: unknown[] = [];

    for (const field of ALLOWED_FIELDS) {
      if (field in body) {
        values.push(body[field]);
        setClauses.push(`${field} = $${values.length}`);
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    values.push(id, userId);
    const { rows } = await pool.query(
      `UPDATE transactions SET ${setClauses.join(", ")}
       WHERE id = $${values.length - 1} AND user_id = $${values.length}
       RETURNING *`,
      values,
    );
    if (rows.length === 0) return res.status(404).json({ error: "Transaction not found" });
    return res.status(200).json(rows[0]);
  }

  if (req.method === "DELETE") {
    const { rowCount } = await pool.query(
      `DELETE FROM transactions WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    if (rowCount === 0) return res.status(404).json({ error: "Transaction not found" });
    return res.status(204).end();
  }

  res.setHeader("Allow", "PUT, PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}

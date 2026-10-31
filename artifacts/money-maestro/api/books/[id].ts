import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPool } from "../_lib/db";
import { requireUserId } from "../_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await requireUserId(req, res);
  if (!userId) return;

  const id = req.query.id as string;
  const pool = getPool();

  if (req.method === "PUT" || req.method === "PATCH") {
    const { name, description, icon, color } = req.body ?? {};
    const { rows } = await pool.query(
      `UPDATE books SET
         name = COALESCE($1, name),
         description = $2,
         icon = COALESCE($3, icon),
         color = COALESCE($4, color)
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [name ?? null, description ?? null, icon ?? null, color ?? null, id, userId],
    );
    if (rows.length === 0) return res.status(404).json({ error: "Book not found" });
    return res.status(200).json(rows[0]);
  }

  if (req.method === "DELETE") {
    await pool.query(
      `UPDATE transactions SET book_id = NULL WHERE book_id = $1 AND user_id = $2`,
      [id, userId],
    );
    const { rowCount } = await pool.query(
      `DELETE FROM books WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    if (rowCount === 0) return res.status(404).json({ error: "Book not found" });
    return res.status(204).end();
  }

  res.setHeader("Allow", "PUT, PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}

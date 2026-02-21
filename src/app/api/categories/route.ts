import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

function getRows(result: any): any[] {
  if (Array.isArray(result)) {
    if (result.length > 0 && Array.isArray(result[0])) return result[0];
    return result;
  }
  if (result?.rows) return result.rows;
  return [];
}

export async function GET() {
  try {
    const catsResult = await db.execute(sql.raw(
      `SELECT id, name, slug, parent_id FROM categories WHERE parent_id IS NULL ORDER BY name DESC`
    )) as any;

    const allCatsResult = await db.execute(sql.raw(
      `SELECT id, parent_id FROM categories`
    )) as any;

    const mainCats = getRows(catsResult);
    const allCats = getRows(allCatsResult);

    const data = await Promise.all(mainCats.map(async (cat: any) => {
      const subIds = allCats
        .filter((c: any) => c.parent_id === cat.id)
        .map((c: any) => c.id);

      const allIds = [cat.id, ...subIds];
      const idList = allIds.join(",");

      const countResult = await db.execute(sql.raw(
        `SELECT COUNT(*) as cnt FROM posts WHERE status = 'published' AND (category_id IN (${idList}) OR sub_category_id IN (${idList}))`
      )) as any;

      const rows = getRows(countResult);
      return { ...cat, count: Number(rows[0]?.cnt ?? 0) };
    }));

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in GET /api/categories:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

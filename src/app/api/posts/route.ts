import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getRows } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryName = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = page * limit;

    let conditions = ["posts.status = 'published'"];

    if (categoryName) {
      const escaped = categoryName.replace(/'/g, "\\'");
      conditions.push(`(posts.category = '${escaped}' OR EXISTS (SELECT 1 FROM categories c WHERE c.id = posts.category_id AND c.name = '${escaped}'))`);
    }
    if (search) {
      const escaped = search.replace(/'/g, "\\'");
      conditions.push(`(posts.title LIKE '%${escaped}%' OR posts.content LIKE '%${escaped}%')`);
    }

    const whereStr = conditions.join(" AND ");

    const dataResult = await db.execute(sql.raw(
      `SELECT posts.id, posts.title, posts.excerpt, posts.content, posts.category, posts.category_id, posts.sub_category_id, posts.image_url, posts.status, posts.author_id, posts.created_at, posts.views FROM posts WHERE ${whereStr} ORDER BY posts.created_at DESC LIMIT ${limit} OFFSET ${offset}`
    )) as any;

    const countResult = await db.execute(sql.raw(
      `SELECT COUNT(*) as total FROM posts WHERE ${whereStr}`
    )) as any;

    const rawData = getRows(dataResult);
    const data = rawData.map(post => {
      if (post.image_url && !post.image_url.startsWith('http') && !post.image_url.startsWith('/') && !post.image_url.startsWith('data:')) {
        post.image_url = `/uploads/${post.image_url}`;
      }
      return post;
    });
    const totalRows = getRows(countResult);
    const total = Number(totalRows[0]?.total ?? 0);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    console.error("Error in GET /api/posts:", error);
    return NextResponse.json({ data: [], total: 0, error: error.message }, { status: 200 }); // Return 200 with empty data to avoid crashing frontend
  }
}

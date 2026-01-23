import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, categories, postTags, tags } from "@/lib/schema";
import { eq, desc, and, count, sql, or, like } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryName = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = page * limit;

    let conditions = [eq(posts.status, "published")];

    if (categoryName) {
      conditions.push(eq(posts.category, categoryName));
    }

    if (search) {
      conditions.push(or(
        like(posts.title, `%${search}%`),
        like(posts.content, `%${search}%`)
      ) as any);
    }

    const whereClause = and(...conditions);

    const data = await db.query.posts.findMany({
      where: whereClause,
      orderBy: [desc(posts.created_at)],
      limit: limit,
      offset: offset,
    });

    // Get total count for pagination
    const totalResult = await db.select({ value: count() }).from(posts).where(whereClause);
    const total = totalResult[0].value;

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    console.error("Error in GET /api/posts:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

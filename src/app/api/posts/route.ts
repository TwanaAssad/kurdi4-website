import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, categories, postTags, tags } from "@/lib/schema";
import { eq, desc, and, count, sql, or, like, aliasedTable } from "drizzle-orm";

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
      conditions.push(or(
        eq(posts.category, categoryName),
        eq(cat.name, categoryName),
        eq(parentCat.name, categoryName)
      ) as any);
    }

    if (search) {
      conditions.push(or(
        like(posts.title, `%${search}%`),
        like(posts.content, `%${search}%`)
      ) as any);
    }

    const whereClause = and(...conditions);

    // Create aliases for categories to join twice (for sub and main)
    const cat = aliasedTable(categories, "cat");
    const parentCat = aliasedTable(categories, "parentCat");

    const data = await db
      .select({
        id: posts.id,
        title: posts.title,
        excerpt: posts.excerpt,
        content: posts.content,
        category: posts.category,
        category_id: posts.category_id,
        sub_category_id: posts.sub_category_id,
        image_url: posts.image_url,
        status: posts.status,
        author_id: posts.author_id,
        created_at: posts.created_at,
        views: posts.views,
        main_category: sql<string>`COALESCE(${parentCat.name}, ${cat.name}, ${posts.category}, 'گشتی')`,
      })
      .from(posts)
      .leftJoin(cat, eq(posts.category_id, cat.id))
      .leftJoin(parentCat, eq(cat.parent_id, parentCat.id))
      .where(whereClause)
      .orderBy(desc(posts.created_at))
      .limit(limit)
      .offset(offset);

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

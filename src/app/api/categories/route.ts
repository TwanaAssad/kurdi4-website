import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, posts } from "@/lib/schema";
import { count, eq } from "drizzle-orm";

export async function GET() {
  try {
    const categoriesData = await db.query.categories.findMany();
    
    // Fetch counts for each category
    const data = await Promise.all(categoriesData.map(async (cat) => {
      const result = await db.select({ value: count() })
        .from(posts)
        .where(eq(posts.category, cat.name));
      
      return {
        ...cat,
        count: result[0].value
      };
    }));

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in GET /api/categories:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

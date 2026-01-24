import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, posts } from "@/lib/schema";
import { count, eq, or, and, isNull, inArray } from "drizzle-orm";

export async function GET() {
  try {
    // Fetch only main categories
    const mainCategories = await db.query.categories.findMany({
      where: isNull(categories.parent_id)
    });
    
    // Fetch all categories to handle subcategory logic
    const allCategories = await db.query.categories.findMany();
    
    // Fetch counts for each main category including its subcategories
    const data = await Promise.all(mainCategories.map(async (cat) => {
      // Get all IDs of subcategories for this main category
      const subCategoryIds = allCategories
        .filter(c => c.parent_id === cat.id)
        .map(c => c.id);
      
      const categoryIds = [cat.id, ...subCategoryIds];
      
      // Count posts that have either category_id or sub_category_id in the set of IDs
      const result = await db.select({ value: count() })
        .from(posts)
        .where(
          and(
            eq(posts.status, "published"),
            or(
              inArray(posts.category_id, categoryIds),
              inArray(posts.sub_category_id, categoryIds)
            )
          )
        );
      
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

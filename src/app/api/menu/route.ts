import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { menuItems, pages, categories } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const allItems = await db.query.menuItems.findMany({
      orderBy: [asc(menuItems.sort_order)],
    });

    if (allItems.length === 0) {
      return NextResponse.json([
        { name: "سەرەتا", href: "/", hasChildren: false, children: [] },
        { name: "دەربارەی ئێمە", href: "/about", hasChildren: false, children: [] },
        { name: "پەیوەندی", href: "/contact", hasChildren: false, children: [] },
      ]);
    }

    const buildHierarchy = async (items: any[], parentId: number | null = null) => {
      const levelItems = items.filter(item => item.parent_id === parentId);
      
      const result = [];
      for (const item of levelItems) {
        let href = item.url || "#";
        
        if (item.type === 'page' && item.target_id) {
          const page = await db.query.pages.findFirst({
            where: eq(pages.id, parseInt(item.target_id))
          });
          if (page) href = `/${page.slug}`;
        } else if (item.type === 'category' && item.target_id) {
          const category = await db.query.categories.findFirst({
            where: eq(categories.id, parseInt(item.target_id))
          });
          if (category) href = `/category/${category.slug}`;
        }

        const children = await buildHierarchy(items, item.id);
        result.push({
          ...item,
          name: item.label,
          href,
          children,
          hasChildren: children.length > 0
        });
      }
      return result;
    };

    const data = await buildHierarchy(allItems);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in GET /api/menu:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

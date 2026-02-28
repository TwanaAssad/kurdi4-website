import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getRows } from "@/lib/settings";

const defaultMenu = [
  { name: "سەرەتا", href: "/", hasChildren: false, children: [] },
  { name: "دەربارەی ئێمە", href: "/about", hasChildren: false, children: [] },
  { name: "پەیوەندی", href: "/contact", hasChildren: false, children: [] },
];

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const menuResult = await db.execute(sql.raw(
      `SELECT * FROM menu_items ORDER BY sort_order ASC`
    )) as any;

    const allItems = getRows(menuResult);

    if (allItems.length === 0) {
      return NextResponse.json(defaultMenu);
    }

    const buildHierarchy = async (items: any[], parentId: number | null = null): Promise<any[]> => {
      const levelItems = items.filter((item: any) => item.parent_id === parentId);
      const result = [];

      for (const item of levelItems) {
        let href = item.url || "#";

        try {
          if (item.type === "page" && item.target_id) {
            const pageResult = await db.execute(sql.raw(
              `SELECT slug FROM pages WHERE id = ${parseInt(item.target_id)} LIMIT 1`
            )) as any;
            const rows = getRows(pageResult);
            if (rows[0]?.slug) href = `/${rows[0].slug}`;
          } else if (item.type === "category" && item.target_id) {
            const catResult = await db.execute(sql.raw(
              `SELECT slug FROM categories WHERE id = ${parseInt(item.target_id)} LIMIT 1`
            )) as any;
            const rows = getRows(catResult);
            if (rows[0]?.slug) href = `/category/${rows[0].slug}`;
          }
        } catch (e) {
          console.error("Error fetching menu target:", e);
        }

        const children = await buildHierarchy(items, item.id);
        result.push({
          ...item,
          name: item.label,
          href,
          children,
          hasChildren: children.length > 0,
        });
      }
      return result;
    };

    const data = await buildHierarchy(allItems);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in GET /api/menu:", error);
    return NextResponse.json(defaultMenu, { status: 200 }); // Return default menu on error
  }
}

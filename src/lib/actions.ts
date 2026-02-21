"use server";

import { db } from "./db";
import * as schema from "./schema";
import { eq, desc, and, count, sql, or, like, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const { 
  posts, 
  categories, 
  tags, 
  postTags, 
  menuItems, 
  pages, 
  profiles, 
  siteSettings,
  siteVisits
} = schema;

// --- Helper for data cleanup ---
function cleanData(data: any, numericFields: string[] = [], ignoreFields: string[] = ["id"]) {
  const cleaned: any = { ...data };
  
  ignoreFields.forEach(field => delete cleaned[field]);
  
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === "" || cleaned[key] === undefined) {
      cleaned[key] = null;
    }
  });

  numericFields.forEach(field => {
    if (cleaned[field] !== null) {
      const parsed = parseInt(cleaned[field]);
      cleaned[field] = isNaN(parsed) ? null : parsed;
    }
  });

  return cleaned;
}

function getRows(result: any): any[] {
  if (Array.isArray(result)) return result;
  if (result?.rows) return result.rows;
  if (result?.[0] && Array.isArray(result[0])) return result[0];
  return [];
}

// --- Posts ---
export async function getPostsAction(params: any = {}) {
  try {
    const { searchTerm, statusFilter, authorFilter, dateFilter, page = 1, pageSize = 10 } = params;
    const offsetNum = (page - 1) * pageSize;
    const limitNum = pageSize;

    const whereSegments = [sql`1=1`];
    if (searchTerm) {
      whereSegments.push(sql`posts.title LIKE ${`%${searchTerm}%`}`);
    }
    if (statusFilter && statusFilter !== 'all') {
      whereSegments.push(sql`posts.status = ${statusFilter}`);
    }
    if (authorFilter && authorFilter !== 'all') {
      whereSegments.push(sql`posts.author_id = ${authorFilter}`);
    }
    if (dateFilter) {
      const dateObj = new Date(dateFilter);
      if (!isNaN(dateObj.getTime())) {
        whereSegments.push(sql`DATE(posts.created_at) >= ${dateFilter}`);
      }
    }

    const whereClause = sql.join(whereSegments, sql` AND `);

    // Using sql.raw for LIMIT/OFFSET to avoid MySQL "LIMIT ?" issues
    const dataResult = await db.execute(
      sql`SELECT id, title, content, excerpt, category, category_id, sub_category_id, image_url, status, author_id, created_at, views 
          FROM posts 
          WHERE ${whereClause} 
          ORDER BY created_at DESC 
          LIMIT ${sql.raw(limitNum.toString())} 
          OFFSET ${sql.raw(offsetNum.toString())}`
    ) as any;

    const countResult = await db.execute(
      sql`SELECT COUNT(*) as total FROM posts WHERE ${whereClause}`
    ) as any;

    const data = getRows(dataResult);
    const totalRows = getRows(countResult);
    const total = totalRows[0]?.total ?? 0;

    // Fetch tags and profile for each post
    const postsWithDetails = await Promise.all(data.map(async (post: any) => {
      const [tagResult, profileResult] = await Promise.all([
        db.execute(sql`SELECT tag_id FROM post_tags WHERE post_id = ${post.id}`),
        db.execute(sql`SELECT full_name FROM profiles WHERE id = ${post.author_id}`)
      ]);
      
      const post_tags = getRows(tagResult);
      const profiles_rows = getRows(profileResult);
      
      return { 
        ...post, 
        post_tags,
        profiles: profiles_rows[0] || { full_name: 'بێ ناو' }
      };
    }));

    return { data: postsWithDetails, count: Number(total) };
  } catch (error) {
    console.error("getPostsAction error:", error);
    return { data: [], count: 0 };
  }
}

export async function createPostAction(data: any) {
  try {
    const { selectedTags, ...rawPostData } = data;
    const postData = cleanData(rawPostData, ["category_id", "sub_category_id", "views"]);

    const [result] = await db.insert(posts).values(postData);
    const postId = result.insertId;

    if (selectedTags && selectedTags.length > 0) {
      await db.insert(postTags).values(
        selectedTags.map((tagId: number | string) => ({ 
          post_id: postId, 
          tag_id: typeof tagId === 'string' ? parseInt(tagId) : tagId 
        }))
      );
    }
    revalidatePath("/admin");
    return { success: true, id: postId };
  } catch (error) {
    console.error("createPostAction error:", error);
    return { success: false, error: String(error) };
  }
}

export async function updatePostAction(id: number, data: any) {
  try {
    const { selectedTags, ...rawPostData } = data;
    const postData = cleanData(rawPostData, ["category_id", "sub_category_id", "views"], ["id", "created_at", "post_tags"]);

    await db.update(posts).set(postData).where(eq(posts.id, id));

    await db.delete(postTags).where(eq(postTags.post_id, id));
    if (selectedTags && selectedTags.length > 0) {
      await db.insert(postTags).values(
        selectedTags.map((tagId: number | string) => ({ 
          post_id: id, 
          tag_id: typeof tagId === 'string' ? parseInt(tagId) : tagId 
        }))
      );
    }
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("updatePostAction error:", error);
    return { success: false, error: String(error) };
  }
}

export async function deletePostAction(id: number) {
  try {
    await db.delete(postTags).where(eq(postTags.post_id, id));
    await db.delete(posts).where(eq(posts.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("deletePostAction error:", error);
    return { success: false, error: String(error) };
  }
}

// --- Categories ---
export async function getCategoriesAction() {
  try {
    return await db.select().from(categories).orderBy(desc(categories.name));
  } catch (error) {
    console.error("getCategoriesAction error:", error);
    return [];
  }
}

export async function createCategoryAction(data: any) {
  try {
    const categoryData = cleanData(data, ["parent_id"]);
    await db.insert(categories).values(categoryData);
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("createCategoryAction error:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateCategoryAction(id: number, data: any) {
  try {
    const categoryData = cleanData(data, ["parent_id"], ["id"]);
    await db.update(categories).set(categoryData).where(eq(categories.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("updateCategoryAction error:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteCategoryAction(id: number) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("deleteCategoryAction error:", error);
    return { success: false, error: String(error) };
  }
}

// --- Tags ---
export async function getTagsAction() {
  try {
    return await db.select().from(tags).orderBy(desc(tags.name));
  } catch (error) {
    console.error("getTagsAction error:", error);
    return [];
  }
}

export async function createTagAction(data: any) {
  try {
    const tagData = cleanData(data);
    await db.insert(tags).values(tagData);
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("createTagAction error:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateTagAction(id: number, data: any) {
  try {
    const tagData = cleanData(data, [], ["id"]);
    await db.update(tags).set(tagData).where(eq(tags.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("updateTagAction error:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteTagAction(id: number) {
  try {
    await db.delete(tags).where(eq(tags.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("deleteTagAction error:", error);
    return { success: false, error: String(error) };
  }
}

// --- Menu Items ---
export async function getMenuItemsAction() {
  try {
    return await db.select().from(menuItems).orderBy(desc(menuItems.sort_order));
  } catch (error) {
    console.error("getMenuItemsAction error:", error);
    return [];
  }
}

export async function createMenuItemAction(data: any) {
  try {
    const itemData = cleanData(data, ["parent_id", "sort_order"]);
    if (itemData.sort_order === null) itemData.sort_order = 0;
    await db.insert(menuItems).values(itemData);
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("createMenuItemAction error:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateMenuItemAction(id: number, data: any) {
  try {
    const itemData = cleanData(data, ["parent_id", "sort_order"], ["id"]);
    if (itemData.sort_order === null) itemData.sort_order = 0;
    await db.update(menuItems).set(itemData).where(eq(menuItems.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("updateMenuItemAction error:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteMenuItemAction(id: number) {
  try {
    await db.delete(menuItems).where(eq(menuItems.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("deleteMenuItemAction error:", error);
    return { success: false, error: String(error) };
  }
}

// --- Pages ---
export async function getPagesAction(params: any = {}) {
  try {
    const { searchTerm, statusFilter, page = 1, pageSize = 10 } = params;
    const offsetNum = (page - 1) * pageSize;
    const limitNum = pageSize;

    const whereSegments = [sql`1=1`];
    if (searchTerm) {
      whereSegments.push(sql`pages.title LIKE ${`%${searchTerm}%`}`);
    }
    if (statusFilter && statusFilter !== 'all') {
      whereSegments.push(sql`pages.status = ${statusFilter}`);
    }

    const whereClause = sql.join(whereSegments, sql` AND `);

    const dataResult = await db.execute(
      sql`SELECT * FROM pages 
          WHERE ${whereClause} 
          ORDER BY created_at DESC 
          LIMIT ${sql.raw(limitNum.toString())} 
          OFFSET ${sql.raw(offsetNum.toString())}`
    ) as any;

    const countResult = await db.execute(
      sql`SELECT COUNT(*) as total FROM pages WHERE ${whereClause}`
    ) as any;

    const data = getRows(dataResult);
    const totalRows = getRows(countResult);
    return { data, count: Number(totalRows[0]?.total ?? 0) };
  } catch (error) {
    console.error("getPagesAction error:", error);
    return { data: [], count: 0 };
  }
}

export async function createPageAction(data: any) {
  try {
    const pageData = cleanData(data);
    await db.insert(pages).values(pageData);
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("createPageAction error:", error);
    return { success: false, error: String(error) };
  }
}

export async function updatePageAction(id: number, data: any) {
  try {
    const pageData = cleanData(data, [], ["id", "created_at"]);
    await db.update(pages).set(pageData).where(eq(pages.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("updatePageAction error:", error);
    return { success: false, error: String(error) };
  }
}

export async function deletePageAction(id: number) {
  try {
    await db.delete(pages).where(eq(pages.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("deletePageAction error:", error);
    return { success: false, error: String(error) };
  }
}

// --- Profiles ---
export async function getProfilesAction(params: any = {}) {
  try {
    const { searchTerm, statusFilter, page = 1, pageSize = 10 } = params;
    const offsetNum = (page - 1) * pageSize;
    const limitNum = pageSize;

    const whereSegments = [sql`1=1`];
    if (searchTerm) {
      whereSegments.push(sql`profiles.full_name LIKE ${`%${searchTerm}%`}`);
    }
    if (statusFilter && statusFilter !== 'all' && statusFilter !== 'deleted') {
      const statusVal = statusFilter === 'published' ? 'active' : 'suspended';
      whereSegments.push(sql`profiles.status = ${statusVal}`);
    }

    const whereClause = sql.join(whereSegments, sql` AND `);

    const dataResult = await db.execute(
      sql`SELECT * FROM profiles 
          WHERE ${whereClause} 
          ORDER BY created_at DESC 
          LIMIT ${sql.raw(limitNum.toString())} 
          OFFSET ${sql.raw(offsetNum.toString())}`
    ) as any;

    const countResult = await db.execute(
      sql`SELECT COUNT(*) as total FROM profiles WHERE ${whereClause}`
    ) as any;

    const data = getRows(dataResult);
    const totalRows = getRows(countResult);
    return { data, count: Number(totalRows[0]?.total ?? 0) };
  } catch (error) {
    console.error("getProfilesAction error:", error);
    return { data: [], count: 0 };
  }
}

export async function updateProfileAction(id: string, data: any) {
  try {
    const profileData = cleanData(data, [], ["id", "created_at", "email"]);
    await db.update(profiles).set(profileData).where(eq(profiles.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("updateProfileAction error:", error);
    return { success: false, error: String(error) };
  }
}

export async function createProfileAction(data: any) {
  try {
    const profileData = {
      id: data.id,
      email: data.email,
      full_name: data.full_name || null,
      role: data.role || 'user',
      avatar_url: data.avatar_url || null,
      status: data.status || 'active',
    };
    await db.insert(profiles).values(profileData);
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("createProfileAction error:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteProfileAction(id: string) {
  try {
    await db.delete(profiles).where(eq(profiles.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("deleteProfileAction error:", error);
    return { success: false, error: String(error) };
  }
}

// --- Site Settings ---
export async function getSiteSettingsAction() {
  try {
    const result = await db.select().from(siteSettings).limit(1);
    return result[0] ?? null;
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return null;
  }
}

export async function updateSiteSettingsAction(data: any) {
  try {
    const orgName = data.org_name || null;
    const logoUrl = data.logo_url || null;
    const primaryColor = data.primary_color || '#563a4a';
    const secondaryColor = data.secondary_color || '#c29181';
    const accentColor = data.accent_color || '#f0ecee';
    const socialFacebook = data.social_facebook || null;
    const socialTiktok = data.social_tiktok || null;
    const socialInstagram = data.social_instagram || null;
    const socialLinkedin = data.social_linkedin || null;
    const socialYoutube = data.social_youtube || null;
    const contactPhone = data.contact_phone || null;
    const contactEmail = data.contact_email || null;
    const contactLocation = data.contact_location || null;
    const defaultLanguage = data.default_language || 'ku';
    const availableLanguages = Array.isArray(data.available_languages) 
      ? JSON.stringify(data.available_languages) 
      : '["ku"]';

    await db.execute(sql`
      UPDATE site_settings SET
        org_name = ${orgName},
        logo_url = ${logoUrl},
        primary_color = ${primaryColor},
        secondary_color = ${secondaryColor},
        accent_color = ${accentColor},
        social_facebook = ${socialFacebook},
        social_tiktok = ${socialTiktok},
        social_instagram = ${socialInstagram},
        social_linkedin = ${socialLinkedin},
        social_youtube = ${socialYoutube},
        contact_phone = ${contactPhone},
        contact_email = ${contactEmail},
        contact_location = ${contactLocation},
        default_language = ${defaultLanguage},
        available_languages = ${availableLanguages}
      WHERE id = (SELECT min_id FROM (SELECT MIN(id) as min_id FROM site_settings) as t)
    `);

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update settings:", error);
    return { success: false, error: String(error) };
  }
}

// --- Stats ---
export async function getStatsAction() {
  try {
    const [
      postCountRes,
      catCountRes,
      userCountRes,
      postViewRes,
      visitRes,
      recentPosts
    ] = await Promise.all([
      db.select({ total: count() }).from(posts),
      db.select({ total: count() }).from(categories),
      db.select({ total: count() }).from(profiles),
      db.select({ total: sql`SUM(${posts.views})` }).from(posts),
      db.select({ total: sql`SUM(${siteVisits.count})` }).from(siteVisits),
      db.select().from(posts).orderBy(desc(posts.created_at)).limit(5)
    ]);

    const days = ['هەینی', 'پێنجشەممە', 'چوارشەممە', 'سێشەممە', 'دووشەممە', 'یەکشەممە', 'شەممە'].reverse();
    const chartData = await Promise.all(days.map(async (day, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const dateStr = date.toISOString().slice(0, 10);

      const visitRecord = await db.select({ count: siteVisits.count })
        .from(siteVisits)
        .where(sql`DATE(${siteVisits.visit_date}) = ${dateStr}`)
        .limit(1);

      return { name: day, value: visitRecord[0]?.count || 0 };
    }));

    return {
      totalPosts: Number(postCountRes[0]?.total ?? 0),
      totalCategories: Number(catCountRes[0]?.total ?? 0),
      totalUsers: Number(userCountRes[0]?.total ?? 0),
      totalViews: Number(visitRes[0]?.total ?? 0),
      postViews: Number(postViewRes[0]?.total ?? 0),
      recentActivity: recentPosts,
      chartData,
    };
  } catch (error) {
    console.error("getStatsAction error:", error);
    return {
      totalPosts: 0,
      totalCategories: 0,
      totalUsers: 0,
      totalViews: 0,
      postViews: 0,
      recentActivity: [],
      chartData: [],
    };
  }
}

export async function trackVisitAction() {
  try {
    const existing = await db.select({ id: siteVisits.id, count: siteVisits.count })
      .from(siteVisits)
      .where(sql`DATE(${siteVisits.visit_date}) = CURDATE()`)
      .limit(1);

    const row = existing[0];

    if (row?.id) {
      await db.update(siteVisits)
        .set({ count: sql`${siteVisits.count} + 1` })
        .where(eq(siteVisits.id, row.id));
    } else {
      await db.insert(siteVisits)
        .values({ visit_date: new Date(), count: 1 })
        .onDuplicateKeyUpdate({ set: { count: sql`${siteVisits.count} + 1` } });
    }
  } catch (e) {
    console.error("Visit tracking error:", e);
  }
}

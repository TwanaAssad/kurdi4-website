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
  const { searchTerm, statusFilter, authorFilter, dateFilter, page = 1, pageSize = 10 } = params;
  const offset = (page - 1) * pageSize;

  let whereConditions = ['1=1'];
  const queryParams: any[] = [];

  if (searchTerm) {
    whereConditions.push('posts.title LIKE ?');
    queryParams.push(`%${searchTerm}%`);
  }
  if (statusFilter && statusFilter !== 'all') {
    whereConditions.push('posts.status = ?');
    queryParams.push(statusFilter);
  }
  if (authorFilter && authorFilter !== 'all') {
    whereConditions.push('posts.author_id = ?');
    queryParams.push(authorFilter);
  }
  if (dateFilter) {
    const dateObj = new Date(dateFilter);
    if (!isNaN(dateObj.getTime())) {
      whereConditions.push('posts.created_at >= ?');
      queryParams.push(dateObj.toISOString().slice(0, 10));
    }
  }

  const whereStr = whereConditions.join(' AND ');

  const dataResult = await db.execute(
    sql.raw(`SELECT id, title, content, excerpt, category, category_id, sub_category_id, image_url, status, author_id, created_at, views FROM posts WHERE ${whereStr} ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`)
  ) as any;

  const countResult = await db.execute(
    sql.raw(`SELECT COUNT(*) as total FROM posts WHERE ${whereStr}`)
  ) as any;

  const data = getRows(dataResult);
  const totalRows = getRows(countResult);
  const total = totalRows[0]?.total ?? 0;

  // Fetch tags for each post
  const postsWithTags = await Promise.all(data.map(async (post: any) => {
    const tagResult = await db.execute(
      sql`SELECT tag_id FROM post_tags WHERE post_id = ${post.id}`
    ) as any;
    return { ...post, post_tags: getRows(tagResult) };
  }));

  return { data: postsWithTags, count: Number(total) };
}

export async function createPostAction(data: any) {
  const { selectedTags, ...rawPostData } = data;
  const postData = cleanData(rawPostData, ["category_id", "sub_category_id", "views"]);

  const [result] = await db.insert(posts).values(postData);
  const postId = result.insertId;

  if (selectedTags && selectedTags.length > 0) {
    await db.insert(postTags).values(
      selectedTags.map((tagId: number | string) => ({ post_id: postId, tag_id: typeof tagId === 'string' ? parseInt(tagId) : tagId }))
    );
  }
  revalidatePath("/admin");
  return { success: true, id: postId };
}

export async function updatePostAction(id: number, data: any) {
  const { selectedTags, ...rawPostData } = data;
  const postData = cleanData(rawPostData, ["category_id", "sub_category_id", "views"], ["id", "created_at", "post_tags"]);

  await db.update(posts).set(postData).where(eq(posts.id, id));

  await db.delete(postTags).where(eq(postTags.post_id, id));
  if (selectedTags && selectedTags.length > 0) {
    await db.insert(postTags).values(
      selectedTags.map((tagId: number | string) => ({ post_id: id, tag_id: typeof tagId === 'string' ? parseInt(tagId) : tagId }))
    );
  }
  revalidatePath("/admin");
  return { success: true };
}

export async function deletePostAction(id: number) {
  await db.delete(postTags).where(eq(postTags.post_id, id));
  await db.delete(posts).where(eq(posts.id, id));
  revalidatePath("/admin");
  return { success: true };
}

// --- Categories ---
export async function getCategoriesAction() {
  const result = await db.execute(
    sql.raw(`SELECT * FROM categories ORDER BY name DESC`)
  ) as any;
  return getRows(result);
}

export async function createCategoryAction(data: any) {
  const categoryData = cleanData(data, ["parent_id"]);
  await db.insert(categories).values(categoryData);
  revalidatePath("/admin");
  return { success: true };
}

export async function updateCategoryAction(id: number, data: any) {
  const categoryData = cleanData(data, ["parent_id"], ["id"]);
  await db.update(categories).set(categoryData).where(eq(categories.id, id));
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteCategoryAction(id: number) {
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin");
  return { success: true };
}

// --- Tags ---
export async function getTagsAction() {
  const result = await db.execute(
    sql.raw(`SELECT * FROM tags ORDER BY name DESC`)
  ) as any;
  return getRows(result);
}

export async function createTagAction(data: any) {
  const tagData = cleanData(data);
  await db.insert(tags).values(tagData);
  revalidatePath("/admin");
  return { success: true };
}

export async function updateTagAction(id: number, data: any) {
  const tagData = cleanData(data, [], ["id"]);
  await db.update(tags).set(tagData).where(eq(tags.id, id));
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteTagAction(id: number) {
  await db.delete(tags).where(eq(tags.id, id));
  revalidatePath("/admin");
  return { success: true };
}

// --- Menu Items ---
export async function getMenuItemsAction() {
  const result = await db.execute(
    sql.raw(`SELECT * FROM menu_items ORDER BY sort_order DESC`)
  ) as any;
  return getRows(result);
}

export async function createMenuItemAction(data: any) {
  const itemData = cleanData(data, ["parent_id", "sort_order"]);
  if (itemData.sort_order === null) itemData.sort_order = 0;
  await db.insert(menuItems).values(itemData);
  revalidatePath("/admin");
  return { success: true };
}

export async function updateMenuItemAction(id: number, data: any) {
  const itemData = cleanData(data, ["parent_id", "sort_order"], ["id"]);
  if (itemData.sort_order === null) itemData.sort_order = 0;
  await db.update(menuItems).set(itemData).where(eq(menuItems.id, id));
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteMenuItemAction(id: number) {
  await db.delete(menuItems).where(eq(menuItems.id, id));
  revalidatePath("/admin");
  return { success: true };
}

// --- Pages ---
export async function getPagesAction(params: any = {}) {
  const { searchTerm, statusFilter, page = 1, pageSize = 10 } = params;
  const offset = (page - 1) * pageSize;

  let whereConditions = ['1=1'];
  if (searchTerm) whereConditions.push(`title LIKE '%${searchTerm.replace(/'/g, "\\'")}%'`);
  if (statusFilter && statusFilter !== 'all') whereConditions.push(`status = '${statusFilter}'`);

  const whereStr = whereConditions.join(' AND ');

  const dataResult = await db.execute(
    sql.raw(`SELECT * FROM pages WHERE ${whereStr} ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`)
  ) as any;

  const countResult = await db.execute(
    sql.raw(`SELECT COUNT(*) as total FROM pages WHERE ${whereStr}`)
  ) as any;

  const data = getRows(dataResult);
  const totalRows = getRows(countResult);
  return { data, count: Number(totalRows[0]?.total ?? 0) };
}

export async function createPageAction(data: any) {
  const pageData = cleanData(data);
  await db.insert(pages).values(pageData);
  revalidatePath("/admin");
  return { success: true };
}

export async function updatePageAction(id: number, data: any) {
  const pageData = cleanData(data, [], ["id", "created_at"]);
  await db.update(pages).set(pageData).where(eq(pages.id, id));
  revalidatePath("/admin");
  return { success: true };
}

export async function deletePageAction(id: number) {
  await db.delete(pages).where(eq(pages.id, id));
  revalidatePath("/admin");
  return { success: true };
}

// --- Profiles ---
export async function getProfilesAction(params: any = {}) {
  const { searchTerm, statusFilter, page = 1, pageSize = 10 } = params;
  const offset = (page - 1) * pageSize;

  let whereConditions = ['1=1'];
  if (searchTerm) whereConditions.push(`full_name LIKE '%${searchTerm.replace(/'/g, "\\'")}%'`);
  if (statusFilter && statusFilter !== 'all' && statusFilter !== 'deleted') {
    const statusVal = statusFilter === 'published' ? 'active' : 'suspended';
    whereConditions.push(`status = '${statusVal}'`);
  }

  const whereStr = whereConditions.join(' AND ');

  const dataResult = await db.execute(
    sql.raw(`SELECT * FROM profiles WHERE ${whereStr} ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`)
  ) as any;

  const countResult = await db.execute(
    sql.raw(`SELECT COUNT(*) as total FROM profiles WHERE ${whereStr}`)
  ) as any;

  const data = getRows(dataResult);
  const totalRows = getRows(countResult);
  return { data, count: Number(totalRows[0]?.total ?? 0) };
}

export async function updateProfileAction(id: string, data: any) {
  const profileData = cleanData(data, [], ["id", "created_at", "email"]);
  await db.update(profiles).set(profileData).where(eq(profiles.id, id));
  revalidatePath("/admin");
  return { success: true };
}

export async function createProfileAction(data: any) {
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
}

export async function deleteProfileAction(id: string) {
  await db.delete(profiles).where(eq(profiles.id, id));
  revalidatePath("/admin");
  return { success: true };
}

// --- Site Settings ---
export async function getSiteSettingsAction() {
  try {
    const result = await db.execute(
      sql.raw(`SELECT * FROM site_settings LIMIT 1`)
    ) as any;
    const rows = getRows(result);
    return rows[0] ?? null;
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
    return { success: false };
  }
}

// --- Stats ---
export async function getStatsAction() {
  const postCountRes = await db.execute(sql.raw(`SELECT COUNT(*) as total FROM posts`)) as any;
  const catCountRes = await db.execute(sql.raw(`SELECT COUNT(*) as total FROM categories`)) as any;
  const userCountRes = await db.execute(sql.raw(`SELECT COUNT(*) as total FROM profiles`)) as any;
  const postViewRes = await db.execute(sql.raw(`SELECT SUM(views) as total FROM posts`)) as any;
  const visitRes = await db.execute(sql.raw(`SELECT SUM(count) as total FROM site_visits`)) as any;

  const recentPostsRes = await db.execute(
    sql.raw(`SELECT * FROM posts ORDER BY created_at DESC LIMIT 5`)
  ) as any;

  const days = ['هەینی', 'پێنجشەممە', 'چوارشەممە', 'سێشەممە', 'دووشەممە', 'یەکشەممە', 'شەممە'].reverse();
  const chartData = await Promise.all(days.map(async (day, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const dateStr = date.toISOString().slice(0, 10);

    const visitRecord = await db.execute(
      sql.raw(`SELECT count FROM site_visits WHERE DATE(visit_date) = '${dateStr}' LIMIT 1`)
    ) as any;
    const rows = getRows(visitRecord);

    return { name: day, value: rows[0]?.count || 0 };
  }));

  return {
    totalPosts: Number(getRows(postCountRes)[0]?.total ?? 0),
    totalCategories: Number(getRows(catCountRes)[0]?.total ?? 0),
    totalUsers: Number(getRows(userCountRes)[0]?.total ?? 0),
    totalViews: Number(getRows(visitRes)[0]?.total ?? 0),
    postViews: Number(getRows(postViewRes)[0]?.total ?? 0),
    recentActivity: getRows(recentPostsRes),
    chartData,
  };
}

export async function trackVisitAction() {
  try {
    const existing = await db.execute(
      sql.raw(`SELECT id, count FROM site_visits WHERE DATE(visit_date) = CURDATE() LIMIT 1`)
    ) as any;

    const rows = getRows(existing);
    const row = rows[0];

    if (row?.id) {
      await db.execute(sql`UPDATE site_visits SET count = count + 1 WHERE id = ${row.id}`);
    } else {
      await db.execute(
        sql.raw(`INSERT INTO site_visits (visit_date, count) VALUES (NOW(), 1) ON DUPLICATE KEY UPDATE count = count + 1`)
      );
    }
  } catch (e) {
    console.error("Visit tracking error:", e);
  }
}

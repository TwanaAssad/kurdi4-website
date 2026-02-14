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
  
  // Remove ignored fields
  ignoreFields.forEach(field => delete cleaned[field]);
  
  // Clean up all fields (convert empty strings to null or appropriate types)
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === "" || cleaned[key] === undefined) {
      cleaned[key] = null;
    }
  });

  // Handle numeric fields
  numericFields.forEach(field => {
    if (cleaned[field] !== null) {
      const parsed = parseInt(cleaned[field]);
      cleaned[field] = isNaN(parsed) ? null : parsed;
    }
  });

  return cleaned;
}

// --- Posts ---
export async function getPostsAction(params: any = {}) {
  const { searchTerm, statusFilter, authorFilter, dateFilter, page = 1, pageSize = 10 } = params;
  const offset = (page - 1) * pageSize;

  let conditions = [];
  if (searchTerm) conditions.push(like(posts.title, `%${searchTerm}%`));
  if (statusFilter && statusFilter !== 'all') conditions.push(eq(posts.status, statusFilter as any));
  if (authorFilter && authorFilter !== 'all') conditions.push(eq(posts.author_id, authorFilter));
  
  if (dateFilter) {
    // Ensure date is in MySQL format
    const dateObj = new Date(dateFilter);
    if (!isNaN(dateObj.getTime())) {
      conditions.push(gte(posts.created_at, dateObj));
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db.query.posts.findMany({
    where: whereClause,
    orderBy: [desc(posts.created_at)],
    limit: pageSize,
    offset: offset,
  });

  const totalResult = await db.select({ value: count() }).from(posts).where(whereClause);
  
  // Fetch tags for each post
  const postsWithTags = await Promise.all(data.map(async (post) => {
    const t = await db.select({ tag_id: postTags.tag_id }).from(postTags).where(eq(postTags.post_id, post.id));
    return { ...post, post_tags: t };
  }));

  return { data: postsWithTags, count: totalResult[0].value };
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

  // Update tags
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
  const data = await db.query.categories.findMany({
    orderBy: [desc(categories.name)],
  });
  return data;
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
  return await db.query.tags.findMany({
    orderBy: [desc(tags.name)],
  });
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
  return await db.query.menuItems.findMany({
    orderBy: [desc(menuItems.sort_order)],
  });
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

  let conditions = [];
  if (searchTerm) conditions.push(like(pages.title, `%${searchTerm}%`));
  if (statusFilter && statusFilter !== 'all') conditions.push(eq(pages.status, statusFilter));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db.query.pages.findMany({
    where: whereClause,
    orderBy: [desc(pages.created_at)],
    limit: pageSize,
    offset: offset,
  });

  const totalResult = await db.select({ value: count() }).from(pages).where(whereClause);
  return { data, count: totalResult[0].value };
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

  let conditions = [];
  if (searchTerm) conditions.push(like(profiles.full_name, `%${searchTerm}%`));
  if (statusFilter && statusFilter !== 'all' && statusFilter !== 'deleted') {
    conditions.push(eq(profiles.status, statusFilter === 'published' ? 'active' : 'suspended'));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db.query.profiles.findMany({
    where: whereClause,
    orderBy: [desc(profiles.created_at)],
    limit: pageSize,
    offset: offset,
  });

  const totalResult = await db.select({ value: count() }).from(profiles).where(whereClause);
  return { data, count: totalResult[0].value };
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
    const data = await db.query.siteSettings.findFirst();
    return data;
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return null;
  }
}

export async function updateSiteSettingsAction(data: any) {
  try {
    // Use raw SQL to ensure the update actually persists
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
  const postCount = await db.select({ value: count() }).from(posts);
  const catCount = await db.select({ value: count() }).from(categories);
  const userCount = await db.select({ value: count() }).from(profiles);
  const postViewCount = await db.select({ value: sql<number>`sum(${posts.views})` }).from(posts);
  const totalSiteVisitCount = await db.select({ value: sql<number>`sum(${siteVisits.count})` }).from(siteVisits);
  
  const recentPosts = await db.query.posts.findMany({
    orderBy: [desc(posts.created_at)],
    limit: 5,
  });

  // Generate real data for the last 7 days from siteVisits table
  const days = ['هەینی', 'پێنجشەممە', 'چوارشەممە', 'سێشەممە', 'دووشەممە', 'یەکشەممە', 'شەممە'].reverse();
  const chartData = await Promise.all(days.map(async (day, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    
    const visitRecord = await db.query.siteVisits.findFirst({
      where: eq(siteVisits.visit_date, startOfDay)
    });
    
    return {
      name: day,
      value: visitRecord?.count || 0
    };
  }));

  return {
    totalPosts: postCount[0].value,
    totalCategories: catCount[0].value,
    totalUsers: userCount[0].value,
    totalViews: totalSiteVisitCount[0].value || 0,
    postViews: postViewCount[0].value || 0,
    recentActivity: recentPosts,
    chartData: chartData
  };
}

export async function trackVisitAction() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Try to find today's record
  const existing = await db.query.siteVisits.findFirst({
    where: eq(siteVisits.visit_date, today)
  });

  if (existing) {
    await db.update(siteVisits)
      .set({ count: sql`${siteVisits.count} + 1` })
      .where(eq(siteVisits.id, existing.id));
  } else {
    try {
      await db.insert(siteVisits).values({
        visit_date: today,
        count: 1
      });
    } catch (e) {
      // In case of race condition
      await db.update(siteVisits)
        .set({ count: sql`${siteVisits.count} + 1` })
        .where(eq(siteVisits.visit_date, today));
    }
  }
}

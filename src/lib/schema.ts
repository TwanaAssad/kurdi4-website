import { mysqlTable, serial, text, varchar, timestamp, int, boolean, json, mysqlEnum } from "drizzle-orm/mysql-core";

export const siteSettings = mysqlTable("site_settings", {
  id: serial("id").primaryKey(),
  org_name: varchar("org_name", { length: 255 }).default("زانست و پەروەردەی کوردی"),
  logo_url: text("logo_url"),
  primary_color: varchar("primary_color", { length: 7 }).default("#563a4a"),
  secondary_color: varchar("secondary_color", { length: 7 }).default("#c29181"),
  accent_color: varchar("accent_color", { length: 7 }).default("#f0ecee"),
  social_facebook: text("social_facebook"),
  social_tiktok: text("social_tiktok"),
  social_instagram: text("social_instagram"),
  social_linkedin: text("social_linkedin"),
  social_youtube: text("social_youtube"),
  available_languages: json("available_languages").default(["ku"]),
  default_language: varchar("default_language", { length: 5 }).default("ku"),
  contact_phone: varchar("contact_phone", { length: 50 }),
  contact_email: varchar("contact_email", { length: 255 }),
  contact_location: text("contact_location"),
});

export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  parent_id: int("parent_id"),
});

export const posts = mysqlTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content"),
  excerpt: text("excerpt"),
  category: varchar("category", { length: 255 }),
  category_id: int("category_id"),
  sub_category_id: int("sub_category_id"),
  image_url: text("image_url"),
  status: mysqlEnum("status", ["published", "draft", "deleted"]).default("published"),
  author_id: varchar("author_id", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
  views: int("views").default(0),
});

export const tags = mysqlTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
});

export const postTags = mysqlTable("post_tags", {
  post_id: int("post_id").notNull(),
  tag_id: int("tag_id").notNull(),
});

export const profiles = mysqlTable("profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  full_name: varchar("full_name", { length: 255 }),
  role: varchar("role", { length: 50 }).default("user"),
  avatar_url: text("avatar_url"),
  status: varchar("status", { length: 50 }).default("active"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
});

export const menuItems = mysqlTable("menu_items", {
  id: serial("id").primaryKey(),
  label: varchar("label", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // page, category, custom
  target_id: varchar("target_id", { length: 255 }),
  url: text("url"),
  sort_order: int("sort_order").default(0),
  parent_id: int("parent_id"),
});

export const pages = mysqlTable("pages", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  status: varchar("status", { length: 50 }).default("published"),
  card1_title: varchar("card1_title", { length: 255 }),
  card1_content: text("card1_content"),
  card2_title: varchar("card2_title", { length: 255 }),
  card2_content: text("card2_content"),
  card3_title: varchar("card3_title", { length: 255 }),
  card3_content: text("card3_content"),
  author_id: varchar("author_id", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
});

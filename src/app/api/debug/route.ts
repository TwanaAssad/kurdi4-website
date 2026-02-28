import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  const result = await db.execute(sql.raw('SELECT id, title, image_url FROM posts ORDER BY id DESC LIMIT 5')) as any;
  const rows = Array.isArray(result) ? (Array.isArray(result[0]) ? result[0] : result) : (result?.rows ?? []);
  return NextResponse.json(rows);
}
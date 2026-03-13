import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    await db.execute(sql`ALTER TABLE site_settings ADD COLUMN social_telegram TEXT NULL`);
    return NextResponse.json({ success: true, message: 'Column social_telegram added' });
  } catch (error: any) {
    const msg = String(error);
    // errno 1060 = Duplicate column name (already exists)
    if (msg.includes('Duplicate column') || msg.includes('1060')) {
      return NextResponse.json({ success: true, message: 'Column already exists' });
    }
    return NextResponse.json({ success: false, error: msg, detail: error?.cause ?? null }, { status: 500 });
  }
}

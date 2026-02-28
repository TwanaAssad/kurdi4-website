import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request: NextRequest) {
  let uploadDir = 'unknown';
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    // Path to public/uploads
    const baseDir = process.env.PWD || process.cwd();
    uploadDir = path.resolve(baseDir, 'public', 'uploads');
    
    // Ensure directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true, mode: 0o755 });
    }

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    // Public URL for local storage
    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({ success: true, publicUrl });
    } catch (error: any) {
      console.error('Error uploading file to', uploadDir, ':', error);
      return NextResponse.json({ 
        error: `Failed to upload to ${uploadDir}. Error: ${error.message}` 
      }, { status: 500 });
    }
}

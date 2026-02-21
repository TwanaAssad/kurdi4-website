import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
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
    
    const bucketName = 'uploads';

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin
      .storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      // If bucket doesn't exist, try to create it
      if (error.message.includes('bucket not found') || error.message.includes('does not exist')) {
        await supabaseAdmin.storage.createBucket(bucketName, {
          public: true
        });
        
        // Try upload again
        const { data: retryData, error: retryError } = await supabaseAdmin
          .storage
          .from(bucketName)
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true
          });
          
        if (retryError) throw retryError;
      } else {
        throw error;
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return NextResponse.json({ success: true, publicUrl });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

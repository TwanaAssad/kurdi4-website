
import { db } from '../src/lib/db';
import { posts, pages, siteSettings } from '../src/lib/schema';
import { eq } from 'drizzle-orm';

async function test() {
  console.log('--- Testing Database Operations ---');

  try {
    // 1. Test Site Settings Fetch
    console.log('Testing site_settings fetch...');
    const settings = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, 1),
    });
    console.log('Site Settings:', settings ? 'Found' : 'Not Found');

    // 2. Test Post Creation with numeric fields
    console.log('Testing post creation...');
    const testPost = {
      title: 'Test Post ' + Date.now(),
      content: 'Test Content',
      category_id: 1,
      sub_category_id: null,
      status: 'draft' as any,
      author_id: 'test-user'
    };
    const [postResult] = await db.insert(posts).values(testPost);
    console.log('Post created with ID:', postResult.insertId);

    // 3. Test Page Creation
    console.log('Testing page creation...');
    const testPage = {
      title: 'Test Page ' + Date.now(),
      slug: 'test-page-' + Date.now(),
      content: 'Test Page Content',
      status: 'draft',
      author_id: 'test-user'
    };
    const [pageResult] = await db.insert(pages).values(testPage);
    console.log('Page created with ID:', pageResult.insertId);

    // Cleanup
    console.log('Cleaning up...');
    await db.delete(posts).where(eq(posts.id, postResult.insertId));
    await db.delete(pages).where(eq(pages.id, pageResult.insertId));
    
    console.log('--- All tests passed! ---');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

test();

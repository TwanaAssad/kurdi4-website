import React from 'react';
import Image from 'next/image';
import Header from "@/components/sections/Header";
import MainNavigation from "@/components/sections/MainNavigation";
import Footer from "@/components/sections/Footer";
import SidebarWidgets from "@/components/sections/SidebarWidgets";
import { getSiteSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import { posts, categories, postTags, tags } from "@/lib/schema";
import { eq, sql, and, neq } from "drizzle-orm";
import { Eye, Calendar, User, Twitter, Copy } from 'lucide-react';
import { notFound } from 'next/navigation';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

async function getPost(id: string) {
  const postId = parseInt(id);
  if (isNaN(postId)) return null;

  const data = await db.query.posts.findFirst({
    where: eq(posts.id, postId)
  });

  if (!data) return null;

  // Get category slug
  let categorySlug = null;
  if (data.category) {
    const catData = await db.query.categories.findFirst({
      where: eq(categories.name, data.category)
    });
    categorySlug = catData?.slug;
  }

  // Get tags
  const tagData = await db
    .select({ name: tags.name })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tag_id, tags.id))
    .where(eq(postTags.post_id, postId));

  const postTagsList = tagData?.map((t: any) => t.name) || [];

  // Increment views
  try {
    await db
      .update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(eq(posts.id, postId));
  } catch (e) {
    console.error("Failed to increment views:", e);
  }

  return { ...data, categorySlug, tags: postTagsList };
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPost(id);
  const settings = await getSiteSettings();

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString('ku-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#fafafa]" dir="rtl">
      <Header settings={settings} />
      <MainNavigation />
      
      <main className="container mx-auto py-12 px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <article className="flex-1 max-w-4xl bg-white rounded-[3rem] overflow-hidden shadow-sm border border-gray-100">
            {/* Post Header Image */}
              <div className="relative h-[300px] md:h-[500px] w-full">
                <Image
                  src={post.image_url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070"}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-10 right-10 text-white z-10">
                  <a 
                    href={post.categorySlug ? `/category/${post.categorySlug}` : '#'}
                    className="bg-[#c29181] px-6 py-2 rounded-2xl text-xs font-black shadow-lg mb-4 inline-block hover:bg-[#563a4a] transition-all"
                  >
                    {post.category || 'گشتی'}
                  </a>
                  <h1 className="text-3xl md:text-5xl font-black leading-tight drop-shadow-md">
                    {post.title}
                  </h1>
                </div>
              </div>

            {/* Post Meta */}
            <div className="px-8 md:px-12 py-8 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3 text-gray-500 font-bold text-sm">
                <Calendar size={18} className="text-[#c29181]" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 font-bold text-sm">
                <Eye size={18} className="text-[#c29181]" />
                <span>{post.views || 0} بینین</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 font-bold text-sm">
                <User size={18} className="text-[#c29181]" />
                <span>نووسەر: دەستەی کارگێڕی</span>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-8 md:px-12 py-12">
              <div className="text-xl md:text-2xl text-gray-500 font-medium leading-relaxed mb-10 italic border-r-4 border-[#c29181] pr-6">
                {post.excerpt}
              </div>
              
              <div 
                className="prose prose-xl max-w-none text-[#563a4a] leading-[2.2] font-medium whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Share Buttons */}
              <div className="mt-16 pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <span className="font-black text-[#563a4a] ml-4">بڵاوکردنەوە:</span>
                    <button className="w-12 h-12 rounded-2xl bg-[#1DA1F2]/10 text-[#1DA1F2] flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-all">
                      <Twitter size={20} />
                    </button>
                    <button className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-all">
                      <Copy size={20} />
                    </button>
                  </div>
                
                  <div className="flex flex-wrap gap-2">
                    {post.tags?.map((tag: string) => (
                      <span key={tag} className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-500 hover:bg-[#c29181]/10 hover:text-[#c29181] transition-colors cursor-default">#{tag}</span>
                    ))}
                    {(!post.tags || post.tags.length === 0) && (
                      <span className="text-gray-300 text-xs font-bold italic">هیچ تاگێک نییە</span>
                    )}
                  </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <SidebarWidgets />
        </div>

        {/* Related Posts Section */}
        <RelatedPosts currentId={post.id} category={post.category} />
      </main>

      <Footer settings={settings} />
    </div>
  );
}

async function RelatedPosts({ currentId, category }: { currentId: number, category: string | null }) {
  if (!category) return null;

  const related = await db.query.posts.findMany({
    where: and(
      eq(posts.category, category),
      neq(posts.id, currentId),
      eq(posts.status, 'published')
    ),
    limit: 3
  });

  if (!related || related.length === 0) return null;

  const catData = await db.query.categories.findFirst({
    where: eq(categories.name, category)
  });

  const categorySlug = catData?.slug;

  return (
    <section className="mt-20">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-3xl font-black text-[#563a4a]">بابەتی پەیوەندیدار</h2>
        <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-[#c29181]/20 to-transparent"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {related.map((article) => (
          <div 
            key={article.id} 
            className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-50 flex flex-col h-full"
          >
            <div className="relative h-56 overflow-hidden">
              <Image
                src={article.image_url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070"}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <a 
                href={categorySlug ? `/category/${categorySlug}` : '#'}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[#563a4a] px-4 py-1.5 rounded-xl text-[10px] font-black shadow-sm hover:bg-[#c29181] hover:text-white transition-all z-10"
              >
                {article.category || 'گشتی'}
              </a>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-lg font-black text-[#563a4a] leading-tight group-hover:text-[#c29181] transition-colors line-clamp-2">
                <a href={`/post/${article.id}`}>{article.title}</a>
              </h3>
              <p className="text-gray-400 text-sm mt-auto pt-4 flex items-center gap-2">
                <Calendar size={14} />
                {new Date(article.created_at).toLocaleDateString('ku-IQ')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

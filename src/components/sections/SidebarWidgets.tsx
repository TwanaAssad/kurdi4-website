"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Facebook, Instagram, Youtube } from 'lucide-react';

const TiktokIcon = ({ size = 20 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

  interface Post {
    id: string;
    title: string;
    created_at: string;
    image_url: string;
  }

    interface Category {
      name: string;
      slug: string;
      count: number;
    }

    const SidebarWidgets = ({ settings }: { settings?: any }) => {
      const [latestPosts, setLatestPosts] = useState<Post[]>([]);
      const [categories, setCategories] = useState<Category[]>([]);


    useEffect(() => {
      async function fetchData() {
        try {
          // Fetch latest posts
          const postsRes = await fetch('/api/posts?limit=5');
          const postsData = await postsRes.json();
          if (postsData.data) {
            setLatestPosts(postsData.data);
          }

          // Fetch all categories and their counts
          const categoriesRes = await fetch('/api/categories');
          const categoriesData = await categoriesRes.json();
          if (Array.isArray(categoriesData)) {
            setCategories(categoriesData);
          }
        } catch (err) {
          console.error('Unexpected error in fetchData:', err);
        }
      }

      fetchData();
    }, []);

  return (
    <aside className="w-full lg:w-[350px] flex-shrink-0 flex flex-col gap-10" dir="rtl">
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-black text-[#563a4a] relative pr-3">
            نوێترین بابەتەکان
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#c29181] rounded-full"></span>
          </h2>
        </div>
        <ul className="flex flex-col gap-6">
            {latestPosts.map((post) => (
              <li key={post.id}>
                <a href={`/post/${post.id}`} className="flex gap-4 items-center group">
                  <div className="flex-shrink-0 block w-20 h-20 rounded-2xl overflow-hidden relative">
                    <Image
                      src={post.image_url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop"}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <h3 className="text-sm font-bold text-[#563a4a] leading-tight group-hover:text-[#c29181] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {new Date(post.created_at).toLocaleDateString('ku-IQ')}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          {latestPosts.length === 0 && <p className="text-gray-400 text-sm text-center py-4">هیچ بابەتێک نەدۆزرایەوە.</p>}
        </ul>
      </section>

      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h2 className="text-lg font-black text-[#563a4a] relative pr-3">
            هاوپۆلەکان
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#c29181] rounded-full"></span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 justify-start">
          {categories.map((cat, idx) => (
            <a key={idx} href={`/category/${cat.slug}`} className="bg-gray-50 hover:bg-[#563a4a] hover:text-white px-4 py-2 rounded-full text-xs font-bold text-[#563a4a] transition-all flex items-center gap-2 border border-gray-100 group">
              {cat.name}
              <span className="opacity-50 text-[10px] bg-black/5 w-5 h-5 flex items-center justify-center rounded-full group-hover:bg-white/20">
                {cat.count}
              </span>
            </a>
          ))}
          {categories.length === 0 && <p className="text-gray-400 text-sm text-center py-4 w-full">هیچ هاوپۆلێک نەدۆزرایەوە.</p>}
        </div>
      </section>

      <section className="bg-[#563a4a] p-8 rounded-3xl shadow-lg text-white relative overflow-hidden">
        <div className="relative z-10 text-right">
          <h2 className="text-xl font-black mb-4">پەیوەندیمان پێوە بکەن</h2>
          <p className="text-white/70 text-sm mb-6 leading-relaxed">فۆڵۆومان بکەن لە سۆشیال میدیا بۆ ئاگاداربوون لە دوایین چالاکی و بەرنامەکانمان.</p>
          <div className="flex gap-4 justify-end">
            <a href={settings?.social_facebook || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-all"><Facebook size={18} /></a>
            <a href={settings?.social_tiktok || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-black transition-all"><TiktokIcon size={18} /></a>
            <a href={settings?.social_instagram || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink-600 transition-all"><Instagram size={18} /></a>
            <a href={settings?.social_youtube || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition-all"><Youtube size={18} /></a>
          </div>
        </div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#c29181]/20 rounded-full blur-3xl"></div>
      </section>
    </aside>
  );
};

export default SidebarWidgets;

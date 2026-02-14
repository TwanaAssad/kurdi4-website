"use client";

import React, { useEffect, useState } from 'react';
import { FileText, ChevronRight, ChevronLeft } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  created_at: string;
  views: number;
  image_url: string;
  main_category: string;
}

const ITEMS_PER_PAGE = 10;

export default function LatestNewsFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        // Fetch categories for slug mapping
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (catData && Array.isArray(catData)) {
          const map: Record<string, string> = {};
          catData.forEach(c => map[c.name] = c.slug);
          setCategories(map);
        }

        // Build query URL
        let url = `/api/posts?page=${page}&limit=${ITEMS_PER_PAGE}`;
        if (selectedCategory) {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }

        const res = await fetch(url);
        const { data, total } = await res.json();

        if (data) {
          setArticles(data);
          setTotalCount(total || 0);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [page, selectedCategory]);

  const categoryList = Object.keys(categories);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (loading && articles.length === 0) {
    return (
      <div className="p-20 text-center">
        <div className="w-12 h-12 border-4 border-[#c29181] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 font-bold">چاوەڕوانبە...</p>
      </div>
    );
  }

  return (
    <section className="space-y-10" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black text-[#563a4a] relative pr-6">
          نوێترین بابەتەکان
          <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-10 bg-[#c29181] rounded-full shadow-lg shadow-[#c29181]/20"></span>
      </h2>
    </div>
    
    <div className={`grid grid-cols-1 gap-10 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>


        {articles.map((article) => (
          <div key={article.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 border border-gray-50 group flex flex-col md:flex-row h-full">
            {/* Thumbnail Area */}
            <div className="md:w-80 lg:w-96 w-full flex-shrink-0 relative overflow-hidden h-72 md:h-auto">
              <div className="w-full h-full relative">
                  <img
                    src={article.image_url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop"}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 absolute inset-0"
                  />
                  <a 
                    href={categories[article.main_category] ? `/category/${categories[article.main_category]}` : '#'}
                    className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-[#563a4a] px-4 py-1.5 rounded-xl text-[10px] font-black shadow-sm hover:bg-[#c29181] hover:text-white transition-all z-10 border border-gray-100/50"
                  >
                    {article.main_category || 'گشتی'}
                  </a>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-col flex-grow p-8 lg:p-12 text-right">
              <div className="flex flex-wrap items-center gap-6 mb-6 text-gray-400 text-xs font-bold tracking-widest uppercase">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#c29181] rounded-full"></span>
                  {new Date(article.created_at).toLocaleDateString('ku-IQ')}
                </span>
                <span className="flex items-center gap-2">
                  <EyeIcon size={16} className="text-gray-400" />
                  {article.views || 0} بینین
                </span>
              </div>

              <h3 className="mb-6">
                <a 
                  href={`/post/${article.id}`} 
                  className="text-2xl lg:text-3xl font-black leading-tight text-[#563a4a] hover:text-[#c29181] transition-colors duration-300 block"
                >
                  {article.title}
                </a>
              </h3>

              <p className="text-gray-500 text-base lg:text-lg leading-relaxed line-clamp-3 mb-8 font-medium">
                {article.excerpt}
              </p>
              
                <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-8">
                  <a 
                    href={`/post/${article.id}`}
                    className="bg-[#563a4a] hover:bg-[#c29181] text-white px-8 py-4 rounded-2xl text-sm font-black transition-all duration-300 shadow-xl shadow-[#563a4a]/10 hover:-translate-y-1 inline-block"
                  >
                    زیاتر بخوێنەرەوە
                  </a>
                </div>
            </div>
          </div>
        ))}
        
        {articles.length === 0 && !loading && (
            <div className="text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-gray-50">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                <FileText size={40} />
              </div>
              <p className="text-gray-400 font-bold text-lg tracking-wide">هیچ بابەتێک نایاب نەکراوە</p>
            </div>

        )}
      </div>

      {/* Modern Pagination */}
      {totalPages > 1 && (
        <div className="mt-20 flex flex-col items-center gap-10">
          <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-3 rounded-[2rem] shadow-sm border border-gray-50">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-6 h-14 rounded-2xl border-2 border-gray-100 flex items-center gap-3 text-[#563a4a] hover:bg-[#563a4a] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#563a4a] transition-all group font-black"
            >
              <span>دواتر</span>
              <ChevronRight size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="hidden sm:flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-14 h-14 rounded-2xl text-sm font-black transition-all ${
                    page === i 
                      ? 'bg-[#563a4a] text-white shadow-xl shadow-[#563a4a]/20 scale-110' 
                      : 'bg-white border-2 border-gray-50 text-gray-400 hover:border-[#c29181] hover:text-[#c29181]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="sm:hidden flex items-center px-4 font-black text-[#563a4a]">
              {page + 1} / {totalPages}
            </div>

            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-6 h-14 rounded-2xl border-2 border-gray-100 flex items-center gap-3 text-[#563a4a] hover:bg-[#563a4a] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#563a4a] transition-all group font-black"
            >
              <ChevronLeft size={20} className="group-hover:translate-x-1 transition-transform" />
              <span>پێشوو</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
            <span className="w-10 h-[2px] bg-gray-100"></span>
            <span>پەڕەی {page + 1} لە کۆی {totalPages}</span>
            <span className="w-10 h-[2px] bg-gray-100"></span>
          </div>
        </div>
      )}
    </section>
  );
}

const EyeIcon = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

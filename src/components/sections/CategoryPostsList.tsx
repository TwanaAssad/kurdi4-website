"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { Share2, Facebook, Linkedin, ChevronRight, ChevronLeft, Calendar, Eye, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  created_at: string;
  views: number;
  image_url: string;
}

const ITEMS_PER_PAGE = 9; // Grid friendly

interface CategoryPostsListProps {
  categoryName: string;
}

function CategoryPostsContent({ categoryName }: CategoryPostsListProps) {
  const searchParams = useSearchParams();
  const subFilter = searchParams.get('sub');
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
      async function fetchPosts() {
        setLoading(true);
        try {
          const res = await fetch(`/api/posts?category=${encodeURIComponent(categoryName)}&search=${encodeURIComponent(subFilter || '')}&page=${page}&limit=${ITEMS_PER_PAGE}`);
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
    }, [page, categoryName, subFilter]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleShare = (platform: string, article: Article) => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/post/${article.id}` : '';
    let shareUrl = '';
    
    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (loading && articles.length === 0) {
    return (
      <div className="p-20 text-center bg-white rounded-[3rem] shadow-sm border border-gray-100">
        <div className="w-12 h-12 border-4 border-[#c29181] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 font-bold">چاوەڕوانبە...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-gray-100">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
          <Search size={40} />
        </div>
        <p className="text-gray-400 font-bold text-lg tracking-wide">
          {subFilter ? `هیچ بابەتێک دەربارەی "${subFilter}" نەدۆزرایەوە` : 'هیچ بابەتێک لەم هاوپۆلەدا نییە'}
        </p>
        <a href="/" className="text-[#c29181] font-black mt-4 inline-block hover:underline uppercase text-sm">گەڕانەوە بۆ سەرەتا</a>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {subFilter && (
        <div className="bg-[#563a4a] text-white p-6 rounded-2xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Search size={20} className="text-[#c29181]" />
            </div>
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">فلتەر کراوە بەپێی</p>
              <h4 className="text-xl font-black">{subFilter}</h4>
            </div>
          </div>
          <Link href={`?`} className="text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all">لابردنی فلتەر</Link>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        {articles.map((article) => (
          <div key={article.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_70px_rgba(0,0,0,0.1)] transition-all duration-500 border border-gray-50 group flex flex-col h-full">
            <div className="relative h-64 overflow-hidden">
              <Image
                src={article.image_url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop"}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            <div className="flex flex-col flex-grow p-8 text-right">
              <div className="flex items-center gap-4 mb-4 text-gray-400 text-[10px] font-black tracking-widest uppercase">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-[#c29181]" />
                  {new Date(article.created_at).toLocaleDateString('ku-IQ')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye size={12} className="text-[#c29181]" />
                  {article.views || 0}
                </span>
              </div>

              <h3 className="mb-4">
                <a 
                  href={`/post/${article.id}`} 
                  className="text-xl font-black leading-snug text-[#563a4a] hover:text-[#c29181] transition-colors duration-300 block line-clamp-2"
                >
                  {article.title}
                </a>
              </h3>

              <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-6 font-medium">
                {article.excerpt}
              </p>
              
              <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-6">
                <a 
                  href={`/post/${article.id}`}
                  className="text-[#563a4a] hover:text-[#c29181] text-xs font-black flex items-center gap-2 group/btn"
                >
                  <span>زیاتر بخوێنەرەوە</span>
                  <ChevronLeft size={14} className="group-hover/btn:-translate-x-1 transition-transform" />
                </a>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleShare('facebook', article)}
                    className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#1877F2] hover:text-white transition-all"
                  >
                    <Facebook size={14} />
                  </button>
                    <button 
                      onClick={() => handleShare('linkedin', article)}
                      className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#0077B5] hover:text-white transition-all"
                    >
                      <Linkedin size={14} />
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-16 flex justify-center">
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-50">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center text-[#563a4a] hover:bg-[#563a4a] hover:text-white disabled:opacity-30 transition-all"
            >
              <ChevronRight size={18} />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                  page === i 
                    ? 'bg-[#563a4a] text-white shadow-lg' 
                    : 'bg-white border border-gray-50 text-gray-400 hover:border-[#c29181]'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center text-[#563a4a] hover:bg-[#563a4a] hover:text-white disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CategoryPostsList(props: CategoryPostsListProps) {
  return (
    <Suspense fallback={
      <div className="p-20 text-center bg-white rounded-[3rem] shadow-sm border border-gray-100">
        <div className="w-12 h-12 border-4 border-[#c29181] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 font-bold">چاوەڕوانبە...</p>
      </div>
    }>
      <CategoryPostsContent {...props} />
    </Suspense>
  );
}

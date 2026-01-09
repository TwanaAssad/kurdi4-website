import React from 'react';
import Image from 'next/image';
import { Flame, ChevronLeft } from 'lucide-react';

/**
 * HeroNewsFeed Component
 * 
 * Clones the main content area's featured post section with large article cards.
 * Key features:
 * - RTL layout (Right-to-Left)
 * - Large thumbnails on the right (on desktop)
 * - Kurdish titles and excerpts
 * - Metadata with dates and view counts (fire icon)
 * - Category badges overlaying the thumbnails
 */

const posts = [
  {
    id: 2481,
    title: 'ساڵی نوێی خوێندن لە دەزگای ڕووناکی',
    excerpt: 'دوای تەواوبوونی ساڵی یەکەمی خوێندن بە سەرکەوتوویی بەشی بانگخوازانی (بەشی برایان) لە دەزگای ڕووناکی ساڵی نوێی خوێندنی دەستپێکرد.دووەم وانە لە…',
    date: 'كانونی دووه‌م 7, 2026',
    views: 0,
    category: 'پەروەردە و فێرکردن',
    imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/988add51-608a-4a7f-84e3-7b9ad52c69e0-dazgayrunaki-com/assets/images/IMG_0045-1-390x220-2.jpg',
    url: '#'
  },
  {
    id: 2469,
    title: '📝 کۆبوونەوەی ئاسایی لیژنەی داڕشتنەوەی پڕۆژەکان',
    excerpt: 'لەپێناو بەرهەمدارترکردنی هەنگاوەکانمان، ئەمڕۆ لە دەزگای ڕووناکی کۆبوونەوەی لیژنەی داڕشتنەوەی پڕۆژەکان بەڕێوەچوو.لە کۆبوونەوەکەدا گفتوگۆ لەسەر داڕشتنی پلان و بیرۆکەی نوێ…',
    date: 'كانونی دووه‌م 5, 2026',
    views: 8,
    category: 'Uncategorized',
    imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/988add51-608a-4a7f-84e3-7b9ad52c69e0-dazgayrunaki-com/assets/images/IMG_0017-390x220-3.jpg',
    url: '#'
  },
  {
    id: 2449,
    title: 'ساڵی نوێی خوێندن لە دەزگای ڕووناکی',
    excerpt: 'دوای تەواوبوونی ساڵی یەکەمی خوێندن بە سەرکەوتوویی، بەشی بانگخوازانی (بەشی برایان) لە دەزگای ڕووناکی ساڵی نوێی خوێندنی دەستپێکرد. ڕۆژی سێشەممە،…',
    date: 'كانونی دووه‌م 3, 2026',
    views: 5,
    category: 'Uncategorized',
    imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/988add51-608a-4a7f-84e3-7b9ad52c69e0-dazgayrunaki-com/assets/images/IMG_6031-390x220-4.png',
    url: '#'
  }
];

const PostCard = ({ post }: { post: typeof posts[0] }) => {
  return (
    <li className="post-item mb-[25px] pb-[25px] border-b border-[#eeeeee] last:border-0 last:mb-0 last:pb-0 list-none">
      <div className="flex flex-col md:flex-row-reverse gap-0 md:gap-[20px]">
        {/* Post Thumbnail */}
        <div className="relative w-full md:w-[390px] h-auto flex-shrink-0">
          <a href={post.url} className="block group overflow-hidden relative">
            <div className="aspect-[390/220] relative w-full overflow-hidden">
              <Image
                src={post.imageUrl}
                alt={post.title}
                width={390}
                height={220}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            {/* Category Badge overlay on bottom-right of image */}
            <span className="absolute bottom-0 right-0 bg-[#563d4dcc] text-white px-[8px] py-[2px] text-[11px] font-bold z-10 transition-colors hover:bg-[#c3846d]">
              {post.category}
            </span>
          </a>
        </div>

        {/* Post Details */}
        <div className="post-details flex-grow pt-[15px] md:pt-0">
          <div className="post-meta flex flex-row items-center justify-between text-[#666666] text-[12px] mb-[10px]">
            <span className="date flex items-center gap-1">
              {post.date}
            </span>
            <div className="flex items-center gap-1">
              <Flame size={12} className="text-[#666666]" />
              <span className="meta-views">{post.views}</span>
            </div>
          </div>

          <h2 className="post-title mb-[10px]">
            <a 
              href={post.url} 
              className="text-[24px] font-[800] leading-[1.3] text-[#333333] hover:text-[#c3846d] transition-colors line-clamp-2"
            >
              {post.title}
            </a>
          </h2>

          <p className="post-excerpt text-[#666666] text-[14px] leading-[1.7] line-clamp-3 mb-0">
            {post.excerpt}
          </p>
        </div>
      </div>
    </li>
  );
};

export default function HeroNewsFeed() {
  return (
    <section className="mag-box wide-post-box w-full">
      <div className="mag-box-container">
        <ul className="posts-items flex flex-col p-0 m-0">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>

        {/* Post with featured styling from different visuals */}
        <li className="post-item mb-[25px] pb-[25px] border-b border-[#eeeeee] list-none">
          <div className="flex flex-col md:flex-row-reverse gap-0 md:gap-[20px]">
            <div className="relative w-full md:w-[390px] h-auto flex-shrink-0">
              <a href="#" className="block group overflow-hidden relative">
                <div className="aspect-[390/220] relative w-full overflow-hidden bg-[#eee]">
                    {/* Placeholder for additional section assets if needed */}
                   <img 
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/988add51-608a-4a7f-84e3-7b9ad52c69e0-dazgayrunaki-com/assets/images/0P4A6739-390x220.png" 
                    alt="ژیار" 
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                   />
                </div>
                <span className="absolute bottom-0 right-0 bg-[#563d4dcc] text-white px-[8px] py-[2px] text-[11px] font-bold z-10 transition-colors hover:bg-[#c3846d]">
                  پەیوەندییەکان
                </span>
              </a>
            </div>
            <div className="post-details flex-grow pt-[15px] md:pt-0">
              <div className="post-meta flex flex-row items-center justify-between text-[#666666] text-[12px] mb-[10px]">
                <span className="date">كانونی یه‌كه‌م 25, 2025</span>
                <div className="flex items-center gap-1">
                  <Flame size={12} className="text-[#666666]" />
                  <span className="meta-views">23</span>
                </div>
              </div>
              <h2 className="post-title mb-[10px]">
                <a href="#" className="text-[24px] font-[800] leading-[1.3] text-[#333333] hover:text-[#c3846d] transition-colors">
                  شاندێکی ڕێکخراوی ژیار سەردانی دەزگای ڕوناکییان کرد
                </a>
              </h2>
              <p className="post-excerpt text-[#666666] text-[14px] leading-[1.7] line-clamp-3">
                بە مەبەستی ئاڵوگۆڕی شارەزایی و پتەوکردنی پەیوەندییەکان، شاندێکی بەشی بانگخوازانی ڕێکخراوی ژیار (لقی ڕاپەڕین) .٢٥-١٢-٢٠٢٥- کە پێکهاتبوون لە ٢٥ خوشک…
              </p>
            </div>
          </div>
        </li>
      </div>

      {/* Pagination component logic placeholder */}
      <div className="pagination-wrapper flex justify-center mt-[10px] mb-[40px]">
        <nav className="flex items-center border border-[#eeeeee] divide-x divide-x-reverse divide-[#eeeeee]">
          <a href="#" className="px-[12px] py-[8px] bg-white text-[#333] text-[14px] font-bold hover:bg-[#563d4d] hover:text-white transition-colors border-r border-[#eeeeee]">
            Next page
          </a>
          <a href="#" className="px-[12px] py-[8px] bg-white text-[#333] flex items-center justify-center hover:bg-[#563d4d] hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </a>
        </nav>
      </div>
    </section>
  );
}
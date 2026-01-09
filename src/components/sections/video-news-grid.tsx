import React from 'react';
import Image from 'next/image';

interface PostItemProps {
  title: string;
  category: string;
  date: string;
  views: number;
  excerpt: string;
  imageUrl: string;
}

const newsItems: PostItemProps[] = [
  {
    title: "ساڵی نوێی خوێندن لە دەزگای ڕووناکی",
    category: "پەروەردە و فێرکردن",
    date: "كانونی دووه‌م 7, 2026",
    views: 0,
    excerpt: "دوای تەواوبوونی ساڵی یەکەمی خوێندن بە سەرکەوتوویی بەشی بانگخوازانی (بەشی برایان) لە دەزگای ڕووناکی ساڵی نوێی خوێندنی دەستپێکرد.دووەم وانە لە…",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/988add51-608a-4a7f-84e3-7b9ad52c69e0-dazgayrunaki-com/assets/images/IMG_6612-2-390x220-6.png",
  },
  {
    title: "📝 کۆبوونەوەی ئاسایی لیژنەی داڕشتنەوەی پڕۆژەکان",
    category: "Uncategorized",
    date: "كانونی دووه‌م 5, 2026",
    views: 8,
    excerpt: "لەپێناو بەرهەمدارترکردنی هەنگاوەکانمان، ئەمڕۆ لە دەزگای ڕووناکی کۆبوونەوەی لیژنەی داڕشتنەوەی پڕۆژەکان بەڕێوەچوو.لە کۆبوونەوەکەدا گفتوگۆ لەسەر داڕشتنی پلان و بیرۆکەی نوێ…",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/988add51-608a-4a7f-84e3-7b9ad52c69e0-dazgayrunaki-com/assets/images/_D8_B3_DB_95_D9_85_DB_95_D9_86_D8_AF_DB_95_D9_81_D-13.jpg",
  },
  {
    title: "شاندێکی ڕێکخراوی ژیار سەردانی دەزگای ڕوناکییان کرد",
    category: "پەیوەندییەکان",
    date: "كانونی یه‌كه‌م 25, 2025",
    views: 23,
    excerpt: "بە مەبەستی ئاڵوگۆڕی شارەزایی و پتەوکردنی پەیوەندییەکان، شاندێکی بەشی بانگخوازانی ڕێکخراوی ژیار (لقی ڕاپەڕین) .٢٥-١٢-٢٠٢٥- کە پێکهاتبوون لە ٢٥ خوشک…",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/988add51-608a-4a7f-84e3-7b9ad52c69e0-dazgayrunaki-com/assets/images/0P4A6739-390x220-5.png",
  },
];

const PostItem: React.FC<PostItemProps> = ({ title, category, date, views, excerpt, imageUrl }) => {
  return (
    <li className="flex flex-col md:flex-row gap-6 mb-[25px] pb-[25px] border-b border-[#eeeeee] last:border-b-0">
      <div className="relative w-full md:w-[390px] h-[220px] flex-shrink-0 group overflow-hidden">
        <a href="#" className="block w-full h-full">
          <Image
            src={imageUrl}
            alt={title}
            width={390}
            height={220}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute bottom-[10px] right-[10px] bg-[#563d4d]/80 text-white text-[11px] px-2 py-1 z-10 font-bold">
            {category}
          </span>
        </a>
      </div>
      <div className="flex flex-col flex-grow">
        <div className="flex items-center gap-4 mb-2 text-[#666666] text-[12px]">
          <span className="flex items-center gap-1">
            {date}
          </span>
          <div className="mr-auto flex items-center gap-1">
            <svg
              className="w-3 h-3 text-[#e04a4a]"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.5 11c0 3.037-2.463 5.5-5.5 5.5S6.5 14.037 6.5 11s2.463-5.5 5.5-5.5 5.5 2.463 5.5 5.5zm1.5 0c0-3.866-3.134-7-7-7s-7 3.134-7 7 3.134 7 7 7 7-3.134 7-7z" />
              <path d="M12 7.5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            <span>{views}</span>
          </div>
        </div>
        <h2 className="text-[22px] md:text-[24px] font-[800] leading-[1.3] mb-3 text-[#333333] hover:text-[#c3846d] transition-colors cursor-pointer">
          <a href="#">{title}</a>
        </h2>
        <p className="text-[#666666] text-[15px] leading-[1.6] line-clamp-2">
          {excerpt}
        </p>
      </div>
    </li>
  );
};

export default function VideoNewsGrid() {
  return (
    <section className="bg-white p-5 shadow-[0_0_15px_rgba(0,0,0,0.1)]">
      <div className="mag-box-container">
        <ul className="list-none p-0 m-0">
          {newsItems.map((item, index) => (
            <PostItem key={index} {...item} />
          ))}
          {/* Repeat some items to fill the grid based on structure */}
          <PostItem 
            title="ئاهەنگی دەرچووانی بەشی فێرخوازان"
            category="پەروەردە و فێرکردن"
            date="كانونی یه‌كه‌م 10, 2025"
            views={46}
            excerpt="خوداناسی گەورەترین واجبە لەسەر هەموو تاکێک باشترین دەروازەش بۆ ناسینی خودا قورئانە. قورئان هەموو ناو و سیفەت و گەورەی خودای…"
            imageUrl="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/988add51-608a-4a7f-84e3-7b9ad52c69e0-dazgayrunaki-com/assets/images/IMG_6612-2-390x220-6.png"
          />
          <PostItem 
            title="پڕۆگرامی “بەهای گەنج”"
            category="کەناڵی بەها"
            date="تشرینی دووه‌م 1, 2025"
            views={108}
            excerpt="گەنج و یاساکانی کار. وەرزی سێیەم، ئەڵقەی ۱۹. پرۆگرامی بەهای گەنج."
            imageUrl="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/988add51-608a-4a7f-84e3-7b9ad52c69e0-dazgayrunaki-com/assets/images/_D8_B3_DB_95_D9_85_DB_95_D9_86_D8_AF_DB_95_D9_81_D-13.jpg"
          />
        </ul>

        {/* Pagination placeholder as seen in screenshots */}
        <div className="mt-8 flex justify-center items-center gap-2">
          <div className="flex border border-[#eeeeee]">
            <a href="#" className="px-4 py-2 text-[#333333] font-bold text-[14px] hover:bg-[#c3846d] hover:text-white transition-colors border-l border-[#eeeeee]">
              Next page
            </a>
            <a href="#" className="px-3 py-2 text-[#333333] bg-[#f9f9f9] hover:bg-[#c3846d] hover:text-white transition-colors">
              <span className="inline-block transform rotate-180">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
import React from 'react';
import Header from "@/components/sections/Header";
import MainNavigation from "@/components/sections/MainNavigation";
import Footer from "@/components/sections/Footer";
import { getSiteSettings, getRows } from "@/lib/settings";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { Target, Eye, Lightbulb } from 'lucide-react';

async function getPageData() {
  try {
    const result = await db.execute(sql.raw(`SELECT * FROM pages WHERE slug = 'about' LIMIT 1`)) as any;
    const rows = getRows(result);
    return rows[0] ?? null;
  } catch (error) {
    console.error("Failed to fetch about page data:", error);
    return null;
  }
}

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const pageData = await getPageData();

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header settings={settings} />
      <MainNavigation />
      
      <main className="container mx-auto py-20 px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <h1 className="text-5xl font-black text-[#563a4a] leading-tight">
              {pageData?.title || 'دەربارەی ئێمە'}
            </h1>
            <div 
                className="text-xl text-gray-600 leading-relaxed [&_p]:mb-4 [&_strong]:font-bold [&_strong]:text-[#563a4a] [&_ol]:list-decimal [&_ol]:pr-6 [&_ol]:my-4 [&_li]:mb-2"
                dangerouslySetInnerHTML={{ __html: pageData?.content || 'ڕێکخراوی کوردی چوار دامەزراوەیەکی سەربەخۆیە کار دەکات بۆ گەشەپێدانی زانست و پەروەردە لە کۆمەڵگای کوردیدا.' }}
              />
          </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -top-6 -right-6 w-full h-full border-4 border-[#c29181] rounded-3xl -z-10"></div>
                <img 
                    src={pageData?.image_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200'}
                    alt={pageData?.title || 'About Us'}
                  className="rounded-3xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-500 w-full h-auto object-cover"
                />
              </div>
            </div>
        </div>

        <section className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="group bg-white p-12 rounded-[3rem] border border-neutral-100 shadow-xl shadow-neutral-100/50 hover:shadow-2xl hover:shadow-[#c29181]/10 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#fdf8f6] rounded-bl-[5rem] -z-10 group-hover:bg-[#c29181]/5 transition-colors"></div>
            <div className="w-16 h-16 bg-[#fdf8f6] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <Lightbulb className="text-[#c29181]" size={32} />
            </div>
            <h3 className="text-2xl font-black text-[#563a4a] mb-6">{pageData?.card1_title || 'پەیاممان'}</h3>
            <p className="text-gray-600 leading-relaxed text-lg">{pageData?.card1_content || 'بڵاوکردنەوەی هۆشیاری و زانست لە نێوان نەوەی نوێدا بە شێوازێکی هاوچەرخ.'}</p>
          </div>

          <div className="group bg-[#563a4a] p-12 rounded-[3rem] text-white shadow-2xl shadow-[#563a4a]/20 hover:shadow-[#563a4a]/40 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[5rem] -z-10 group-hover:bg-white/10 transition-colors"></div>
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <Target className="text-[#c29181]" size={32} />
            </div>
            <h3 className="text-2xl font-black mb-6">{pageData?.card2_title || 'ئامانجمان'}</h3>
            <p className="opacity-90 leading-relaxed text-lg">{pageData?.card2_content || 'دروستکردنی کۆمەڵگایەکی زانستخواز و هۆشیار کە بتوانێت ڕووبەڕووی تەحەددییەکان ببێتەوە.'}</p>
          </div>

          <div className="group bg-white p-12 rounded-[3rem] border border-neutral-100 shadow-xl shadow-neutral-100/50 hover:shadow-2xl hover:shadow-[#c29181]/10 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#fdf8f6] rounded-bl-[5rem] -z-10 group-hover:bg-[#c29181]/5 transition-colors"></div>
            <div className="w-16 h-16 bg-[#fdf8f6] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <Eye className="text-[#c29181]" size={32} />
            </div>
            <h3 className="text-2xl font-black text-[#563a4a] mb-6">{pageData?.card3_title || 'بینینمان'}</h3>
            <p className="text-gray-600 leading-relaxed text-lg">{pageData?.card3_content || 'گەیشتن بە لوتکەی پێشکەوتن لە ڕێگەی پەروەردەیەکی دروست و زانستێکی بەسود.'}</p>
          </div>
        </section>
      </main>
      
      <Footer settings={settings} />
    </div>
  );
}

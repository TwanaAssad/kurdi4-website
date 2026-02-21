import React from 'react';
import Header from "@/components/sections/Header";
import MainNavigation from "@/components/sections/MainNavigation";
import Footer from "@/components/sections/Footer";
import ContactForm from "@/components/sections/ContactForm";
import { getSiteSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { Mail, Phone, MapPin } from 'lucide-react';

async function getPageData() {
  const result = await db.execute(sql.raw(`SELECT * FROM pages WHERE slug = 'contact' LIMIT 1`)) as any;
  const rows = Array.isArray(result) ? (Array.isArray(result[0]) ? result[0] : result) : (result?.rows ?? []);
  return rows[0] ?? null;
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const pageData = await getPageData();

  return (
    <div className="min-h-screen bg-[#fcfcfc]" dir="rtl">
      <Header settings={settings} />
      <MainNavigation />
      
      <main className="container mx-auto py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h1 className="text-6xl font-black text-[#563a4a] mb-6">
              {pageData?.title || 'پەیوەندی'}
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              ئێمە لێرەین بۆ وەڵامدانەوەی هەر پرسیارێک کە هەتبێت. پەیوەندیمان پێوە بکە.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-start gap-6 group hover:shadow-xl transition-all">
                <div className="w-14 h-14 bg-[#fdf8f6] rounded-2xl flex items-center justify-center text-[#c29181] group-hover:bg-[#c29181] group-hover:text-white transition-colors">
                  <Mail size={24} />
                </div>
                  <div>
                    <h3 className="font-bold text-gray-400 text-xs tracking-widest mb-1 uppercase">ئیمەیڵ</h3>
                    <p className="text-[#563a4a] font-bold text-lg">{settings.contact_email || 'info@kurdish4.org'}</p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-start gap-6 group hover:shadow-xl transition-all">
                  <div className="w-14 h-14 bg-[#fdf8f6] rounded-2xl flex items-center justify-center text-[#c29181] group-hover:bg-[#c29181] group-hover:text-white transition-colors">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-400 text-xs tracking-widest mb-1 uppercase">مۆبایل</h3>
                    <p className="text-[#563a4a] font-bold text-lg">{settings.contact_phone || '٠٧٥٠ ٠٠٠ ٠٠٠٠'}</p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-start gap-6 group hover:shadow-xl transition-all">
                  <div className="w-14 h-14 bg-[#fdf8f6] rounded-2xl flex items-center justify-center text-[#c29181] group-hover:bg-[#c29181] group-hover:text-white transition-colors">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-400 text-xs tracking-widest mb-1 uppercase">ناونیشان</h3>
                    <p className="text-[#563a4a] font-bold text-lg">{settings.contact_location || 'کوردستان، سلێمانی'}</p>
                  </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-[#563a4a] text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden h-full">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[200%] bg-gradient-to-br from-white to-transparent rotate-12"></div>
                </div>
                <div className="relative z-10 space-y-8">
                  <div>
                    <h2 className="text-3xl font-black mb-4">نامەمان بۆ بنێرە</h2>
                    <div className="text-lg opacity-80 leading-relaxed whitespace-pre-wrap">
                      {pageData?.content || 'بۆ هەر زانیارییەکی زیاتر یان هاوکارییەک، تکایە فۆرمی خوارەوە پڕ بکەرەوە.'}
                    </div>
                  </div>
                  
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer settings={settings} />
    </div>
  );
}


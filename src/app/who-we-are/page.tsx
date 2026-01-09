import React from 'react';
import Header from "@/components/sections/Header";
import MainNavigation from "@/components/sections/MainNavigation";
import Footer from "@/components/sections/Footer";
import { Users, Target, Shield, Heart } from 'lucide-react';
import { getSiteSettings } from "@/lib/settings";

export default async function WhoWeArePage() {
  const settings = await getSiteSettings();
  
  const values = [
    { icon: <Target className="text-[#c29181]" />, title: 'دروستی', desc: 'ئێمە پابەندین بە ئەنجامدانی کارەکانمان بەوپەڕی دڵسۆزی و پاکیەوە.' },
    { icon: <Users className="text-[#c29181]" />, title: 'پێکەوەیی', desc: 'باوەڕمان بە کاری گروپی و هاوکاری هەیە بۆ گەیشتن بە ئامانجە گەورەکان.' },
    { icon: <Shield className="text-[#c29181]" />, title: 'بەرپرسیارێتی', desc: 'بەرپرسیارین بەرامبەر بە نەوەی نوێ و داهاتووی زانستی وڵاتەکەمان.' },
    { icon: <Heart className="text-[#c29181]" />, title: 'بەخشین', desc: 'خزمەتکردن بەبێ جیاوازی ئامانجی سەرەکی ڕێکخراوەکەمانە.' }
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header settings={settings} />
      <MainNavigation />
      
      <main className="container mx-auto py-20 px-4">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-5xl font-black text-[#563a4a] mb-6">ئێمە کێین؟</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            کۆمەڵێک گەنج و شارەزای بواری پەروەردە و زانستین کە کۆبووینەتەوە بۆ ئەوەی گۆڕانکارییەکی ئەرێنی لە سیستەمی فێربوون و هۆشیاری کۆمەڵگادا دروست بکەین.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <div key={i} className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-[#fdf8f6] rounded-2xl flex items-center justify-center mx-auto mb-6">
                {v.icon}
              </div>
              <h3 className="text-2xl font-bold text-[#563a4a] mb-4">{v.title}</h3>
              <p className="text-gray-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        <section className="mt-32 bg-[#563a4a] rounded-[3rem] p-12 lg:p-20 text-white overflow-hidden relative">
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold mb-8">مێژووی ڕێکخراوەکەمان</h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="text-2xl font-black text-[#c29181]">٢٠١٥</div>
                  <div className="opacity-80">سەرەتای دامەزراندن وەک گروپێکی فێرکاری بچووک لە سلێمانی.</div>
                </div>
                <div className="flex gap-6 border-r-2 border-[#c29181]/30 pr-6 mr-3">
                  <div className="text-2xl font-black text-[#c29181]">٢٠١٨</div>
                  <div className="opacity-80">فەرمی ناساندنی ڕێکخراوەکە و فراوانبوونی چالاکییەکان بۆ هەولێر و دهۆک.</div>
                </div>
                <div className="flex gap-6 border-r-2 border-[#c29181]/30 pr-6 mr-3">
                  <div className="text-2xl font-black text-[#c29181]">٢٠٢٤</div>
                  <div className="opacity-80">بوونی زیاتر لە ١٠ لقی کارا و ئەنجامدانی سەدان سیمینار و خولی فێرکاری.</div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <div className="w-64 h-64 bg-[#c29181] rounded-full blur-[100px] absolute opacity-20"></div>
              <Users size={200} className="opacity-10" />
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

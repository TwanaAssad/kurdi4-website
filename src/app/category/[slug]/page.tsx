import React from 'react';
import Header from "@/components/sections/Header";
import MainNavigation from "@/components/sections/MainNavigation";
import Footer from "@/components/sections/Footer";
import SidebarWidgets from "@/components/sections/SidebarWidgets";
import CategoryPostsList from "@/components/sections/CategoryPostsList";
import { getSiteSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

async function getCategory(slug: string) {
  const data = await db.query.categories.findFirst({
    where: eq(categories.slug, slug)
  });

  if (!data) return null;
  return data;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);
  const settings = await getSiteSettings();

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#fafafa]" dir="rtl">
      <Header settings={settings} />
      <MainNavigation />
      
      <main className="container mx-auto py-12 px-4">
        <div className="mb-12 text-center relative py-16 bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#563a4a] via-[#c29181] to-[#563a4a]"></div>
           <span className="bg-[#c29181]/10 text-[#c29181] px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">هاوپۆل</span>
           <h1 className="text-4xl md:text-6xl font-black text-[#563a4a] mt-2 mb-4">
             {category.name}
           </h1>
           <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm">هەموو ئەو بابەتانەی لەم هاوپۆلەدا بڵاوکراونەتەوە</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1">
            <CategoryPostsList categoryName={category.name} />
          </div>

          {/* Sidebar */}
          <SidebarWidgets />
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}

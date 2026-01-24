import React from 'react';
import Header from "@/components/sections/Header";
import MainNavigation from "@/components/sections/MainNavigation";
import Footer from "@/components/sections/Footer";
import SidebarWidgets from "@/components/sections/SidebarWidgets";
import SearchResults from "@/components/sections/SearchResults";
import { getSiteSettings } from "@/lib/settings";

export default async function SearchPage() {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-[#fafafa]" dir="rtl">
      <Header settings={settings} />
      <MainNavigation />
      
      <main className="container mx-auto py-12 px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1">
            <SearchResults />
          </div>

          {/* Sidebar */}
          <SidebarWidgets settings={settings} />
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}

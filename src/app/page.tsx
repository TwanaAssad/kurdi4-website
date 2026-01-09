import Header from "@/components/sections/Header";
import MainNavigation from "@/components/sections/MainNavigation";
import LatestNewsFeed from "@/components/sections/LatestNewsFeed";
import SidebarWidgets from "@/components/sections/SidebarWidgets";
import Footer from "@/components/sections/Footer";
import { getSiteSettings } from "@/lib/settings";

export default async function Home() {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen">
      <Header settings={settings} />
      <MainNavigation />
      <div className="container mx-auto py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="flex-1">
            <LatestNewsFeed />
          </main>
          <SidebarWidgets />
        </div>
      </div>
      <Footer settings={settings} />
    </div>
  );
}

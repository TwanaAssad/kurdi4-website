import React from 'react';
import Image from 'next/image';
import { Search, Facebook, Youtube, Instagram, Linkedin } from 'lucide-react';

const TiktokIcon = ({ size = 20 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

/**
 * Header Component
 * Clones the main header section including logo, top utility bar, and primary navigation.
 * Uses the light theme as specified.
 */
const Header = ({ settings }: { settings?: any }) => {
    const socialLinks = [
      { icon: <Facebook size={20} />, url: settings?.social_facebook, color: 'hover:bg-blue-600' },
      { icon: <TiktokIcon size={20} />, url: settings?.social_tiktok, color: 'hover:bg-black' },
      { icon: <Instagram size={20} />, url: settings?.social_instagram, color: 'hover:bg-pink-600' },
      { icon: <Youtube size={20} />, url: settings?.social_youtube, color: 'hover:bg-red-600' },
    ].filter(link => link.url);

  return (
    <header id="theme-header" className="w-full bg-white">
      <div className="container mx-auto py-8 px-4 bg-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Logo Area */}
            <div id="logo" className="flex items-center gap-6">
              <a href="/" className="block group">
                <div className="relative">
                  <Image 
                    src={settings?.logo_url || "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/988add51-608a-4a7f-84e3-7b9ad52c69e0/KURDI4LOGO-resized-1767794622901.webp?width=403&height=403&resize=contain"}
                    alt={settings?.org_name || "Kurdish Four Organization"}
                    width={140}
                    height={140}
                    className="w-24 md:w-32 h-auto object-contain transition-transform group-hover:scale-105"
                    priority
                  />
                </div>
              </a>
              <div className="h-16 md:h-20 w-1 bg-[#563a4a]"></div>
              <div className="text-left">
                <h1 className="text-2xl md:text-4xl font-black text-[#563a4a] leading-tight tracking-tight">{settings?.org_name || "رێكخراوی كوردی چوار"}</h1>
                <p className="text-lg text-gray-500 font-medium mt-1">بۆ زانست و پەروەردە</p>
              </div>
            </div>

          {/* Search Area (Desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-12">
            <form action="/search" method="GET" className="relative w-full group">
              <input 
                type="text" 
                name="q"
                placeholder="بگەڕێ بۆ بابەتەکان..." 
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-8 pr-14 focus:outline-none focus:border-[#563a4a] focus:bg-white transition-all shadow-sm"
                dir="rtl"
              />
                <button 
                  type="submit" 
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#563a4a] transition-colors !bg-transparent !border-none p-0 outline-none focus:outline-none !shadow-none hover:!bg-transparent appearance-none"
                >
                  <Search size={22} />
                </button>
            </form>
          </div>

          {/* Social Icons (Desktop) */}
          <div className="hidden lg:flex items-center gap-4">
            {socialLinks.length > 0 ? (
              socialLinks.map((link, idx) => (
                <a 
                  key={idx}
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`w-12 h-12 rounded-2xl bg-[#fdf8f6] flex items-center justify-center text-[#563a4a] hover:text-white transition-all shadow-sm hover:shadow-md ${link.color}`}
                >
                  {link.icon}
                </a>
              ))
            ) : (
                // Default icons if none set
                  <>
                    <a href="#" className="w-12 h-12 rounded-2xl bg-[#fdf8f6] flex items-center justify-center text-[#563a4a] hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-md"><Facebook size={20} /></a>
                    <a href="#" className="w-12 h-12 rounded-2xl bg-[#fdf8f6] flex items-center justify-center text-[#563a4a] hover:bg-black hover:text-white transition-all shadow-sm hover:shadow-md"><TiktokIcon size={20} /></a>
                    <a href="#" className="w-12 h-12 rounded-2xl bg-[#fdf8f6] flex items-center justify-center text-[#563a4a] hover:bg-pink-600 hover:text-white transition-all shadow-sm hover:shadow-md"><Instagram size={20} /></a>
                    <a href="#" className="w-12 h-12 rounded-2xl bg-[#fdf8f6] flex items-center justify-center text-[#563a4a] hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-md"><Youtube size={20} /></a>
                  </>
              )}
          </div>
        </div>
      </div>

      {/* Structural shadow fix for content below */}
      <div className="w-full h-[1px] bg-gray-100"></div>
    </header>
  );
};

export default Header;
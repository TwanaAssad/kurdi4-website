"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ChevronDown,
  Menu,
  X
} from "lucide-react";

const MainNavigation = () => {
  const [activeMenu, setActiveMenu] = useState("سەرەتا");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: "سەرەتا", href: "/", hasChildren: false },
    { 
      name: "فکر و هۆشیاری", 
      href: "/category/thought", 
      hasChildren: true,
      subItems: ["دەستەی بانگخوازان", "کۆڕ و سیمینار", "خولەکان", "وۆرك شۆپ", "خوێندنەوە", "فەتوا"]
    },
    { 
      name: "پەروەردە و فێرکردن", 
      href: "/category/education", 
      hasChildren: true,
      subItems: ["چاکسازی کۆمەڵایەتی", "لەبەرکردنی قوڕئان", "خێزانسازی", "نەوجەوانان", "خاوەن پێداویستی تایبەت"]
    },
    { 
      name: "میدیا", 
      href: "/category/media", 
      hasChildren: true,
      subItems: ["کەناڵی بەها", "ڕادیۆی ڕووناکی", "سۆشیال میدیا", "پەرتوکخانە", "پەیوەندییەکان"]
    },
    { 
      name: "پڕۆژەکان", 
      href: "/category/projects", 
      hasChildren: false 
    },
    { 
      name: "چالاکییەکان", 
      href: "/activities", 
      hasChildren: false 
    },
    { 
      name: "دەربارەی ئێمە", 
      href: "/about", 
      hasChildren: false 
    },
    { 
      name: "پەیوەندی", 
      href: "/contact", 
      hasChildren: false 
    },
  ];

  return (
    <div className="w-full bg-[#563a4a] sticky top-0 z-[100] shadow-lg" dir="rtl">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-[60px] relative">
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center h-full">
            <ul className="flex items-center h-full list-none m-0 p-0 gap-1">
              {menuItems.map((item) => (
                <li key={item.name} className="relative group h-full flex items-center">
                  <Link
                    href={item.href}
                    className={`
                      px-4 h-[40px] flex items-center text-[15px] font-bold text-white transition-all duration-200 rounded-lg
                      ${activeMenu === item.name ? 'bg-[#c29181]' : 'hover:bg-white/10'}
                      ${item.hasChildren ? 'gap-1' : ''}
                    `}
                    onClick={() => setActiveMenu(item.name)}
                  >
                    {item.name}
                    {item.hasChildren && (
                      <ChevronDown size={14} className="opacity-70 group-hover:rotate-180 transition-transform duration-300" />
                    )}
                  </Link>

                    {/* Dropdown */}
                    {item.hasChildren && (
                      <ul className="absolute top-[90%] right-0 w-[220px] bg-white shadow-2xl rounded-xl list-none m-0 p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:top-full transition-all duration-200 border border-gray-100 z-[101]">
                        {item.subItems?.map((subItem) => (
                          <li key={subItem}>
                            <Link
                              href={`${item.href}?sub=${encodeURIComponent(subItem)}`}
                              className="block px-4 py-2.5 text-[14px] font-bold text-gray-700 hover:bg-[#fdf8f6] hover:text-[#563a4a] transition-all duration-200 text-right rounded-lg"
                            >
                              {subItem}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>


          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#563a4a] border-t border-white/10 shadow-2xl z-[99]">
          <ul className="flex flex-col p-4 list-none m-0">
            {menuItems.map((item) => (
              <li key={item.name} className="border-b border-white/5 last:border-0">
                <Link
                  href={item.href}
                  className="block py-4 text-[16px] font-bold text-white hover:text-[#c29181]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
                  {item.hasChildren && (
                    <div className="pr-4 pb-2 flex flex-wrap gap-2">
                      {item.subItems?.map((sub) => (
                        <Link 
                          key={sub} 
                          href={`${item.href}?sub=${encodeURIComponent(sub)}`} 
                          className="text-[13px] text-white/60 hover:text-white bg-white/5 px-3 py-1 rounded-full"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  )}

              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MainNavigation;

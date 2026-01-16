"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const MainNavigation = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dbMenuItems, setDbMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    const { data: menuData } = await supabase
      .from('menu_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (menuData && menuData.length > 0) {
      // Build hierarchical menu
      const buildHierarchy = async (items: any[], parentId: string | null = null) => {
        const levelItems = items.filter(item => item.parent_id === parentId);
        return await Promise.all(levelItems.map(async (item) => {
          let href = item.url || "#";
          if (item.type === 'page') {
            const { data: pageData } = await supabase.from('pages').select('slug').eq('id', item.target_id).single();
            if (pageData) href = `/${pageData.slug}`;
          } else if (item.type === 'category') {
            const { data: catData } = await supabase.from('categories').select('slug').eq('id', item.target_id).single();
            if (catData) href = `/category/${catData.slug}`;
          }
          const children = await buildHierarchy(items, item.id);
          return { ...item, name: item.label, href, children, hasChildren: children.length > 0 };
        }));
      };

      const hierarchicalMenu = await buildHierarchy(menuData);
      setDbMenuItems(hierarchicalMenu);
    } else {
      setDbMenuItems([
        { name: "سەرەتا", href: "/", hasChildren: false, children: [] },
        { name: "دەربارەی ئێمە", href: "/about", hasChildren: false, children: [] },
        { name: "پەیوەندی", href: "/contact", hasChildren: false, children: [] },
      ]);
    }
    setLoading(false);
  };

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="w-full bg-[#563a4a] sticky top-0 z-[100] shadow-lg" dir="rtl">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-[60px] relative">
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center h-full">
            <ul className="flex items-center h-full list-none m-0 p-0 gap-1">
              {dbMenuItems.map((item) => (
                <li key={item.id || item.name} className="relative group h-full flex items-center">
                  <Link
                    href={item.href}
                    className={`
                      px-4 h-[40px] flex items-center text-[15px] font-bold text-white transition-all duration-200 rounded-lg
                      ${isActive(item.href) ? 'bg-[#c29181]' : 'hover:bg-white/10'}
                      ${item.hasChildren ? 'gap-1' : ''}
                    `}
                  >
                    {item.name}
                    {item.hasChildren && (
                      <ChevronDown size={14} className="opacity-70 group-hover:rotate-180 transition-transform duration-300" />
                    )}
                  </Link>

                    {/* Dropdown */}
                    {item.hasChildren && (
                      <ul className="absolute top-[90%] right-0 w-[220px] bg-white shadow-2xl rounded-xl list-none m-0 p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:top-full transition-all duration-200 border border-gray-100 z-[101]">
                        {item.children.map((subItem: any) => (
                          <li key={subItem.id}>
                            <Link
                              href={subItem.href}
                              className={`block px-4 py-2.5 text-[14px] font-bold transition-all duration-200 text-right rounded-lg ${
                                isActive(subItem.href) ? 'bg-[#fdf8f6] text-[#563a4a]' : 'text-gray-700 hover:bg-[#fdf8f6] hover:text-[#563a4a]'
                              }`}
                            >
                              {subItem.name}
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
            {dbMenuItems.map((item) => (
              <li key={item.id || item.name} className="border-b border-white/5 last:border-0">
                <Link
                  href={item.href}
                  className={`block py-4 text-[16px] font-bold ${isActive(item.href) ? 'text-[#c29181]' : 'text-white'} hover:text-[#c29181]`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
                  {item.hasChildren && (
                    <div className="pr-4 pb-4 flex flex-col gap-2">
                      {item.children.map((sub: any) => (
                        <Link 
                          key={sub.id} 
                          href={sub.href} 
                          className={`text-[14px] font-bold py-2 ${isActive(sub.href) ? 'text-[#c29181]' : 'text-white/60'} hover:text-white`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {sub.name}
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

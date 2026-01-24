import { Facebook, Instagram, Youtube } from 'lucide-react';

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

const Footer = ({ settings }: { settings?: any }) => {
  return (
    <footer className="w-full bg-[#563a4a] text-white py-12 mt-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black">{settings?.org_name || 'رێكخراوی كوردی چوار'}</h2>
            <p className="text-white/60 leading-relaxed max-w-sm">
              ڕێکخراوێکی ناحکومی تایبەت بە گەشەپێدانی زانست و پەروەردە لە کوردستان. ئێمە کار دەکەین بۆ بونیادنانی نەوەیەکی هۆشیار و زانستخواز.
            </p>
          </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold">بەستەرە خێراکان</h3>
                <ul className="space-y-3 text-white/60">
                  <li><a href="/about" className="hover:text-white transition-colors">دەربارە</a></li>
                  <li><a href="/who-we-are" className="hover:text-white transition-colors">ئێمە کێین</a></li>
                  <li><a href="/contact" className="hover:text-white transition-colors">پەیوەندی</a></li>
                </ul>

            </div>

            {/* Social Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold">لەگەڵمان بن</h3>
              <div className="flex gap-4">
                 <a href={settings?.social_facebook || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-all">
                   <Facebook size={20} />
                 </a>
                 <a href={settings?.social_tiktok || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-black transition-all">
                   <TiktokIcon size={20} />
                 </a>
                 <a href={settings?.social_instagram || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-pink-600 transition-all">
                   <Instagram size={20} />
                 </a>
                 <a href={settings?.social_youtube || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-red-600 transition-all">
                   <Youtube size={20} />
                 </a>
              </div>
            </div>
        </div>

            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-sm">
              <p>رێکخرواى کوردى چوار بۆ زانست و پەروەردە  © 2026 . هەموو مافەکان پارێزراون.</p>
            </div>
      </div>
      
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#c29181]/10 rounded-full blur-3xl"></div>
    </footer>
  );
};

export default Footer;

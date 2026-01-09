"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PlusCircle,
  Trash2,
  FileText,
  Layers,
  Calendar,
  Image as ImageIcon,
  Settings,
  Globe,
  Palette,
  Share2,
  Edit3,
  Check,
  X,
  Eye,
  LogOut,
  User,
  Users,
  ShieldCheck,
  Facebook,
  Music2,
  Instagram,
  Linkedin,
  Youtube,
  BookOpen,
  Search,
  Upload,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Quote,
  Type,
  MoreHorizontal,
  Mail,
  Lock,
  ArrowLeft,
  RefreshCcw,
  Zap,
  Save,
  CheckCircle2,
  Clock,
  MapPin,
  Tag,
  AtSign,
  Briefcase,
  Info,
  ChevronLeft,
  LayoutDashboard
} from 'lucide-react';

type ViewMode = 'list' | 'form';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('posts');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Site Settings state
  const [settings, setSettings] = useState<any>({
    org_name: 'زانست و پەروەردەی کوردی',
    logo_url: '',
    primary_color: '#563a4a',
    secondary_color: '#c29181',
    accent_color: '#f0ecee',
    social_facebook: '',
    social_tiktok: '',
    social_instagram: '',
    social_linkedin: '',
    social_youtube: '',
    available_languages: ['ku'],
    default_language: 'ku',
    contact_phone: '',
    contact_email: '',
    contact_location: ''
  });

  // Lists
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  // Editing state
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // Form states
  const [formData, setFormData] = useState<any>({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    image_url: '',
    date: '',
    location: '',
    name: '',
    slug: '',
    description: '',
    full_name: '',
    role: 'user',
    avatar_url: '',
    card1_title: '',
    card1_content: '',
    card2_title: '',
    card2_content: '',
    card3_title: '',
    card3_content: ''
  });

  // Fetch Data on Load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchData();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchPosts(),
      fetchCategories(),
      fetchActivities(),
      fetchSettings(),
      fetchPages(),
      fetchProfiles()
    ]);
    setLoading(false);
  };

  const fetchSettings = async () => {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (!error && data) setSettings(data);
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!error) setPosts(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
    if (!error) setCategories(data || []);
  };

  const fetchActivities = async () => {
    const { data, error } = await supabase.from('activities').select('*').order('date', { ascending: false });
    if (!error) setActivities(data || []);
  };

  const fetchPages = async () => {
    const { data, error } = await supabase.from('pages').select('*').order('id', { ascending: true });
    if (!error) setPages(data || []);
  };

  const fetchProfiles = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error) setProfiles(data || []);
  };

  // Upload Logic
  const handleFileUpload = async (file: File, field: string) => {
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file);

    if (uploadError) {
      toast.error('هەڵە لە بارکردنی فایل: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    if (field === 'logo') {
      setSettings((prev: any) => ({ ...prev, logo_url: publicUrl }));
    } else {
      setFormData((prev: any) => ({ ...prev, [field]: publicUrl }));
    }

    setUploading(false);
    toast.success('فایلەکە بە سەرکەوتوویی بارکرا');
  };

  const imageDropzone = useDropzone({
    onDrop: (files) => {
      const field = activeTab === 'users' ? 'avatar_url' : activeTab === 'settings' ? 'logo' : 'image_url';
      handleFileUpload(files[0], field);
    },
    accept: { 'image/*': [] },
    multiple: false
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error('هەڵەیەک لە چوونەژوورەوەدا هەیە: ' + error.message);
    else toast.success('بە سەرکەوتوویی چوویتە ژوورەوە');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) toast.error('هەڵەیەک هەیە: ' + error.message);
    else {
      toast.success('ئەکاونت دروستکرا! دەتوانیت ئێستا بچیتە ژوورەوە');
      setShowRegister(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: '',
      image_url: '',
      date: '',
      location: '',
      name: '',
      slug: '',
      description: '',
      full_name: '',
      role: 'user',
      avatar_url: ''
    });
    setEditingId(null);
    setViewMode('list');
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    if (activeTab === 'posts') {
      setFormData({
        title: item.title,
        content: item.content,
        excerpt: item.excerpt,
        category: item.category,
        image_url: item.image_url
      });
    } else if (activeTab === 'activities') {
      setFormData({
        title: item.title,
        description: item.description,
        date: item.date,
        location: item.location,
        image_url: item.image_url
      });
    } else if (activeTab === 'categories') {
      setFormData({
        name: item.name,
        slug: item.slug
      });
    } else if (activeTab === 'pages') {
      setFormData({
        title: item.title,
        content: item.content,
        slug: item.slug,
        card1_title: item.card1_title || '',
        card1_content: item.card1_content || '',
        card2_title: item.card2_title || '',
        card2_content: item.card2_content || '',
        card3_title: item.card3_title || '',
        card3_content: item.card3_content || ''
      });
    } else if (activeTab === 'users') {
      setFormData({
        full_name: item.full_name,
        role: item.role,
        avatar_url: item.avatar_url,
        email: item.email
      });
    }
    setViewMode('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let error;

    if (editingId) {
      if (activeTab === 'posts') {
        const { error: err } = await supabase.from('posts').update({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          category: formData.category,
          image_url: formData.image_url
        }).eq('id', editingId);
        error = err;
      } else if (activeTab === 'activities') {
        const { error: err } = await supabase.from('activities').update({
          title: formData.title,
          description: formData.description,
          date: formData.date,
          location: formData.location,
          image_url: formData.image_url
        }).eq('id', editingId);
        error = err;
      } else if (activeTab === 'categories') {
        const { error: err } = await supabase.from('categories').update({
          name: formData.name,
          slug: formData.slug
        }).eq('id', editingId);
        error = err;
        } else if (activeTab === 'pages') {
          const { error: err } = await supabase.from('pages').update({
            title: formData.title,
            content: formData.content,
            card1_title: formData.card1_title,
            card1_content: formData.card1_content,
            card2_title: formData.card2_title,
            card2_content: formData.card2_content,
            card3_title: formData.card3_title,
            card3_content: formData.card3_content
          }).eq('id', editingId);
          error = err;
      } else if (activeTab === 'users') {
        const { error: err } = await supabase.from('profiles').update({
          full_name: formData.full_name,
          role: formData.role,
          avatar_url: formData.avatar_url
        }).eq('id', editingId);
        error = err;
      }
    } else {
      if (activeTab === 'posts') {
        const { error: err } = await supabase.from('posts').insert([{
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          category: formData.category,
          image_url: formData.image_url
        }]);
        error = err;
      } else if (activeTab === 'categories') {
        const { error: err } = await supabase.from('categories').insert([{ name: formData.name, slug: formData.slug }]);
        error = err;
      } else if (activeTab === 'activities') {
        const { error: err } = await supabase.from('activities').insert([{
          title: formData.title,
          description: formData.description,
          date: formData.date,
          location: formData.location,
          image_url: formData.image_url
        }]);
        error = err;
      }
    }

    setLoading(false);
    if (error) {
      toast.error('هەڵەیەک ڕوویدا: ' + error.message);
    } else {
      toast.success(editingId ? 'بە سەرکەوتوویی نوێکرایەوە!' : 'بە سەرکەوتوویی زیادکرا!');
      resetForm();
      fetchData();
    }
  };

  const deleteItem = async (table: string, id: string | number) => {
    if (!confirm('ئایا دڵنیای لە سڕینەوەی ئەم بڕگەیە؟')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) toast.error(`هەڵە لە سڕینەوەی ${table}`);
    else {
      toast.success('بە سەرکەوتوویی سڕایەوە!');
      fetchData();
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('site_settings').update(settings).eq('id', 1);
    setLoading(false);
    if (error) toast.error('هەڵە لە نوێکردنەوەی ڕێکخستنەکان');
    else {
      toast.success('ڕێکخستنەکان بە سەرکەوتوویی پارێزران!');
      fetchSettings();
    }
  };

  const insertText = (tag: string, endTag: string = '') => {
    const textarea = document.getElementById('main-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selected = text.substring(start, end);

    const newText = before + tag + selected + (endTag || tag) + after;
    setFormData((prev: any) => ({ ...prev, content: newText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, end + tag.length);
    }, 10);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6 font-sans selection:bg-[#c29181]/20" dir="rtl">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#563a4a] via-[#c29181] to-[#563a4a]"></div>
        
        <Card className="w-full max-w-lg border-none shadow-[0_40px_80px_rgba(0,0,0,0.1)] rounded-[3.5rem] overflow-hidden bg-white relative">
          <CardHeader className="bg-[#563a4a] text-white py-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
            
            {settings.logo_url ? (
              <div className="w-32 h-32 bg-white rounded-[2.5rem] mx-auto mb-8 flex items-center justify-center shadow-2xl p-4 relative z-10 border-4 border-white/20 transition-all hover:scale-110 duration-700">
                <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-28 h-28 bg-white/10 backdrop-blur-xl rounded-[2.5rem] mx-auto mb-8 flex items-center justify-center relative z-10 border-2 border-white/20 shadow-2xl">
                <Zap size={56} className="text-[#c29181] fill-[#c29181]/20" />
              </div>
            )}
            
            <CardTitle className="text-4xl font-black tracking-tight mb-4 relative z-10">{settings.org_name}</CardTitle>
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full text-[11px] font-black tracking-[0.25em] uppercase relative z-10 border border-white/20 shadow-lg">
              <ShieldCheck size={16} className="text-[#c29181]" />
              سیستەمی بەڕێوەبردن
            </div>
          </CardHeader>
          
          <CardContent className="p-16">
            <form onSubmit={showRegister ? handleRegister : handleLogin} className="space-y-10">
              <div className="space-y-4">
                <Label className="text-neutral-500 font-black mr-4 text-xs uppercase tracking-widest flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#563a4a]/5 flex items-center justify-center">
                    <Mail size={16} className="text-[#563a4a]" />
                  </div>
                  ئیمەیڵ
                </Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="admin@kurdish.edu"
                  className="rounded-[1.75rem] h-16 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-8 focus:ring-[#563a4a]/5 transition-all px-8 text-xl text-right font-bold placeholder:text-neutral-300"
                />
              </div>
              
              <div className="space-y-4">
                <Label className="text-neutral-500 font-black mr-4 text-xs uppercase tracking-widest flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#563a4a]/5 flex items-center justify-center">
                    <Lock size={16} className="text-[#563a4a]" />
                  </div>
                  وشەی تێپەڕ
                </Label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                  className="rounded-[1.75rem] h-16 border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-8 focus:ring-[#563a4a]/5 transition-all px-8 text-xl text-right font-bold placeholder:text-neutral-300"
                />
              </div>
              
              <Button type="submit" disabled={loading} className="w-full bg-[#563a4a] hover:bg-[#c29181] h-20 rounded-[2rem] font-black text-white transition-all shadow-[0_25px_50px_rgba(86,58,74,0.3)] hover:shadow-[0_30px_60px_rgba(86,58,74,0.4)] hover:-translate-y-2 active:translate-y-0 text-2xl group overflow-hidden relative">
                <span className="relative z-10 flex items-center gap-4">
                  {loading ? (
                    <RefreshCcw className="animate-spin" size={28} />
                  ) : (
                    <>
                      {showRegister ? 'دروستکردنی ئەژمار' : 'چوونە ژوورەوە'}
                      <ArrowLeft size={28} className="group-hover:-translate-x-2 transition-transform" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const menuItems = [
    { id: 'posts', label: 'بابەتەکان', icon: <FileText size={20} />, color: 'text-blue-500' },
    { id: 'categories', label: 'هاوپۆلەکان', icon: <Layers size={20} />, color: 'text-purple-500' },
    { id: 'activities', label: 'چالاکییەکان', icon: <Calendar size={20} />, color: 'text-orange-500' },
    { id: 'pages', label: 'لاپەڕەکان', icon: <BookOpen size={20} />, color: 'text-emerald-500' },
    { id: 'users', label: 'بەکارهێنەران', icon: <Users size={20} />, color: 'text-rose-500' },
    { id: 'settings', label: 'ڕێکخستنەکان', icon: <Settings size={20} />, color: 'text-amber-500' },
  ];

  const currentTabLabel = menuItems.find(item => item.id === activeTab)?.label;

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-row-reverse font-sans selection:bg-[#c29181]/30" dir="rtl">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1a1a1e] text-white flex flex-col fixed inset-y-0 right-0 z-50 shadow-2xl">
        <div className="p-8 flex items-center gap-4 border-b border-white/5 bg-black/20">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2 shadow-inner">
            <img src={settings.logo_url || 'https://via.placeholder.com/150'} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight leading-none mb-1">کۆنترۆڵ پانێڵ</h2>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest truncate max-w-[140px]">{settings.org_name}</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); resetForm(); }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all group ${
                activeTab === item.id 
                ? 'bg-[#563a4a] text-white shadow-xl shadow-black/20 translate-x-1' 
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`transition-colors ${activeTab === item.id ? 'text-white' : item.color} group-hover:scale-110 duration-300`}>
                {item.icon}
              </span>
              {item.label}
              {activeTab === item.id && <div className="mr-auto w-1.5 h-1.5 bg-[#c29181] rounded-full"></div>}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-white/5">
          <div className="flex items-center gap-4 mb-6 px-2">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden">
               {profiles.find(p => p.id === user.id)?.avatar_url ? (
                  <img src={profiles.find(p => p.id === user.id).avatar_url} className="w-full h-full object-cover" />
                ) : <User size={20} className="text-neutral-500" />}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black truncate">{user.email?.split('@')[0]}</p>
              <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">بەڕێوەبەر</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-black text-xs uppercase tracking-widest transition-all"
          >
            <LogOut size={18} />
            چوونە دەرەوە
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 mr-72 transition-all duration-300">
        <header className="bg-white border-b border-neutral-100 sticky top-0 z-40">
          <div className="container mx-auto px-8 h-24 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400">
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#1a1a1e]">{currentTabLabel}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">بەڕێوەبردن</span>
                  <ChevronLeft size={12} className="text-neutral-300" />
                  <span className="text-[10px] text-[#c29181] font-black uppercase tracking-widest">{viewMode === 'list' ? 'لیست' : editingId ? 'دەستکاری' : 'زیادکردن'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {viewMode === 'list' && activeTab !== 'settings' && activeTab !== 'pages' && (
                <Button 
                  onClick={() => { resetForm(); setViewMode('form'); }}
                  className="bg-[#563a4a] hover:bg-[#c29181] text-white font-black rounded-xl h-12 px-6 shadow-lg shadow-[#563a4a]/20 gap-2 transition-all hover:-translate-y-1 active:translate-y-0"
                >
                  <PlusCircle size={20} />
                  زیادکردنی نوێ
                </Button>
              )}
              {viewMode === 'form' && (
                <Button 
                  variant="outline"
                  onClick={() => setViewMode('list')}
                  className="border-neutral-200 text-neutral-500 font-black rounded-xl h-12 px-6 gap-2 hover:bg-neutral-50"
                >
                  <ArrowLeft size={20} />
                  گەڕانەوە بۆ لیست
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="container mx-auto px-8 py-10">
          {/* Dashboard/List View */}
          {viewMode === 'list' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Stats Bar */}
              {activeTab === 'posts' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                  <Card className="border-none shadow-sm rounded-3xl bg-white p-8 border border-neutral-50 flex items-center gap-6">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                      <FileText size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-1">کۆی بابەتەکان</p>
                      <h3 className="text-3xl font-black text-neutral-800">{posts.length}</h3>
                    </div>
                  </Card>
                  <Card className="border-none shadow-sm rounded-3xl bg-white p-8 border border-neutral-50 flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                      <Eye size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-1">بینینی گشتی</p>
                      <h3 className="text-3xl font-black text-neutral-800">{posts.reduce((acc, p) => acc + (p.views || 0), 0)}</h3>
                    </div>
                  </Card>
                  <Card className="border-none shadow-sm rounded-3xl bg-white p-8 border border-neutral-50 flex items-center gap-6">
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 shadow-inner">
                      <Layers size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-1">هاوپۆلەکان</p>
                      <h3 className="text-3xl font-black text-neutral-800">{categories.length}</h3>
                    </div>
                  </Card>
                  <Card className="border-none shadow-sm rounded-3xl bg-white p-8 border border-neutral-50 flex items-center gap-6">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
                      <Calendar size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-1">چالاکییەکان</p>
                      <h3 className="text-3xl font-black text-neutral-800">{activities.length}</h3>
                    </div>
                  </Card>
                </div>
              )}

              {/* Table Views */}
              <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white border border-neutral-50">
                <Table>
                  <TableHeader className="bg-neutral-50/50">
                    <TableRow className="hover:bg-transparent border-neutral-100">
                      {activeTab === 'posts' && (
                        <>
                          <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">بەرگ</TableHead>
                          <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">ناونیشان</TableHead>
                          <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">هاوپۆل</TableHead>
                          <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">بینین</TableHead>
                          <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">بەروار</TableHead>
                        </>
                      )}
                      {activeTab === 'categories' && (
                        <>
                          <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">ناو</TableHead>
                          <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">ناسنامە (Slug)</TableHead>
                        </>
                      )}
                      {activeTab === 'activities' && (
                        <>
                          <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">بەرگ</TableHead>
                          <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">ناوی چالاکی</TableHead>
                          <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">بەروار</TableHead>
                          <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">شوێن</TableHead>
                        </>
                      )}
                      {activeTab === 'pages' && (
                        <>
                          <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">ناو</TableHead>
                          <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">ناونیشان</TableHead>
                        </>
                      )}
                      {activeTab === 'users' && (
                        <>
                          <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">بەکارهێنەر</TableHead>
                          <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">ئیمەیڵ</TableHead>
                          <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">پلە</TableHead>
                        </>
                      )}
                      <TableHead className="text-left font-black uppercase text-[10px] tracking-widest p-6">کردارەکان</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeTab === 'posts' && posts.map((post) => (
                      <TableRow key={post.id} className="group border-neutral-50 hover:bg-neutral-50/30 transition-all">
                        <TableCell className="p-6">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                            {post.image_url ? <img src={post.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-3 text-neutral-300" />}
                          </div>
                        </TableCell>
                        <TableCell className="p-6 font-bold text-neutral-800 text-base">{post.title}</TableCell>
                        <TableCell className="p-6">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full border border-blue-100 uppercase">{post.category}</span>
                        </TableCell>
                        <TableCell className="p-6 font-bold text-neutral-400 flex items-center gap-2">
                          <Eye size={14} /> {post.views || 0}
                        </TableCell>
                        <TableCell className="p-6 text-neutral-400 font-medium text-xs">
                          {new Date(post.created_at).toLocaleDateString('ku-IQ')}
                        </TableCell>
                        <TableCell className="p-6 text-left">
                          <div className="flex items-center justify-start gap-2">
                            <Button variant="ghost" size="icon" onClick={() => startEdit(post)} className="h-10 w-10 rounded-xl text-neutral-400 hover:text-amber-500 hover:bg-amber-50">
                              <Edit3 size={18} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteItem('posts', post.id)} className="h-10 w-10 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50">
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {activeTab === 'categories' && categories.map((cat) => (
                      <TableRow key={cat.id} className="border-neutral-50 hover:bg-neutral-50/30">
                        <TableCell className="p-6 font-bold text-neutral-800 text-base">{cat.name}</TableCell>
                        <TableCell className="p-6 font-mono text-xs text-neutral-400 ltr">{cat.slug}</TableCell>
                        <TableCell className="p-6 text-left">
                          <div className="flex items-center justify-start gap-2">
                            <Button variant="ghost" size="icon" onClick={() => startEdit(cat)} className="h-10 w-10 rounded-xl text-neutral-400 hover:text-amber-500">
                              <Edit3 size={18} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteItem('categories', cat.id)} className="h-10 w-10 rounded-xl text-neutral-400 hover:text-red-500">
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {activeTab === 'activities' && activities.map((act) => (
                      <TableRow key={act.id} className="border-neutral-50 hover:bg-neutral-50/30">
                        <TableCell className="p-6">
                           <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                            {act.image_url ? <img src={act.image_url} className="w-full h-full object-cover" /> : <Calendar className="w-full h-full p-3 text-neutral-300" />}
                          </div>
                        </TableCell>
                        <TableCell className="p-6 font-bold text-neutral-800 text-base">{act.title}</TableCell>
                        <TableCell className="p-6 text-neutral-400 font-medium text-xs">
                          {new Date(act.date).toLocaleDateString('ku-IQ')}
                        </TableCell>
                        <TableCell className="p-6 text-neutral-400 font-medium text-xs">
                           <div className="flex items-center gap-2"><MapPin size={12} className="text-orange-500" /> {act.location}</div>
                        </TableCell>
                        <TableCell className="p-6 text-left">
                          <div className="flex items-center justify-start gap-2">
                            <Button variant="ghost" size="icon" onClick={() => startEdit(act)} className="h-10 w-10 rounded-xl text-neutral-400 hover:text-amber-500">
                              <Edit3 size={18} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteItem('activities', act.id)} className="h-10 w-10 rounded-xl text-neutral-400 hover:text-red-500">
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {activeTab === 'pages' && pages.map((page) => (
                      <TableRow key={page.id} className="border-neutral-50 hover:bg-neutral-50/30">
                        <TableCell className="p-6 font-mono text-xs text-neutral-400 ltr">/{page.slug}</TableCell>
                        <TableCell className="p-6 font-bold text-neutral-800 text-base">{page.title}</TableCell>
                        <TableCell className="p-6 text-left">
                          <div className="flex items-center justify-start gap-2">
                            <Button variant="ghost" size="icon" onClick={() => startEdit(page)} className="h-10 w-10 rounded-xl text-neutral-400 hover:text-emerald-500">
                              <Edit3 size={18} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {activeTab === 'users' && profiles.map((profile) => (
                      <TableRow key={profile.id} className="border-neutral-50 hover:bg-neutral-50/30">
                        <TableCell className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden">
                               {profile.avatar_url ? (
                                  <img src={profile.avatar_url} className="w-full h-full object-cover" />
                                ) : <User size={20} className="w-full h-full p-2 text-neutral-300" />}
                            </div>
                            <span className="font-bold text-neutral-800">{profile.full_name || 'بێ ناو'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="p-6 font-medium text-neutral-400 ltr">{profile.email}</TableCell>
                        <TableCell className="p-6">
                           <span className={`px-3 py-1 text-[10px] font-black rounded-full border uppercase ${
                            profile.role === 'admin' ? 'bg-[#563a4a] text-white border-[#563a4a]' : 'bg-neutral-50 text-neutral-400 border-neutral-100'
                          }`}>
                            {profile.role === 'admin' ? 'بەڕێوەبەر' : 'بەکارهێنەر'}
                          </span>
                        </TableCell>
                        <TableCell className="p-6 text-left">
                          <div className="flex items-center justify-start gap-2">
                            <Button variant="ghost" size="icon" onClick={() => startEdit(profile)} className="h-10 w-10 rounded-xl text-neutral-400 hover:text-amber-500">
                              <Edit3 size={18} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Empty State */}
                {((activeTab === 'posts' && posts.length === 0) || 
                  (activeTab === 'categories' && categories.length === 0) ||
                  (activeTab === 'activities' && activities.length === 0)) && (
                  <div className="py-32 text-center bg-white">
                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-200">
                      <Search size={32} />
                    </div>
                    <h3 className="text-xl font-black text-[#563a4a] mb-2">هیچ بڕگەیەک نەدۆزرایەوە</h3>
                    <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">بۆ زیادکردن کلیک لە دوگمەی 'زیادکردنی نوێ' بکە</p>
                  </div>
                )}
              </Card>

              {/* Special View for Settings */}
              {activeTab === 'settings' && (
                <div className="space-y-10 animate-in fade-in duration-700">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {/* Brand Settings */}
                      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10 overflow-hidden border border-neutral-50">
                        <div className="flex items-center gap-5 mb-10 border-b border-neutral-50 pb-6">
                           <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                              <Zap size={24} />
                           </div>
                           <h3 className="text-2xl font-black text-neutral-800">براندینگ و ناو</h3>
                        </div>
                        
                        <div className="space-y-8">
                          <div className="flex items-center gap-10">
                             <div {...imageDropzone.getRootProps()} className="w-32 h-32 rounded-[2rem] border-2 border-dashed border-neutral-200 hover:border-amber-500/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-neutral-50 overflow-hidden relative group shadow-inner">
                                <input {...imageDropzone.getInputProps()} />
                                {settings.logo_url ? (
                                  <img src={settings.logo_url} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
                                ) : <Upload className="text-neutral-300" size={24} />}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                   <Upload className="text-white" size={20} />
                                </div>
                             </div>
                             <div className="flex-1 space-y-4">
                                <Label className="font-black text-neutral-400 text-[10px] uppercase tracking-widest mr-2">ناوی ڕێکخراو / دامەزراوە</Label>
                                <Input value={settings.org_name} onChange={(e) => setSettings((p: any) => ({...p, org_name: e.target.value}))} className="rounded-2xl h-14 border-neutral-100 bg-neutral-50/50 text-right font-bold text-lg focus:ring-8 focus:ring-amber-500/5 transition-all" />
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <Label className="font-black text-neutral-400 text-[10px] uppercase tracking-widest mr-2">ڕەنگی سەرەکی</Label>
                              <div className="flex items-center gap-4 bg-neutral-50 rounded-2xl p-2 border border-neutral-100">
                                <div className="w-10 h-10 rounded-xl shadow-lg border-2 border-white" style={{ backgroundColor: settings.primary_color }}></div>
                                <Input type="color" value={settings.primary_color} onChange={(e) => setSettings((p: any) => ({...p, primary_color: e.target.value}))} className="w-full h-10 bg-transparent border-none p-0 cursor-pointer" />
                              </div>
                            </div>
                            <div className="space-y-4">
                              <Label className="font-black text-neutral-400 text-[10px] uppercase tracking-widest mr-2">ڕەنگی لاوەکی</Label>
                              <div className="flex items-center gap-4 bg-neutral-50 rounded-2xl p-2 border border-neutral-100">
                                <div className="w-10 h-10 rounded-xl shadow-lg border-2 border-white" style={{ backgroundColor: settings.secondary_color }}></div>
                                <Input type="color" value={settings.secondary_color} onChange={(e) => setSettings((p: any) => ({...p, secondary_color: e.target.value}))} className="w-full h-10 bg-transparent border-none p-0 cursor-pointer" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Social Media Settings */}
                      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10 border border-neutral-50">
                        <div className="flex items-center gap-5 mb-10 border-b border-neutral-50 pb-6">
                           <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                              <Share2 size={24} />
                           </div>
                           <h3 className="text-2xl font-black text-neutral-800">تۆڕە کۆمەڵایەتییەکان</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {[
                             { id: 'social_facebook', label: 'Facebook', icon: <Facebook size={20} className="text-[#1877F2]" /> },
                             { id: 'social_tiktok', label: 'TikTok', icon: <Music2 size={20} className="text-black" /> },
                             { id: 'social_instagram', label: 'Instagram', icon: <Instagram size={20} className="text-[#E4405F]" /> },
                             { id: 'social_youtube', label: 'YouTube', icon: <Youtube size={20} className="text-[#FF0000]" /> },
                           ].map((social) => (
                             <div key={social.id} className="space-y-3">
                                <Label className="font-black text-neutral-400 text-[10px] uppercase tracking-widest mr-2 flex items-center gap-2">
                                  {social.icon} {social.label}
                                </Label>
                                <Input 
                                  value={settings[social.id] || ''} 
                                  onChange={(e) => setSettings((p: any) => ({...p, [social.id]: e.target.value}))} 
                                  placeholder="لینکەکە لێرە بنووسە..." 
                                  className="rounded-xl h-12 border-neutral-100 bg-neutral-50/50 ltr px-4 font-bold focus:bg-white transition-all" 
                                />
                             </div>
                             ))}
                        </div>
                      </Card>

                      {/* Contact Settings */}
                      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10 border border-neutral-50">
                        <div className="flex items-center gap-5 mb-10 border-b border-neutral-50 pb-6">
                           <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                              <Info size={24} />
                           </div>
                           <h3 className="text-2xl font-black text-neutral-800">زانیارییەکانی پەیوەندی</h3>
                        </div>

                        <div className="space-y-6">
                           <div className="space-y-3">
                              <Label className="font-black text-neutral-400 text-[10px] uppercase tracking-widest mr-2 flex items-center gap-2">
                                <Mail size={16} /> ئیمەیڵ
                              </Label>
                              <Input 
                                value={settings.contact_email || ''} 
                                onChange={(e) => setSettings((p: any) => ({...p, contact_email: e.target.value}))} 
                                placeholder="example@email.com" 
                                className="rounded-xl h-12 border-neutral-100 bg-neutral-50/50 ltr px-4 font-bold focus:bg-white transition-all" 
                              />
                           </div>
                           <div className="space-y-3">
                              <Label className="font-black text-neutral-400 text-[10px] uppercase tracking-widest mr-2 flex items-center gap-2">
                                <Zap size={16} /> ژمارەی تەلەفۆن
                              </Label>
                              <Input 
                                value={settings.contact_phone || ''} 
                                onChange={(e) => setSettings((p: any) => ({...p, contact_phone: e.target.value}))} 
                                placeholder="07xx xxx xxxx" 
                                className="rounded-xl h-12 border-neutral-100 bg-neutral-50/50 ltr px-4 font-bold focus:bg-white transition-all" 
                              />
                           </div>
                           <div className="space-y-3">
                              <Label className="font-black text-neutral-400 text-[10px] uppercase tracking-widest mr-2 flex items-center gap-2">
                                <MapPin size={16} /> ناونیشان
                              </Label>
                              <Input 
                                value={settings.contact_location || ''} 
                                onChange={(e) => setSettings((p: any) => ({...p, contact_location: e.target.value}))} 
                                placeholder="سلێمانی، شەقامی سالم" 
                                className="rounded-xl h-12 border-neutral-100 bg-neutral-50/50 px-4 font-bold focus:bg-white transition-all text-right" 
                              />
                           </div>
                        </div>
                      </Card>
                   </div>
                   
                   <div className="flex justify-end mt-10">
                      <Button onClick={handleSettingsSubmit} disabled={loading} className="bg-[#563a4a] hover:bg-black text-white h-20 px-16 rounded-3xl font-black text-2xl shadow-2xl shadow-[#563a4a]/20 gap-4 transition-all hover:-translate-y-2">
                         {loading ? <RefreshCcw className="animate-spin" size={28} /> : <><Save size={28} /> پاشەکەوتکردنی هەموو ڕێکخستنەکان</>}
                      </Button>
                   </div>
                </div>
              )}
            </div>
          )}

          {/* Form View (Add/Edit) */}
          {viewMode === 'form' && (
            <div className="animate-in slide-in-from-bottom-10 duration-700 max-w-5xl mx-auto pb-20">
              <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden border border-neutral-50">
                <div className={`h-3 w-full ${activeTab === 'posts' ? 'bg-blue-500' : activeTab === 'activities' ? 'bg-orange-500' : 'bg-purple-500'}`}></div>
                <CardHeader className="p-12 border-b border-neutral-50 flex flex-row items-center justify-between bg-neutral-50/20">
                   <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${editingId ? 'bg-amber-500 text-white' : 'bg-[#563a4a] text-white'}`}>
                        {editingId ? <Edit3 size={28} /> : <PlusCircle size={28} />}
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-black text-[#1a1a1e]">
                          {editingId ? `دەستکاریکردنی ${activeTab === 'posts' ? 'بابەت' : activeTab === 'activities' ? 'چالاکی' : 'هاوپۆل'}` : `زیادکردنی ${activeTab === 'posts' ? 'بابەت' : activeTab === 'activities' ? 'چالاکی' : 'هاوپۆل'}ی نوێ`}
                        </CardTitle>
                        <p className="text-sm text-neutral-400 font-bold uppercase tracking-widest mt-1">تکایە هەموو زانیارییەکان بە وردی پڕبکەرەوە</p>
                      </div>
                   </div>
                   <Button variant="ghost" onClick={resetForm} className="rounded-full w-12 h-12 p-0 text-neutral-300 hover:text-red-500 hover:bg-red-50">
                      <X size={32} />
                   </Button>
                </CardHeader>
                <CardContent className="p-12">
                  <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Post Form */}
                    {activeTab === 'posts' && (
                      <>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                           <div className="lg:col-span-8 space-y-10">
                              <div className="space-y-4">
                                <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-[0.2em] mr-4">ناونیشانی بابەت</Label>
                                <Input 
                                  value={formData.title} 
                                  onChange={(e) => setFormData((p: any) => ({...p, title: e.target.value}))} 
                                  required 
                                  placeholder="ناونیشانێکی سەرنجڕاکێش بنووسە..." 
                                  className="rounded-[1.75rem] h-20 border-neutral-100 bg-neutral-50/50 text-right text-2xl font-black px-10 focus:bg-white focus:ring-8 focus:ring-blue-500/5 transition-all shadow-sm" 
                                />
                              </div>

                              <div className="space-y-4">
                                <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-[0.2em] mr-4">کورتە (Excerpt)</Label>
                                <Textarea 
                                  value={formData.excerpt} 
                                  onChange={(e) => setFormData((p: any) => ({...p, excerpt: e.target.value}))} 
                                  rows={3} 
                                  className="rounded-[1.75rem] border-neutral-100 bg-neutral-50/50 p-8 text-right font-medium text-lg leading-relaxed focus:bg-white shadow-sm" 
                                  placeholder="کورتەیەک بۆ ئەوەی خوێنەر ڕابکێشێت بۆ خوێندنەوەی بابەتەکە..." 
                                />
                              </div>
                           </div>
                           
                           <div className="lg:col-span-4 space-y-10">
                              <div className="space-y-4">
                                <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-[0.2em] mr-4">بەرگی بابەت</Label>
                                <div {...imageDropzone.getRootProps()} className={`w-full h-56 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all bg-neutral-50/50 shadow-inner overflow-hidden relative group ${formData.image_url ? 'border-emerald-500/30' : 'border-neutral-200 hover:border-blue-500/50'}`}>
                                  <input {...imageDropzone.getInputProps()} />
                                  {uploading ? (
                                    <RefreshCcw className="animate-spin text-blue-500" size={32} />
                                  ) : formData.image_url ? (
                                    <img src={formData.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  ) : (
                                    <>
                                      <Upload size={32} className="text-neutral-300" />
                                      <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">وێنە باربکە</span>
                                    </>
                                  )}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                     <Upload className="text-white" size={24} />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-[0.2em] mr-4">هاوپۆل</Label>
                                <div className="relative">
                                  <select 
                                    value={formData.category} 
                                    onChange={(e) => setFormData((p: any) => ({...p, category: e.target.value}))} 
                                    required
                                    className="w-full h-16 px-8 rounded-[1.5rem] border border-neutral-100 bg-neutral-50/50 outline-none transition-all font-black text-right appearance-none cursor-pointer focus:bg-white shadow-sm"
                                  >
                                    <option value="">هەڵبژێرە</option>
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                  </select>
                                  <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300">
                                    <Tag size={18} />
                                  </div>
                                </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-[0.2em] mr-4">ناوەرۆکی بابەت</Label>
                           
                           <div className="bg-neutral-50 rounded-[2.5rem] p-4 border border-neutral-100 shadow-inner">
                              <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-3xl border border-neutral-100 mb-6 shadow-sm">
                                <button type="button" onClick={() => insertText('<b>', '</b>')} className="p-4 rounded-2xl hover:bg-blue-50 text-blue-600 transition-all hover:scale-110"><Bold size={20} /></button>
                                <button type="button" onClick={() => insertText('<i>', '</i>')} className="p-4 rounded-2xl hover:bg-purple-50 text-purple-600 transition-all hover:scale-110"><Italic size={20} /></button>
                                <button type="button" onClick={() => insertText('<h1>', '</h1>')} className="p-4 rounded-2xl hover:bg-orange-50 text-orange-600 transition-all hover:scale-110"><Heading1 size={20} /></button>
                                <button type="button" onClick={() => insertText('<h2>', '</h2>')} className="p-4 rounded-2xl hover:bg-amber-50 text-amber-600 transition-all hover:scale-110"><Heading2 size={20} /></button>
                                <div className="w-px h-8 bg-neutral-100 mx-2"></div>
                                <button type="button" onClick={() => insertText('<ul>\n  <li>', '</li>\n</ul>')} className="p-4 rounded-2xl hover:bg-emerald-50 text-emerald-600 transition-all hover:scale-110"><List size={20} /></button>
                                <button type="button" onClick={() => insertText('<blockquote>', '</blockquote>')} className="p-4 rounded-2xl hover:bg-cyan-50 text-cyan-600 transition-all hover:scale-110"><Quote size={20} /></button>
                                <button type="button" onClick={() => insertText('<a href="#">', '</a>')} className="p-4 rounded-2xl hover:bg-indigo-50 text-indigo-600 transition-all hover:scale-110"><LinkIcon size={20} /></button>
                              </div>

                              <Textarea 
                                id="main-editor"
                                value={formData.content} 
                                onChange={(e) => setFormData((p: any) => ({...p, content: e.target.value}))} 
                                required 
                                rows={20} 
                                className="rounded-3xl border-none bg-white p-12 text-2xl leading-relaxed text-right font-medium focus:ring-0 transition-all shadow-sm" 
                                placeholder="لێرە دەست بکە بە نووسینی ناوەرۆکی بابەتەکە بە زمانی کوردی..." 
                              />
                           </div>
                        </div>
                      </>
                    )}

                    {/* Category Form */}
                    {activeTab === 'categories' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">ناوی هاوپۆل</Label>
                          <Input value={formData.name} onChange={(e) => setFormData((p: any) => ({...p, name: e.target.value}))} required className="rounded-2xl h-16 border-neutral-100 bg-neutral-50 px-8 text-xl font-black shadow-sm" placeholder="بۆ نموونە: تەکنەلۆژیا" />
                        </div>
                        <div className="space-y-4">
                          <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">ناسنامە (Slug)</Label>
                          <Input value={formData.slug} onChange={(e) => setFormData((p: any) => ({...p, slug: e.target.value}))} required className="rounded-2xl h-16 border-neutral-100 bg-neutral-50 px-8 font-bold ltr shadow-sm" placeholder="technology" />
                        </div>
                      </div>
                    )}

                    {/* Activity Form */}
                    {activeTab === 'activities' && (
                      <div className="space-y-12">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-10">
                               <div className="space-y-4">
                                  <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">ناوی چالاکی</Label>
                                  <Input value={formData.title} onChange={(e) => setFormData((p: any) => ({...p, title: e.target.value}))} required className="rounded-2xl h-16 border-neutral-100 bg-neutral-50 px-8 text-xl font-black shadow-sm" />
                               </div>
                               <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                     <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">بەروار</Label>
                                     <Input type="date" value={formData.date} onChange={(e) => setFormData((p: any) => ({...p, date: e.target.value}))} required className="rounded-2xl h-16 border-neutral-100 bg-neutral-50 px-6 font-bold cursor-pointer" />
                                  </div>
                                  <div className="space-y-4">
                                     <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">شوێن</Label>
                                     <Input value={formData.location} onChange={(e) => setFormData((p: any) => ({...p, location: e.target.value}))} required className="rounded-2xl h-16 border-neutral-100 bg-neutral-50 px-8 font-bold" placeholder="بۆ نموونە: سلێمانی" />
                                  </div>
                               </div>
                            </div>
                            <div className="space-y-4">
                               <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">وێنەی چالاکی</Label>
                               <div {...imageDropzone.getRootProps()} className={`w-full h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all bg-neutral-50 overflow-hidden relative group ${formData.image_url ? 'border-emerald-500/30' : 'border-neutral-200 hover:border-orange-500/50'}`}>
                                  <input {...imageDropzone.getInputProps()} />
                                  {uploading ? (
                                    <RefreshCcw className="animate-spin text-orange-500" size={28} />
                                  ) : formData.image_url ? (
                                    <img src={formData.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  ) : (
                                    <>
                                      <Upload size={28} className="text-neutral-300" />
                                      <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">وێنە باربکە</span>
                                    </>
                                  )}
                               </div>
                            </div>
                         </div>
                         <div className="space-y-4">
                            <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">وەسفی چالاکی</Label>
                            <Textarea value={formData.description} onChange={(e) => setFormData((p: any) => ({...p, description: e.target.value}))} rows={6} className="rounded-3xl border-neutral-100 bg-neutral-50 p-8 text-right font-medium text-lg leading-relaxed shadow-sm" placeholder="باسکردنی چالاکییەکە بە وردی..." />
                         </div>
                      </div>
                    )}

                    {/* Page Form */}
                    {activeTab === 'pages' && (
                      <div className="space-y-10">
                         <div className="space-y-4">
                            <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">ناونیشانی لاپەڕە</Label>
                            <Input value={formData.title} onChange={(e) => setFormData((p: any) => ({...p, title: e.target.value}))} required className="rounded-2xl h-20 border-neutral-100 bg-neutral-50 text-right font-black text-2xl px-10 shadow-sm" />
                         </div>

                         {formData.slug === 'about' && (
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                             {[1, 2, 3].map((num) => (
                               <Card key={num} className="p-6 border-neutral-100 bg-neutral-50/30 rounded-3xl space-y-4">
                                 <Label className="font-black text-[#563a4a] text-sm flex items-center gap-2">
                                   <Zap size={16} className="text-[#c29181]" />
                                   کارتی {num === 1 ? 'پەیام' : num === 2 ? 'ئامانج' : 'بینین'}
                                 </Label>
                                 <div className="space-y-3">
                                   <Input 
                                     placeholder="ناونیشانی کارت" 
                                     value={formData[`card${num}_title` as keyof typeof formData]} 
                                     onChange={(e) => setFormData((p: any) => ({...p, [`card${num}_title`]: e.target.value}))}
                                     className="rounded-xl border-neutral-100 font-bold"
                                   />
                                   <Textarea 
                                     placeholder="ناوەرۆکی کارت" 
                                     rows={3}
                                     value={formData[`card${num}_content` as keyof typeof formData]} 
                                     onChange={(e) => setFormData((p: any) => ({...p, [`card${num}_content`]: e.target.value}))}
                                     className="rounded-xl border-neutral-100 text-sm"
                                   />
                                 </div>
                               </Card>
                             ))}
                           </div>
                         )}

                         <div className="space-y-6">
                            <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">ناوەرۆک</Label>
                             <div className="bg-neutral-50 rounded-[2.5rem] p-4 border border-neutral-100 shadow-inner">
                                <Textarea 
                                  value={formData.content} 
                                  onChange={(e) => setFormData((p: any) => ({...p, content: e.target.value}))} 
                                  required 
                                  rows={15} 
                                  className="rounded-3xl border-none bg-white p-12 text-2xl leading-relaxed text-right font-medium focus:ring-0 shadow-sm" 
                                />
                             </div>
                         </div>
                      </div>
                    )}

                    {/* Profile Form */}
                    {activeTab === 'users' && (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                         <div className="md:col-span-4 flex flex-col items-center">
                            <div {...imageDropzone.getRootProps()} className="w-48 h-48 rounded-[3rem] border-4 border-dashed border-neutral-100 hover:border-rose-500/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all bg-neutral-50 relative group shadow-inner">
                               <input {...imageDropzone.getInputProps()} />
                               {formData.avatar_url ? (
                                 <img src={formData.avatar_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                               ) : <User className="text-neutral-200" size={56} />}
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                  <Upload className="text-white" size={28} />
                               </div>
                            </div>
                            <p className="text-[10px] font-black text-neutral-400 mt-6 uppercase tracking-[0.3em]">وێنەی کەسی</p>
                         </div>
                         <div className="md:col-span-8 space-y-10">
                            <div className="space-y-4">
                               <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">ناوی تەواو</Label>
                               <Input value={formData.full_name} onChange={(e) => setFormData((p: any) => ({...p, full_name: e.target.value}))} className="rounded-2xl h-16 border-neutral-100 bg-neutral-50 px-8 text-xl font-black shadow-sm" />
                            </div>
                            <div className="space-y-4">
                               <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">پلەی بەکارهێنەر</Label>
                               <div className="relative">
                                  <select 
                                    value={formData.role} 
                                    onChange={(e) => setFormData((p: any) => ({...p, role: e.target.value}))} 
                                    className="w-full h-16 px-8 rounded-2xl border border-neutral-100 bg-neutral-50 font-black text-right appearance-none cursor-pointer focus:bg-white shadow-sm"
                                  >
                                    <option value="user">بەکارهێنەری ئاسایی</option>
                                    <option value="admin">بەڕێوەبەری سەرەکی</option>
                                  </select>
                                  <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300">
                                    <ShieldCheck size={20} />
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                    )}

                    <div className="pt-10 border-t border-neutral-50">
                      <Button type="submit" disabled={loading} className="w-full bg-[#1a1a1e] hover:bg-black h-24 rounded-[2rem] font-black text-white transition-all shadow-2xl text-2xl group relative overflow-hidden">
                        <span className="relative z-10 flex items-center justify-center gap-4">
                          {loading ? <RefreshCcw className="animate-spin" size={32} /> : (editingId ? <><Save size={32}/> پاشەکەوتکردنی گۆڕانکارییەکان</> : <><PlusCircle size={32}/> بڵاوکردنەوەی فەرمی</>)}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Styles for Hide Scrollbar */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .ltr {
          direction: ltr;
        }
      `}</style>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import * as actions from '@/lib/actions';
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
    FileText,
    Layers,
  Calendar,
  Image as ImageIcon,
  Settings,
  Globe,
    Palette,
    Share2,
    Edit3,
    Pencil,
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
  LayoutDashboard,
  Trash2
} from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { TiptapEditor } from '@/components/TiptapEditor';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

type ViewMode = 'list' | 'form';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Stats for dashboard
    const [stats, setStats] = useState<any>({
      totalPosts: 0,
      totalViews: 0,
      totalUsers: 0,
      totalCategories: 0,
      recentActivity: [],
      chartData: []
    });

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
  const [tags, setTags] = useState<any[]>([]);
  const [dbMenuItems, setDbMenuItems] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  // Editing state
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

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
      parent_id: '',
      description: '',
      full_name: '',
      role: 'user',
      avatar_url: '',
      status: 'published',
      card1_title: '',
      card1_content: '',
      card2_title: '',
      card2_content: '',
      card3_title: '',
      card3_content: '',
      selectedTags: [],
      menuLabel: '',
      menuType: 'page',
      menuTargetId: '',
      menuUrl: '',
      menuSortOrder: 0,
      menuParentId: '',
      userEmail: '',
      userPassword: ''
    });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch Data on Load
  useEffect(() => {
    // Always fetch settings for the login page
    fetchSettings();

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

    const fetchStats = async () => {
      const data = await actions.getStatsAction();
      setStats((prev: any) => ({
        ...prev,
        ...data
      }));
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPosts(),
        fetchCategories(),
        fetchTags(),
        fetchMenuItems(),
        fetchPages(),
        fetchProfiles(),
        fetchStats()
      ]);
      setLoading(false);
    };

  const fetchSettings = async () => {
    const data = await actions.getSiteSettingsAction();
    if (data) setSettings(data);
  };

  const fetchPosts = async () => {
    const { data, count } = await actions.getPostsAction({
      searchTerm,
      statusFilter,
      authorFilter,
      dateFilter,
      page: currentPage,
      pageSize
    });
    setTotalCount(count || 0);
    setPosts(data || []);
  };

  const fetchCategories = async () => {
    const data = await actions.getCategoriesAction();
    setCategories(data || []);
  };

  const fetchTags = async () => {
    const data = await actions.getTagsAction();
    setTags(data || []);
  };

  const fetchMenuItems = async () => {
    const data = await actions.getMenuItemsAction();
    setDbMenuItems(data || []);
  };

  const fetchPages = async () => {
    const { data, count } = await actions.getPagesAction({
      searchTerm,
      statusFilter,
      page: currentPage,
      pageSize
    });
    setTotalCount(count || 0);
    setPages(data || []);
  };

  const fetchProfiles = async () => {
    const { data, count } = await actions.getProfilesAction({
      searchTerm,
      statusFilter,
      page: currentPage,
      pageSize
    });
    setTotalCount(count || 0);
    setProfiles(data || []);
  };

  // Re-fetch when page changes
  useEffect(() => {
    if (user) {
      if (activeTab === 'posts') fetchPosts();
      else if (activeTab === 'pages') fetchPages();
      else if (activeTab === 'users') fetchProfiles();
    }
  }, [currentPage]);

  // Reset page when tab or filters change
  useEffect(() => {
    setCurrentPage(1);
    if (user) fetchData();
  }, [activeTab, searchTerm, statusFilter, authorFilter, dateFilter]);

  // Upload Logic
  const handleFileUpload = async (file: File, field: string) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to upload');
      }

      const publicUrl = data.publicUrl;

      if (field === 'logo') {
        setSettings((prev: any) => ({ ...prev, logo_url: publicUrl }));
      } else {
        setFormData((prev: any) => ({ ...prev, [field]: publicUrl }));
      }

      toast.success('فایلەکە بە سەرکەوتوویی بارکرا');
    } catch (error: any) {
      toast.error('هەڵە لە بارکردنی فایل: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const imageDropzone = useDropzone({
    onDrop: (files) => {
      const field = activeTab === 'users' ? 'avatar_url' : activeTab === 'settings' ? 'logo' : 'image_url';
      handleFileUpload(files[0], field);
    },
    accept: { 'image/*': [] },
    multiple: false
  });

    const handleResetPassword = async () => {
      if (!email) {
        toast.error('تکایە سەرەتا ئیمەیڵەکەت بنووسە');
        return;
      }
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin`,
      });
      setLoading(false);
      if (error) toast.error('هەڵە لە ناردنی لینکی نوێکردنەوە: ' + error.message);
      else toast.success('لینکی نوێکردنەوەی وشەی تێپەڕ بۆ ئیمەیڵەکەت ناردرا');
    };

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
      category_id: '',
      sub_category_id: '',
      image_url: '',
      date: '',
      location: '',
      name: '',
      slug: '',
      parent_id: '',
      description: '',
      full_name: '',
      role: 'user',
      avatar_url: '',
      status: 'published',
      selectedTags: [],
      menuLabel: '',
      menuType: 'page',
      menuTargetId: '',
      menuUrl: '',
      menuSortOrder: 0,
      menuParentId: '',
      userEmail: '',
      userPassword: ''
    });
    setEditingId(null);
    setViewMode('list');
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    if (activeTab === 'posts') {
      setFormData({
        title: item.title,
        content: item.content || '',
        excerpt: item.excerpt || '',
        category: item.category,
        category_id: item.category_id || '',
        sub_category_id: item.sub_category_id || '',
        image_url: item.image_url,
        status: item.status || 'published',
        selectedTags: item.post_tags?.map((pt: any) => pt.tag_id) || []
      });
    } else if (activeTab === 'tags') {
      setFormData({
        name: item.name,
        slug: item.slug
      });
    } else if (activeTab === 'menu') {
      setFormData({
        menuLabel: item.label,
        menuType: item.type,
        menuTargetId: item.target_id || '',
        menuUrl: item.url || '',
        menuSortOrder: item.sort_order,
        menuParentId: item.parent_id || ''
      });
    } else if (activeTab === 'categories') {
      setFormData({
        name: item.name,
        slug: item.slug,
        parent_id: item.parent_id || ''
      });
      } else if (activeTab === 'pages') {
        setFormData({
          title: item.title,
          content: item.content || '',
          slug: item.slug,
          status: item.status || 'published',
          image_url: item.image_url || '',
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
        email: item.email,
        status: item.status || 'active'
      });
    }
    setViewMode('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let result: any = { success: false };

    try {
      if (editingId) {
        if (activeTab === 'posts') {
          result = await actions.updatePostAction(Number(editingId), {
            title: formData.title,
            content: formData.content,
            excerpt: formData.excerpt,
            category: formData.category,
            category_id: formData.category_id && !isNaN(parseInt(formData.category_id)) ? parseInt(formData.category_id) : null,
            sub_category_id: formData.sub_category_id && !isNaN(parseInt(formData.sub_category_id)) ? parseInt(formData.sub_category_id) : null,
            image_url: formData.image_url,
            status: formData.status,
            selectedTags: formData.selectedTags.map(Number)
          });
        } else if (activeTab === 'tags') {
          result = await actions.updateTagAction(Number(editingId), {
            name: formData.name,
            slug: formData.slug
          });
        } else if (activeTab === 'menu') {
          result = await actions.updateMenuItemAction(Number(editingId), {
            label: formData.menuLabel,
            type: formData.menuType,
            target_id: formData.menuTargetId || null,
            url: formData.menuUrl || null,
            sort_order: formData.menuSortOrder,
            parent_id: formData.menuParentId ? Number(formData.menuParentId) : null
          });
        } else if (activeTab === 'categories') {
          result = await actions.updateCategoryAction(Number(editingId), {
            name: formData.name,
            slug: formData.slug,
            parent_id: formData.parent_id ? Number(formData.parent_id) : null
          });
          } else if (activeTab === 'pages') {
              result = await actions.updatePageAction(Number(editingId), {
                title: formData.title,
                content: formData.content,
                slug: formData.slug,
                status: formData.status,
                image_url: formData.image_url,
                card1_title: formData.card1_title,
                card1_content: formData.card1_content,
                card2_title: formData.card2_title,
                card2_content: formData.card2_content,
                card3_title: formData.card3_title,
                card3_content: formData.card3_content
              });

        } else if (activeTab === 'users') {
          result = await actions.updateProfileAction(editingId.toString(), {
            full_name: formData.full_name,
            role: formData.role,
            avatar_url: formData.avatar_url,
            status: formData.status
          });
        }
      } else {
        if (activeTab === 'posts') {
          result = await actions.createPostAction({
            title: formData.title,
            content: formData.content,
            excerpt: formData.excerpt,
            category: formData.category,
            category_id: formData.category_id && !isNaN(parseInt(formData.category_id)) ? parseInt(formData.category_id) : null,
            sub_category_id: formData.sub_category_id && !isNaN(parseInt(formData.sub_category_id)) ? parseInt(formData.sub_category_id) : null,
            image_url: formData.image_url,
            status: formData.status,
            author_id: user.id,
            selectedTags: formData.selectedTags.map(Number)
          });
        } else if (activeTab === 'tags') {
          result = await actions.createTagAction({ name: formData.name, slug: formData.slug });
        } else if (activeTab === 'menu') {
          result = await actions.createMenuItemAction({
            label: formData.menuLabel,
            type: formData.menuType,
            target_id: formData.menuTargetId || null,
            url: formData.menuUrl || null,
            sort_order: formData.menuSortOrder,
            parent_id: formData.menuParentId ? Number(formData.menuParentId) : null
          });
        } else if (activeTab === 'categories') {
            result = await actions.createCategoryAction({ 
              name: formData.name, 
              slug: formData.slug,
              parent_id: formData.parent_id ? Number(formData.parent_id) : null
            });
            } else if (activeTab === 'pages') {
                result = await actions.createPageAction({
                  title: formData.title,
                  content: formData.content,
                  slug: formData.slug,
                  status: formData.status,
                  image_url: formData.image_url,
                  card1_title: formData.card1_title,
                  card1_content: formData.card1_content,
                  card2_title: formData.card2_title,
                  card2_content: formData.card2_content,
                  card3_title: formData.card3_title,
                  card3_content: formData.card3_content,
                  author_id: user.id
                });
            } else if (activeTab === 'users') {
              // Create user via Supabase Auth first, then create profile
              if (!formData.userEmail || !formData.userPassword) {
                toast.error('تکایە ئیمەیڵ و وشەی تێپەڕ پڕبکەرەوە');
                setLoading(false);
                return;
              }
              const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.userEmail,
                password: formData.userPassword,
              });
              if (authError) {
                toast.error('هەڵە لە دروستکردنی بەکارهێنەر: ' + authError.message);
                setLoading(false);
                return;
              }
              if (authData.user) {
                result = await actions.createProfileAction({
                  id: authData.user.id,
                  email: formData.userEmail,
                  full_name: formData.full_name,
                  role: formData.role,
                  avatar_url: formData.avatar_url,
                  status: formData.status || 'active'
                });
              } else {
                toast.error('هەڵە لە دروستکردنی بەکارهێنەر');
                setLoading(false);
                return;
              }
            }

      }

      if (result.success) {
        toast.success(editingId ? 'بە سەرکەوتوویی نوێکرایەوە!' : 'بە سەرکەوتوویی زیادکرا!');
        resetForm();
        fetchData();
      } else {
        toast.error('هەڵەیەک ڕوویدا');
      }
    } catch (err: any) {
      toast.error('هەڵەیەک ڕوویدا: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await actions.updateSiteSettingsAction(settings);
    setLoading(false);
    if (!result.success) toast.error('هەڵە لە نوێکردنەوەی ڕێکخستنەکان');
    else {
      toast.success('ڕێکخستنەکان بە سەرکەوتوویی پارێزران!');
      fetchSettings();
    }
  };

  const confirmDelete = (item: any) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    let result: any = { success: false };
    
    try {
      switch (activeTab) {
        case 'posts': result = await actions.deletePostAction(Number(itemToDelete.id)); break;
        case 'categories': result = await actions.deleteCategoryAction(Number(itemToDelete.id)); break;
        case 'tags': result = await actions.deleteTagAction(Number(itemToDelete.id)); break;
        case 'menu': result = await actions.deleteMenuItemAction(Number(itemToDelete.id)); break;
        case 'pages': result = await actions.deletePageAction(Number(itemToDelete.id)); break;
        case 'users': result = await actions.deleteProfileAction(itemToDelete.id.toString()); break;
        default: return;
      }

      if (result.success) {
        toast.success('بە سەرکەوتوویی سڕایەوە');
        fetchData();
      } else {
        toast.error('هەڵەیەک لە سڕینەوەدا ڕوویدا');
      }
    } catch (err: any) {
      toast.error('هەڵەیەک لە سڕینەوەدا ڕوویدا: ' + err.message);
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans" dir="rtl">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-10 flex flex-col items-center">
          <div className="mb-8 text-center">
             {settings.logo_url ? (
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-3 mb-6 shadow-sm border border-slate-100 mx-auto">
                  <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Zap size={32} className="text-[#563a4a]" />
                </div>
              )}
             <h2 className="text-2xl font-black text-slate-800 mb-1">{settings.org_name}</h2>
             <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">چوونەژوورەوەی بەڕێوەبەر</p>
          </div>
          
            <form onSubmit={showResetPassword ? (e) => { e.preventDefault(); handleResetPassword(); } : (showRegister ? handleRegister : handleLogin)} className="w-full space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-black mr-1 text-sm">ئیمەیڵ</Label>
                <div className="relative group">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="admin@example.com"
                    className="rounded-xl h-14 border-slate-300 bg-white text-slate-900 pr-11 font-bold focus:ring-2 focus:ring-[#563a4a]/20 transition-all shadow-sm"
                  />
                </div>
              </div>
              
              {!showResetPassword && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label className="text-slate-700 font-black mr-1 text-sm">وشەی تێپەڕ</Label>
                  <div className="relative group">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required={!showResetPassword}
                      placeholder="••••••••"
                      className="rounded-xl h-14 border-slate-300 bg-white text-slate-900 pr-11 font-bold focus:ring-2 focus:ring-[#563a4a]/20 transition-all shadow-sm"
                    />
                  </div>
                </div>
              )}
              
                <div className="pt-4 space-y-4">
                  <Button type="submit" disabled={loading} className="w-full bg-[#563a4a] hover:bg-black h-14 rounded-2xl font-black text-white text-lg transition-all shadow-xl hover:-translate-y-1 active:translate-y-0">
                    {loading ? <RefreshCcw className="animate-spin" size={20} /> : (showResetPassword ? 'داواکردنی وشەی نهێنی نوێ' : (showRegister ? 'دروستکردنی ئەژمار' : 'بچۆ ژوورەوە'))}
                  </Button>
                  
                      {!showRegister && (
                        <div className="flex justify-center pt-4">
                          <Button 
                            type="button" 
                            onClick={() => setShowResetPassword(!showResetPassword)}
                            className="w-full h-12 rounded-2xl font-black text-white bg-[#563a4a] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
                          >
                            {showResetPassword ? (
                              <>
                                <ArrowLeft size={16} />
                                گەڕانەوە بۆ چوونەژوورەوە
                              </>
                            ) : (
                              <>
                                <Info size={16} />
                                وشەی نهێنیت بیرچووە؟
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                </div>
            </form>
          
          <div className="mt-8 text-center border-t border-slate-100 pt-6 w-full">
             <p className="text-slate-300 font-bold text-[10px] uppercase tracking-widest">{settings.org_name} © 2026</p>
          </div>
        </div>
      </div>
    );
  }

    const adminNavigation = [
      { id: 'dashboard', label: 'داشبۆرد', icon: <LayoutDashboard size={20} />, color: 'text-amber-500' },
      { id: 'posts', label: 'بابەتەکان', icon: <FileText size={20} />, color: 'text-blue-500' },
      { id: 'categories', label: 'هاوپۆلەکان', icon: <Layers size={20} />, color: 'text-purple-500' },
      { id: 'tags', label: 'تاگەکان', icon: <Tag size={20} />, color: 'text-emerald-500' },
      { id: 'menu', label: 'مێنۆ', icon: <List size={20} />, color: 'text-orange-500' },
      { id: 'pages', label: 'لاپەڕەکان', icon: <BookOpen size={20} />, color: 'text-cyan-500' },
      { id: 'users', label: 'بەکارهێنەران', icon: <Users size={20} />, color: 'text-rose-500' },
      { id: 'settings', label: 'ڕێکخستنەکان', icon: <Settings size={20} />, color: 'text-neutral-500' },
    ];

  const currentTabLabel = adminNavigation.find(item => item.id === activeTab)?.label;

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex font-sans selection:bg-[#c29181]/30" dir="rtl">
      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-24' : 'w-72'} bg-[#1a1a1e] text-white flex flex-col sticky top-0 h-screen z-50 shadow-2xl transition-all duration-300 flex-shrink-0`}>
        <div className={`p-8 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-4'} border-b border-white/5 bg-black/20 relative`}>
          {!isSidebarCollapsed && (
            <>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2 shadow-inner">
                <img src={settings.logo_url || 'https://via.placeholder.com/150'} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="overflow-hidden">
                <h2 className="text-lg font-black tracking-tight leading-none mb-1">کۆنترۆڵ پانێڵ</h2>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest truncate max-w-[140px]">{settings.org_name}</p>
              </div>
            </>
          )}
          {isSidebarCollapsed && (
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-inner">
              <img src={settings.logo_url || 'https://via.placeholder.com/150'} alt="Logo" className="w-full h-full object-contain" />
            </div>
          )}
          
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#c29181] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
          >
            {isSidebarCollapsed ? <ArrowLeft size={16} /> : <ChevronLeft size={16} className="rotate-180" />}
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-2 mt-4 overflow-y-auto no-scrollbar">
          {adminNavigation.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); resetForm(); }}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-4 px-6'} py-4 rounded-2xl font-black text-sm transition-all group ${
                activeTab === item.id 
                ? 'bg-[#563a4a] text-white shadow-xl shadow-black/20 translate-x-1' 
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title={isSidebarCollapsed ? item.label : ''}
            >
              <span className={`transition-colors ${activeTab === item.id ? 'text-white' : item.color} group-hover:scale-110 duration-300`}>
                {item.icon}
              </span>
              {!isSidebarCollapsed && item.label}
              {!isSidebarCollapsed && activeTab === item.id && <div className="mr-auto w-1.5 h-1.5 bg-[#c29181] rounded-full"></div>}
            </button>
          ))}
        </nav>

        <div className={`p-6 mt-auto border-t border-white/5 ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center mb-4' : 'gap-4 mb-6 px-2'}`}>
            <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden">
               {profiles.find(p => p.id === user.id)?.avatar_url ? (
                  <img src={profiles.find(p => p.id === user.id).avatar_url} className="w-full h-full object-cover" />
                ) : <User size={20} className="text-neutral-500" />}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black truncate">{user.email?.split('@')[0]}</p>
                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">بەڕێوەبەر</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className={`flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-black transition-all ${isSidebarCollapsed ? 'w-10 h-10 p-0' : 'w-full gap-3 px-6 py-4 text-xs uppercase tracking-widest'}`}
            title={isSidebarCollapsed ? 'چوونە دەرەوە' : ''}
          >
            <LogOut size={18} />
            {!isSidebarCollapsed && 'چوونە دەرەوە'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 transition-all duration-300">
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
                {viewMode === 'list' && activeTab !== 'settings' && (
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
              {/* Dashboard View */}
              {activeTab === 'dashboard' && viewMode === 'list' && (
                <div className="space-y-10 animate-in fade-in duration-700">
                  {/* Dashboard Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8 border border-neutral-50 flex items-center gap-6 group hover:shadow-xl transition-all duration-500">
                      <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-500 shadow-inner group-hover:scale-110 transition-transform">
                        <FileText size={32} />
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-1">کۆی بابەتەکان</p>
                        <h3 className="text-4xl font-black text-neutral-800 tracking-tight">{stats.totalPosts}</h3>
                      </div>
                    </Card>
                    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8 border border-neutral-50 flex items-center gap-6 group hover:shadow-xl transition-all duration-500">
                      <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
                        <Users size={32} />
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-1">بەکارهێنەران</p>
                        <h3 className="text-4xl font-black text-neutral-800 tracking-tight">{stats.totalUsers}</h3>
                      </div>
                    </Card>
                    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8 border border-neutral-50 flex items-center gap-6 group hover:shadow-xl transition-all duration-500">
                      <div className="w-16 h-16 bg-purple-50 rounded-[1.5rem] flex items-center justify-center text-purple-500 shadow-inner group-hover:scale-110 transition-transform">
                        <Layers size={32} />
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-1">هاوپۆلەکان</p>
                        <h3 className="text-4xl font-black text-neutral-800 tracking-tight">{stats.totalCategories}</h3>
                      </div>
                    </Card>
                    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8 border border-neutral-50 flex items-center gap-6 group hover:shadow-xl transition-all duration-500">
                      <div className="w-16 h-16 bg-orange-50 rounded-[1.5rem] flex items-center justify-center text-orange-500 shadow-inner group-hover:scale-110 transition-transform">
                        <Eye size={32} />
                      </div>
                        <div>
                          <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-1">سەردانەکان</p>
                          <h3 className="text-4xl font-black text-neutral-800 tracking-tight">{stats.totalViews}</h3>
                        </div>

                    </Card>
                  </div>

                  {/* Analytics Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 border-none shadow-sm rounded-[3rem] bg-white p-10 border border-neutral-50">
                      <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-[#1a1a1e] flex items-center gap-3">
                          <BarChart size={24} className="text-[#c29181]" />
                          ئاماری سەردانەکان
                        </h3>
                        <div className="flex items-center gap-2 bg-neutral-100/80 p-1 rounded-2xl border border-neutral-200/50 shadow-inner">
                          <button className="px-6 py-2 rounded-xl text-xs font-black bg-[#563a4a] text-white shadow-lg transition-all hover:scale-105 active:scale-95">هەفتانە</button>
                          <button className="px-6 py-2 rounded-xl text-xs font-black text-neutral-400 hover:text-[#563a4a] hover:bg-white transition-all">مانگانە</button>
                        </div>
                      </div>
                      <div className="h-[350px] w-full rtl">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#c29181" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#c29181" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dx={-10} />
                            <RechartsTooltip 
                              contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '15px' }}
                              itemStyle={{ fontWeight: 'black', color: '#563a4a' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#c29181" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    <Card className="border-none shadow-sm rounded-[3rem] bg-white p-10 border border-neutral-50 overflow-hidden relative">
                      <h3 className="text-xl font-black text-[#1a1a1e] mb-10 flex items-center gap-3">
                        <Clock size={24} className="text-[#563a4a]" />
                        دواترین چالاکییەکان
                      </h3>
                      <div className="space-y-6 relative z-10">
                        {stats.recentActivity.map((activity: any, i: number) => (
                          <div key={i} className="flex gap-5 group cursor-pointer">
                            <div className="flex flex-col items-center">
                               <div className="w-4 h-4 rounded-full border-4 border-[#c29181]/20 bg-[#c29181] group-hover:scale-125 transition-transform"></div>
                               {i !== stats.recentActivity.length - 1 && <div className="w-0.5 flex-1 bg-neutral-100 my-1"></div>}
                            </div>
                            <div className="pb-6">
                              <h4 className="text-sm font-black text-neutral-800 mb-1 group-hover:text-[#c29181] transition-colors">{activity.title}</h4>
                              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">بڵاوکرایەوە • {new Date(activity.created_at).toLocaleDateString('ku-IQ')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#563a4a]/5 rounded-full blur-3xl"></div>
                    </Card>
                  </div>
                </div>
              )}

                {/* Dashboard/List View */}
                {activeTab !== 'dashboard' && viewMode === 'list' && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    
                    {/* Search and Filter Bar */}

                  {activeTab !== 'settings' && (
                    <div className="space-y-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-neutral-100">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                          <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-[#563a4a] transition-colors" size={20} />
                          <Input 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            placeholder="گەڕان..." 
                            className="rounded-2xl h-14 border-neutral-100 bg-neutral-50 pr-14 pl-6 font-bold focus:bg-white focus:ring-8 focus:ring-[#563a4a]/5 transition-all" 
                          />
                        </div>
                        <Button onClick={() => { setCurrentPage(1); fetchData(); }} className="h-14 rounded-2xl px-8 bg-[#563a4a] hover:bg-[#c29181] text-white font-black transition-all gap-2">
                          <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                          نوێکردنەوە
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-50">
                        {(activeTab === 'posts' || activeTab === 'pages' || activeTab === 'users') && (
                          <div className="relative">
                            <Label className="text-[9px] font-black uppercase text-neutral-400 mr-4 mb-2 block">بارودۆخ</Label>
                            <select 
                              value={statusFilter} 
                              onChange={(e) => setStatusFilter(e.target.value)}
                              className="w-full h-14 px-8 rounded-2xl border border-neutral-100 bg-neutral-50 font-black text-right appearance-none cursor-pointer focus:bg-white shadow-sm"
                            >
                              <option value="all">هەموو بارودۆخەکان</option>
                              {activeTab === 'users' ? (
                                <>
                                  <option value="published">چالاک</option>
                                  <option value="draft">ڕاگیراو</option>
                                </>
                              ) : (
                                <>
                                  <option value="published">بڵاوکراوە</option>
                                  <option value="draft">ڕەشنووس</option>
                                  <option value="deleted">سڕاوە</option>
                                </>
                              )}
                            </select>
                            <div className="absolute left-6 bottom-4 pointer-events-none text-neutral-300">
                              <Clock size={18} />
                            </div>
                          </div>
                        )}

                        {activeTab === 'posts' && (
                          <>
                            <div className="relative">
                              <Label className="text-[9px] font-black uppercase text-neutral-400 mr-4 mb-2 block">نووسەر</Label>
                              <select 
                                value={authorFilter} 
                                onChange={(e) => setAuthorFilter(e.target.value)}
                                className="w-full h-14 px-8 rounded-2xl border border-neutral-100 bg-neutral-50 font-black text-right appearance-none cursor-pointer focus:bg-white shadow-sm"
                              >
                                <option value="all">هەموو نووسەران</option>
                                {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                              </select>
                              <div className="absolute left-6 bottom-4 pointer-events-none text-neutral-300">
                                <User size={18} />
                              </div>
                            </div>
                            <div className="relative">
                              <Label className="text-[9px] font-black uppercase text-neutral-400 mr-4 mb-2 block">لە بەرواری</Label>
                              <Input 
                                type="date" 
                                value={dateFilter} 
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full h-14 px-8 rounded-2xl border border-neutral-100 bg-neutral-50 font-black text-right focus:bg-white shadow-sm"
                              />
                              <div className="absolute left-6 bottom-4 pointer-events-none text-neutral-300">
                                <Calendar size={18} />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Table Views */}
                  {activeTab !== 'settings' && (
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white border border-neutral-50">
                      <Table>

                    <TableHeader className="bg-neutral-50/50">
                      <TableRow className="hover:bg-transparent border-neutral-100">
                          {activeTab === 'posts' && (
                            <>
                              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">بەرگ</TableHead>
                              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">ناونیشان</TableHead>
                              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">نووسەر</TableHead>
                              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">هاوپۆل</TableHead>
                              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">بارودۆخ</TableHead>
                              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">بەروار</TableHead>
                            </>
                          )}
                            {activeTab === 'categories' && (
                              <>
                                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">ناو</TableHead>
                                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">هاوپۆلی باوان</TableHead>
                                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">ناسنامە (Slug)</TableHead>
                              </>
                            )}
                            {activeTab === 'tags' && (
                              <>
                                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">ناو</TableHead>
                                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">ناسنامە (Slug)</TableHead>
                              </>
                            )}
                            {activeTab === 'menu' && (
                              <>
                                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">ناو</TableHead>
                                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">مێنۆی باوان</TableHead>
                                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">جۆر</TableHead>
                                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">ڕیزبەندی</TableHead>
                              </>
                            )}
                            {activeTab === 'pages' && (
                            <>
                              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">ناو</TableHead>
                              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">ناونیشان</TableHead>
                              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">بارودۆخ</TableHead>
                            </>
                          )}
                          {activeTab === 'users' && (
                            <>
                              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">بەکارهێنەر</TableHead>
                              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">ئیمەیڵ</TableHead>
                              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">پلە</TableHead>
                              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">بارودۆخ</TableHead>
                            </>
                          )}
                          <TableHead className="text-right font-black uppercase text-[10px] tracking-widest p-6">کردارەکان</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                          {activeTab === 'posts' && posts.map((post) => (
                            <TableRow key={post.id} className="group border-neutral-50 hover:bg-neutral-50/30 transition-all">
                              <TableCell className="p-6 text-right">
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                                  {post.image_url ? <img src={post.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-3 text-neutral-300" />}
                                </div>
                              </TableCell>
                                <TableCell className="p-6 text-right font-bold text-neutral-800 text-base max-w-[200px] truncate" title={post.title}>{post.title}</TableCell>
                                <TableCell className="p-6 text-right font-bold text-neutral-500">{post.profiles?.full_name || 'بێ ناو'}</TableCell>
                                <TableCell className="p-6 text-right">
                                  <div className="flex flex-col gap-1 items-end">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full border border-blue-100 uppercase text-center">{post.category_name?.name || post.category}</span>
                                    {post.sub_category_name?.name && (
                                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 uppercase text-center">{post.sub_category_name.name}</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="p-6 text-right">
                                  <span className={`px-3 py-1 text-[10px] font-black rounded-full border uppercase ${
                                    post.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                    post.status === 'draft' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'
                                  }`}>
                                    {post.status === 'published' ? 'بڵاوکراوە' : post.status === 'draft' ? 'ڕەشنووس' : 'سڕاوە'}
                                  </span>
                                </TableCell>
                                <TableCell className="p-6 text-right text-neutral-400 font-medium text-xs">
                                  {new Date(post.created_at).toLocaleDateString('ku-IQ')}
                                </TableCell>
                                      <TableCell className="p-6 text-right">
                                        <div className="flex items-center justify-start gap-2">
    
                                        <Button 
                                          onClick={() => startEdit(post)} 
                                          className="w-10 h-10 p-0 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-100 transition-all shadow-sm"
                                          title="دەستکاری"
                                        >
                                          <Pencil size={16} />
                                        </Button>
                                        <Button 
                                          onClick={() => confirmDelete(post)} 
                                          className="w-10 h-10 p-0 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 transition-all shadow-sm"
                                          title="سڕینەوە"
                                        >
                                          <Trash2 size={16} />
                                        </Button>
                                      </div>
                                    </TableCell>

  
                          </TableRow>
                        ))}
    
                        {activeTab === 'categories' && categories.map((cat) => (
                          <TableRow key={cat.id} className="border-neutral-50 hover:bg-neutral-50/30">
                            <TableCell className="p-6 text-right font-bold text-neutral-800 text-base">{cat.name}</TableCell>
                            <TableCell className="p-6 text-right">
                               {cat.parent_id ? (
                                 <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-black rounded-full border border-purple-100">
                                   {categories.find(c => c.id === cat.parent_id)?.name}
                                 </span>
                               ) : <span className="text-neutral-300 text-xs">سەرەکی</span>}
                            </TableCell>
                            <TableCell className="p-6 text-right font-mono text-xs text-neutral-400 ltr">{cat.slug}</TableCell>
                                    <TableCell className="p-6 text-right">
                                      <div className="flex items-center justify-start gap-2">
    
                                      <Button 
                                        onClick={() => startEdit(cat)} 
                                        className="w-10 h-10 p-0 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-100 transition-all shadow-sm"
                                        title="دەستکاری"
                                      >
                                        <Pencil size={16} />
                                      </Button>
                                      <Button 
                                        onClick={() => confirmDelete(cat)} 
                                        className="w-10 h-10 p-0 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 transition-all shadow-sm"
                                        title="سڕینەوە"
                                      >
                                        <Trash2 size={16} />
                                      </Button>
                                    </div>
                                  </TableCell>

  
                          </TableRow>
                        ))}
    
                            {activeTab === 'tags' && tags.map((tag) => (
                              <TableRow key={tag.id} className="border-neutral-50 hover:bg-neutral-50/30">
                                <TableCell className="p-6 text-right font-bold text-neutral-800 text-base">{tag.name}</TableCell>
                                <TableCell className="p-6 text-right font-mono text-xs text-neutral-400 ltr">{tag.slug}</TableCell>
                                    <TableCell className="p-6 text-right">
                                      <div className="flex items-center justify-start gap-2">
    
                                      <Button 
                                        onClick={() => startEdit(tag)} 
                                        className="w-10 h-10 p-0 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-100 transition-all shadow-sm"
                                        title="دەستکاری"
                                      >
                                        <Pencil size={16} />
                                      </Button>
                                      <Button 
                                        onClick={() => confirmDelete(tag)} 
                                        className="w-10 h-10 p-0 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 transition-all shadow-sm"
                                        title="سڕینەوە"
                                      >
                                        <Trash2 size={16} />
                                      </Button>
                                    </div>
                                  </TableCell>

                              </TableRow>
                            ))}
      
                            {activeTab === 'menu' && dbMenuItems.map((item) => (
                              <TableRow key={item.id} className="border-neutral-50 hover:bg-neutral-50/30">
                                <TableCell className="p-6 text-right font-bold text-neutral-800 text-base">{item.label}</TableCell>
                                <TableCell className="p-6 text-right">
                                   {item.parent_id ? (
                                     <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black rounded-full border border-orange-100">
                                       {dbMenuItems.find(m => m.id === item.parent_id)?.label}
                                     </span>
                                   ) : <span className="text-neutral-300 text-xs">سەرەکی</span>}
                                </TableCell>
                                <TableCell className="p-6 text-right">
                                  <span className="px-3 py-1 bg-neutral-50 text-neutral-600 text-[10px] font-black rounded-full border border-neutral-100 uppercase">
                                    {item.type === 'page' ? 'لاپەڕە' : item.type === 'category' ? 'هاوپۆل' : 'بەستەر'}
                                  </span>
                                </TableCell>
                                <TableCell className="p-6 text-right font-bold text-neutral-400">{item.sort_order}</TableCell>
                                    <TableCell className="p-6 text-right">
                                      <div className="flex items-center justify-start gap-2">
    
                                      <Button 
                                        onClick={() => startEdit(item)} 
                                        className="w-10 h-10 p-0 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-100 transition-all shadow-sm"
                                        title="دەستکاری"
                                      >
                                        <Pencil size={16} />
                                      </Button>
                                      <Button 
                                        onClick={() => confirmDelete(item)} 
                                        className="w-10 h-10 p-0 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 transition-all shadow-sm"
                                        title="سڕینەوە"
                                      >
                                        <Trash2 size={16} />
                                      </Button>
                                    </div>
                                  </TableCell>

                              </TableRow>
                            ))}
      
                            {activeTab === 'pages' && pages.map((page) => (
                            <TableRow key={page.id} className="border-neutral-50 hover:bg-neutral-50/30">
                              <TableCell className="p-6 text-right font-mono text-xs text-neutral-400 ltr">/{page.slug}</TableCell>
                              <TableCell className="p-6 text-right font-bold text-neutral-800 text-base">{page.title}</TableCell>
                              <TableCell className="p-6 text-right">
                                <span className={`px-3 py-1 text-[10px] font-black rounded-full border uppercase ${
                                  page.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                  {page.status === 'published' ? 'بڵاوکراوە' : 'ڕەشنووس'}
                                </span>
                              </TableCell>
                                    <TableCell className="p-6 text-right">
                                      <div className="flex items-center justify-start gap-2">
    
                                      <Button 
                                        onClick={() => startEdit(page)} 
                                        className="w-10 h-10 p-0 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-100 transition-all shadow-sm"
                                        title="دەستکاری"
                                      >
                                        <Pencil size={16} />
                                      </Button>
                                      <Button 
                                        onClick={() => confirmDelete(page)} 
                                        className="w-10 h-10 p-0 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 transition-all shadow-sm"
                                        title="سڕینەوە"
                                      >
                                        <Trash2 size={16} />
                                      </Button>
                                    </div>
                                  </TableCell>

    
                            </TableRow>
                          ))}
      
                          {activeTab === 'users' && profiles.map((profile) => (
                            <TableRow key={profile.id} className="border-neutral-50 hover:bg-neutral-50/30">
                              <TableCell className="p-6 text-right">
                                <div className="flex items-center gap-4 justify-start">
                                  <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden">
                                     {profile.avatar_url ? (
                                        <img src={profile.avatar_url} className="w-full h-full object-cover" />
                                      ) : <User size={20} className="w-full h-full p-2 text-neutral-300" />}
                                  </div>
                                  <span className="font-bold text-neutral-800">{profile.full_name || 'بێ ناو'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="p-6 text-right font-medium text-neutral-400 ltr">{profile.email}</TableCell>
                              <TableCell className="p-6 text-right">
                                 <span className={`px-3 py-1 text-[10px] font-black rounded-full border uppercase ${
                                  profile.role === 'admin' ? 'bg-[#563a4a] text-white border-[#563a4a]' : 'bg-neutral-50 text-neutral-400 border-neutral-100'
                                }`}>
                                  {profile.role === 'admin' ? 'بەڕێوەبەر' : 'بەکارهێنەر'}
                                </span>
                              </TableCell>
                              <TableCell className="p-6 text-right">
                                <span className={`px-3 py-1 text-[10px] font-black rounded-full border uppercase ${
                                  profile.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                                }`}>
                                  {profile.status === 'active' ? 'چالاک' : 'ڕاگیراو'}
                                </span>
                              </TableCell>
                                    <TableCell className="p-6 text-right">
                                      <div className="flex items-center justify-start gap-2">
    
                                      <Button 
                                        onClick={() => startEdit(profile)} 
                                        className="w-10 h-10 p-0 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-100 transition-all shadow-sm"
                                        title="دەستکاری"
                                      >
                                        <Pencil size={16} />
                                      </Button>
                                      <Button 
                                        onClick={() => confirmDelete(profile)} 
                                        className="w-10 h-10 p-0 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 transition-all shadow-sm"
                                        title="سڕینەوە"
                                      >
                                        <Trash2 size={16} />
                                      </Button>
                                    </div>
                                  </TableCell>

  
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
  
                    {/* Pagination Footer */}
                    {totalCount > 0 && (
                      <div className="p-8 bg-neutral-50/30 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em]">
                          پیشاندانی {Math.min(currentPage * pageSize, totalCount)} لە {totalCount} بڕگە
                        </p>
                        <div className="flex items-center gap-3">
                          <Button 
                            disabled={currentPage === 1} 
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="rounded-2xl font-black h-12 px-8 gap-2 bg-[#563a4a] hover:bg-[#c29181] text-white shadow-lg shadow-[#563a4a]/20 transition-all disabled:opacity-30"
                          >
                            <ChevronLeft size={18} className="rotate-180" />
                            پێشوو
                          </Button>
                          <div className="flex items-center gap-2 bg-neutral-100/50 p-1.5 rounded-[1.25rem]">
                             {Array.from({ length: Math.ceil(totalCount / pageSize) }).map((_, i) => (
                               <Button
                                 key={i}
                                 variant={currentPage === i + 1 ? 'default' : 'ghost'}
                                 size="sm"
                                 onClick={() => setCurrentPage(i + 1)}
                                 className={`w-10 h-10 rounded-xl font-black transition-all ${
                                   currentPage === i + 1 
                                   ? 'bg-[#563a4a] text-white shadow-lg shadow-[#563a4a]/20' 
                                   : 'text-neutral-400 hover:text-[#563a4a] hover:bg-white'
                                 }`}
                               >
                                 {i + 1}
                               </Button>
                             ))}
                          </div>
                          <Button 
                            disabled={currentPage === Math.ceil(totalCount / pageSize)} 
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="rounded-2xl font-black h-12 px-8 gap-2 bg-[#563a4a] hover:bg-[#c29181] text-white shadow-lg shadow-[#563a4a]/20 transition-all disabled:opacity-30"
                          >
                            دواتر
                            <ChevronLeft size={18} />
                          </Button>
                        </div>
                      </div>
                    )}


                  {/* Empty State */}
                  {totalCount === 0 && !loading && (
                    <div className="py-32 text-center bg-white">
                      <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-200">
                        <Search size={32} />
                      </div>
                      <h3 className="text-xl font-black text-[#563a4a] mb-2">هیچ بڕگەیەک نەدۆزرایەوە</h3>
                      <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">بۆ زیادکردن کلیک لە دوگمەی 'زیادکردنی نوێ' بکە</p>
                    </div>
                  )}
                </Card>
              )}

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
                <div className={`h-3 w-full ${activeTab === 'posts' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                <CardHeader className="p-12 border-b border-neutral-50 flex flex-row items-center justify-between bg-neutral-50/20">
                   <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${editingId ? 'bg-amber-500 text-white' : 'bg-[#563a4a] text-white'}`}>
                        {editingId ? <Edit3 size={28} /> : <PlusCircle size={28} />}
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-black text-[#1a1a1e]">
                          {editingId ? `دەستکاریکردنی ${activeTab === 'posts' ? 'بابەت' : 'هاوپۆل'}` : `زیادکردنی ${activeTab === 'posts' ? 'بابەت' : 'هاوپۆل'}ی نوێ`}
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

                                  <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-4">
                                      <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-[0.2em] mr-4">هاوپۆلی سەرەکی</Label>
                                      <div className="relative">
                                        <select 
                                          value={formData.category_id} 
                                          onChange={(e) => setFormData((p: any) => ({...p, category_id: e.target.value}))} 
                                          required
                                          className="w-full h-16 px-8 rounded-[1.5rem] border border-neutral-100 bg-neutral-50/50 outline-none transition-all font-black text-right appearance-none cursor-pointer focus:bg-white shadow-sm"
                                        >
                                          <option value="">هەڵبژێرە</option>
                                          {categories.filter(c => !c.parent_id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300">
                                          <Layers size={18} />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-[0.2em] mr-4">هاوپۆلی لاوەکی (Sub Cat)</Label>
                                      <div className="relative">
                                        <select 
                                          value={formData.sub_category_id} 
                                          onChange={(e) => setFormData((p: any) => ({...p, sub_category_id: e.target.value}))} 
                                          className="w-full h-16 px-8 rounded-[1.5rem] border border-neutral-100 bg-neutral-50/50 outline-none transition-all font-black text-right appearance-none cursor-pointer focus:bg-white shadow-sm"
                                        >
                                          <option value="">نییە</option>
                                          {categories.filter(c => c.parent_id === formData.category_id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300">
                                          <PlusCircle size={18} />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-[0.2em] mr-4">بارودۆخی بابەت</Label>
                                      <div className="relative">
                                        <select 
                                          value={formData.status} 
                                          onChange={(e) => setFormData((p: any) => ({...p, status: e.target.value}))} 
                                          className="w-full h-16 px-8 rounded-[1.5rem] border border-neutral-100 bg-neutral-50/50 outline-none transition-all font-black text-right appearance-none cursor-pointer focus:bg-white shadow-sm"
                                        >
                                          <option value="published">بڵاوکراوە</option>
                                          <option value="draft">ڕەشنووس</option>
                                          <option value="deleted">سڕاوە</option>
                                        </select>
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300">
                                          <Clock size={18} />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                               </div>
                            </div>

                            <div className="space-y-4">
                              <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-[0.2em] mr-4">تاگەکان</Label>
                              <div className="flex flex-wrap gap-3 bg-neutral-50 p-6 rounded-3xl border border-neutral-100 shadow-inner">
                                {tags.map(tag => (
                                  <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => {
                                      const selected = formData.selectedTags.includes(tag.id);
                                      setFormData((p: any) => ({
                                        ...p,
                                        selectedTags: selected 
                                          ? p.selectedTags.filter((id: string) => id !== tag.id)
                                          : [...p.selectedTags, tag.id]
                                      }));
                                    }}
                                    className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all border ${
                                      formData.selectedTags.includes(tag.id)
                                      ? 'bg-blue-500 text-white border-blue-600 shadow-md scale-105'
                                      : 'bg-white text-neutral-400 border-neutral-100 hover:border-blue-200'
                                    }`}
                                  >
                                    {tag.name}
                                  </button>
                                ))}
                                {tags.length === 0 && <p className="text-xs text-neutral-400 font-bold">هیچ تاگێک بوونی نییە. سەرەتا لە بەشی تاگەکان دروستی بکە.</p>}
                              </div>
                            </div>
    
                            <div className="space-y-6">
                               <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-[0.2em] mr-4">ناوەرۆکی بابەت</Label>
                               
                               <div className="bg-neutral-50 rounded-[3rem] p-1 border border-neutral-100 shadow-inner">
                                  <TiptapEditor 
                                    content={formData.content} 
                                    onChange={(content) => setFormData((p: any) => ({...p, content}))} 
                                    placeholder="لێرە دەست بکە بە نووسینی ناوەرۆکی بابەتەکە بە زمانی کوردی..." 
                                  />
                               </div>
                            </div>
                          </>
                        )}

                        {/* Category Form */}
                        {activeTab === 'categories' && (
                          <div className="space-y-10">
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
                            <div className="space-y-4">
                              <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">هاوپۆلی باوان (بۆ هاوپۆلی لاوەکی)</Label>
                              <div className="relative">
                                <select 
                                  value={formData.parent_id} 
                                  onChange={(e) => setFormData((p: any) => ({...p, parent_id: e.target.value}))} 
                                  className="w-full h-16 px-8 rounded-2xl border border-neutral-100 bg-neutral-50 font-black text-right appearance-none cursor-pointer focus:bg-white shadow-sm"
                                >
                                  <option value="">سەرەکی (هیچ)</option>
                                  {categories.filter(c => !c.parent_id && c.id !== editingId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300">
                                  <Layers size={18} />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tag Form */}
                        {activeTab === 'tags' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                              <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">ناوی تاگ</Label>
                              <Input value={formData.name} onChange={(e) => setFormData((p: any) => ({...p, name: e.target.value}))} required className="rounded-2xl h-16 border-neutral-100 bg-neutral-50 px-8 text-xl font-black shadow-sm" placeholder="بۆ نموونە: تەکنەلۆژیا" />
                            </div>
                            <div className="space-y-4">
                              <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">ناسنامە (Slug)</Label>
                              <Input value={formData.slug} onChange={(e) => setFormData((p: any) => ({...p, slug: e.target.value}))} required className="rounded-2xl h-16 border-neutral-100 bg-neutral-50 px-8 font-bold ltr shadow-sm" placeholder="technology" />
                            </div>
                          </div>
                        )}

                        {/* Menu Form */}
                        {activeTab === 'menu' && (
                          <div className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                              <div className="space-y-4">
                                <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">ناوی مێنۆ</Label>
                                <Input value={formData.menuLabel} onChange={(e) => setFormData((p: any) => ({...p, menuLabel: e.target.value}))} required className="rounded-2xl h-16 border-neutral-100 bg-neutral-50 px-8 text-xl font-black shadow-sm" />
                              </div>
                              <div className="space-y-4">
                                <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">ڕیزبەندی</Label>
                                <Input type="number" value={formData.menuSortOrder} onChange={(e) => setFormData((p: any) => ({...p, menuSortOrder: parseInt(e.target.value)}))} required className="rounded-2xl h-16 border-neutral-100 bg-neutral-50 px-8 font-bold shadow-sm" />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                              <div className="space-y-4">
                                <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">جۆری بەستەر</Label>
                                <select 
                                  value={formData.menuType} 
                                  onChange={(e) => setFormData((p: any) => ({...p, menuType: e.target.value, menuTargetId: '', menuUrl: ''}))}
                                  className="w-full h-16 px-8 rounded-2xl border border-neutral-100 bg-neutral-50 font-black text-right appearance-none cursor-pointer focus:bg-white shadow-sm"
                                >
                                  <option value="page">لاپەڕە</option>
                                  <option value="category">هاوپۆل</option>
                                  <option value="custom">بەستەری دەرەکی</option>
                                </select>
                              </div>
                              <div className="space-y-4">
                                <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">مێنۆی باوان (بۆ مێنۆی لاوەکی)</Label>
                                <select 
                                  value={formData.menuParentId} 
                                  onChange={(e) => setFormData((p: any) => ({...p, menuParentId: e.target.value}))} 
                                  className="w-full h-16 px-8 rounded-2xl border border-neutral-100 bg-neutral-50 font-black text-right appearance-none cursor-pointer focus:bg-white shadow-sm"
                                >
                                  <option value="">سەرەکی (هیچ)</option>
                                  {dbMenuItems.filter(m => !m.parent_id && m.id !== editingId).map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                                </select>
                              </div>
                              <div className="space-y-4">
                                {formData.menuType === 'custom' ? (
                                  <>
                                    <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">بەستەر (URL)</Label>
                                    <Input value={formData.menuUrl} onChange={(e) => setFormData((p: any) => ({...p, menuUrl: e.target.value}))} required className="rounded-2xl h-16 border-neutral-100 bg-neutral-50 px-8 font-bold ltr shadow-sm" placeholder="https://..." />
                                  </>
                                ) : (
                                  <>
                                    <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">هەڵبژاردنی ئامانج</Label>
                                    <select 
                                      value={formData.menuTargetId} 
                                      onChange={(e) => setFormData((p: any) => ({...p, menuTargetId: e.target.value}))}
                                      required
                                      className="w-full h-16 px-8 rounded-2xl border border-neutral-100 bg-neutral-50 font-black text-right appearance-none cursor-pointer focus:bg-white shadow-sm"
                                    >
                                      <option value="">هەڵبژێرە</option>
                                      {formData.menuType === 'page' ? (
                                        pages.map(page => <option key={page.id} value={page.id}>{page.title}</option>)
                                      ) : (
                                        categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)
                                      )}
                                    </select>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
    
                        {/* Page Form */}
                        {activeTab === 'pages' && (
                          <div className="space-y-10">
                             <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                <div className="md:col-span-8 space-y-4">
                                  <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">ناونیشانی لاپەڕە</Label>
                                  <Input value={formData.title} onChange={(e) => setFormData((p: any) => ({...p, title: e.target.value}))} required className="rounded-2xl h-20 border-neutral-100 bg-neutral-50 text-right font-black text-2xl px-10 shadow-sm" />
                                </div>
                                  <div className="md:col-span-4 space-y-4">
                                    <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">ناسنامە (Slug)</Label>
                                    <Input value={formData.slug} onChange={(e) => setFormData((p: any) => ({...p, slug: e.target.value}))} required className="rounded-2xl h-20 border-neutral-100 bg-neutral-50 px-8 font-bold ltr shadow-sm" placeholder="about-us" />
                                  </div>
                                  <div className="md:col-span-4 space-y-4">
                                    <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">بارودۆخ</Label>

                                  <select 
                                    value={formData.status} 
                                    onChange={(e) => setFormData((p: any) => ({...p, status: e.target.value}))} 
                                    className="w-full h-20 px-8 rounded-2xl border border-neutral-100 bg-neutral-50 font-black text-right appearance-none cursor-pointer focus:bg-white shadow-sm"
                                  >
                                    <option value="published">بڵاوکراوە</option>
                                    <option value="draft">ڕەشنووس</option>
                                  </select>
                                </div>
                             </div>
    
                              {/* Page Image Upload */}
                              <div className="space-y-4">
                                <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">وێنەی لاپەڕە</Label>
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
                                   <div className="bg-neutral-50 rounded-[3rem] p-1 border border-neutral-100 shadow-inner">
                                      <TiptapEditor 
                                        content={formData.content} 
                                        onChange={(content) => setFormData((p: any) => ({...p, content}))} 
                                        placeholder="ناوەرۆکی لاپەڕە..." 
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
                                {!editingId && (
                                  <>
                                    <div className="space-y-4">
                                       <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">ئیمەیڵ</Label>
                                       <div className="relative">
                                         <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                         <Input type="email" value={formData.userEmail} onChange={(e) => setFormData((p: any) => ({...p, userEmail: e.target.value}))} required className="rounded-2xl h-16 border-neutral-100 bg-neutral-50 pr-12 pl-8 text-xl font-black shadow-sm ltr" placeholder="user@example.com" />
                                       </div>
                                    </div>
                                    <div className="space-y-4">
                                       <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">وشەی تێپەڕ</Label>
                                       <div className="relative">
                                         <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                         <Input type="password" value={formData.userPassword} onChange={(e) => setFormData((p: any) => ({...p, userPassword: e.target.value}))} required className="rounded-2xl h-16 border-neutral-100 bg-neutral-50 pr-12 pl-8 text-xl font-black shadow-sm ltr" placeholder="••••••••" />
                                       </div>
                                    </div>
                                  </>
                                )}
                                <div className="space-y-4">
                                   <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">ناوی تەواو</Label>
                                   <Input value={formData.full_name} onChange={(e) => setFormData((p: any) => ({...p, full_name: e.target.value}))} className="rounded-2xl h-16 border-neutral-100 bg-neutral-50 px-8 text-xl font-black shadow-sm" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                  <div className="space-y-4">
                                    <Label className="font-black text-neutral-500 text-[10px] uppercase tracking-widest mr-4">بارودۆخ</Label>
                                    <div className="relative">
                                        <select 
                                          value={formData.status} 
                                          onChange={(e) => setFormData((p: any) => ({...p, status: e.target.value}))} 
                                          className="w-full h-16 px-8 rounded-2xl border border-neutral-100 bg-neutral-50 font-black text-right appearance-none cursor-pointer focus:bg-white shadow-sm"
                                        >
                                          <option value="active">چالاک</option>
                                          <option value="suspended">ڕاگیراو</option>
                                        </select>
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300">
                                          <Clock size={20} />
                                        </div>
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem] p-10 border-none shadow-2xl bg-white max-w-md">
          <AlertDialogHeader className="text-right space-y-4">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-4 shadow-inner">
              <Trash2 size={40} />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-slate-800 text-center">ئایا دڵنیایت لە سڕینەوە؟</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-bold text-center leading-relaxed">
              ئەم کرداری سڕینەوەیە ناتوانرێت بگەڕێندرێتەوە و هەموو زانیارییەکانی ئەم بڕگەیە بە هەمیشەیی دەسڕدرێتەوە.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-4 mt-8">
            <AlertDialogAction 
              onClick={handleDelete}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white h-14 rounded-2xl font-black transition-all shadow-lg shadow-red-500/20"
            >
              بەڵێ، بیسڕەوە
            </AlertDialogAction>
            <AlertDialogCancel className="flex-1 border-slate-100 bg-slate-50 text-slate-400 h-14 rounded-2xl font-black hover:bg-slate-100 transition-all">
              پاشگەزبوونەوە
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

"use client";

import React, { useEffect, useState } from 'react';
import Header from "@/components/sections/Header";
import MainNavigation from "@/components/sections/MainNavigation";
import Footer from "@/components/sections/Footer";
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, ChevronLeft } from 'lucide-react';
import Image from 'next/image';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [actRes, setRes] = await Promise.all([
        supabase.from('activities').select('*').order('date', { ascending: false }),
        supabase.from('site_settings').select('*').eq('id', 1).single()
      ]);
      
      if (!actRes.error) setActivities(actRes.data || []);
      if (!setRes.error) setSettings(setRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header settings={settings} />
      <MainNavigation />
      
      <main className="container mx-auto py-16 px-4">
        <div className="text-right mb-12">
          <h1 className="text-4xl font-black text-[#563a4a] mb-4">چالاکییەکانمان</h1>
          <p className="text-lg text-gray-500 max-w-2xl ml-auto">
            ئێمە لە ڕێكخراوی كوردی چوار بەردەوامین لە ئەنجامدانی چالاکی جۆراوجۆر بۆ خزمەتی زانست و پەروەردە.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#563a4a]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.length > 0 ? activities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                <div className="relative h-64 overflow-hidden">
                  <Image 
                    src={activity.image_url || 'https://images.unsplash.com/photo-1523050853023-8c2d27443ef8'} 
                    alt={activity.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-[#563a4a] font-bold shadow-sm">
                    {new Date(activity.date).toLocaleDateString('ku-IQ')}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 text-[#c29181] mb-3 font-semibold">
                    <MapPin size={18} />
                    <span>{activity.location}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#563a4a] mb-4 group-hover:text-[#c29181] transition-colors">{activity.title}</h3>
                  <p className="text-gray-500 mb-6 leading-relaxed line-clamp-3">
                    {activity.description}
                  </p>
                  <button className="flex items-center gap-2 text-[#563a4a] font-bold hover:gap-4 transition-all">
                    بۆ زانیاری زیاتر
                    <ChevronLeft size={20} />
                  </button>
                </div>
              </div>
            )) : (
              // Dummy Data if empty
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 opacity-60">
                  <div className="h-64 bg-gray-200 animate-pulse"></div>
                  <div className="p-8 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

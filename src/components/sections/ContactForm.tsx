'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, { message: 'تکایە ناوەکەت بنووسە' }),
  email: z.string().email({ message: 'ئیمەیڵەکەت دروست نییە' }),
  subject: z.string().min(3, { message: 'تکایە بابەتەکە بنووسە' }),
  message: z.string().min(10, { message: 'تکایە نامەکەت بنووسە (کەمتر نەبێت لە ١٠ پیت)' }),
});

type FormData = z.infer<typeof formSchema>;

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('کێشەیەک ڕوویدا لە کاتی ناردنی نامەکە');
      }

      setIsSuccess(true);
      toast.success('نامەکەت بە سەرکەوتوویی نێردرا');
      reset();
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      toast.error('کێشەیەک ڕوویدا، تکایە دواتر هەوڵ بدەرەوە');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black">نامەکەت نێردرا!</h3>
          <p className="text-white/60">سوپاس بۆ پەیوەندیکردنت. لە نزیکترین کاتدا وەڵامت دەدەینەوە.</p>
        </div>
        <button
          onClick={() => setIsSuccess(false)}
          className="text-[#c29181] hover:text-white font-bold transition-colors"
        >
          ناردنی نامەیەکی تر
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-white/60 mr-2">ناو</label>
          <input
            {...register('name')}
            className={`w-full bg-white/5 border ${
              errors.name ? 'border-red-500' : 'border-white/10'
            } rounded-2xl px-6 py-4 outline-none focus:border-[#c29181] transition-all text-white`}
            placeholder="ناوەکەت لێرە بنووسە..."
          />
          {errors.name && <p className="text-red-400 text-xs mr-2">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-white/60 mr-2">ئیمەیڵ</label>
          <input
            {...register('email')}
            className={`w-full bg-white/5 border ${
              errors.email ? 'border-red-500' : 'border-white/10'
            } rounded-2xl px-6 py-4 outline-none focus:border-[#c29181] transition-all text-white`}
            placeholder="email@example.com"
          />
          {errors.email && <p className="text-red-400 text-xs mr-2">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-white/60 mr-2">بابەت</label>
        <input
          {...register('subject')}
          className={`w-full bg-white/5 border ${
            errors.subject ? 'border-red-500' : 'border-white/10'
          } rounded-2xl px-6 py-4 outline-none focus:border-[#c29181] transition-all text-white`}
          placeholder="بابەتی نامەکە..."
        />
        {errors.subject && <p className="text-red-400 text-xs mr-2">{errors.subject.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-white/60 mr-2">نامە</label>
        <textarea
          {...register('message')}
          rows={5}
          className={`w-full bg-white/5 border ${
            errors.message ? 'border-red-500' : 'border-white/10'
          } rounded-2xl px-6 py-4 outline-none focus:border-[#c29181] transition-all text-white resize-none`}
          placeholder="نامەکەت لێرە بنووسە..."
        />
        {errors.message && <p className="text-red-400 text-xs mr-2">{errors.message.message}</p>}
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#c29181] hover:bg-white hover:text-[#563a4a] text-white px-10 py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              خەریکی ناردنە... <Loader2 className="animate-spin" size={20} />
            </>
          ) : (
            <>
              نامە بنێرە <Send size={20} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { getSiteSettings } from "@/lib/settings";
import { trackVisitAction } from "@/lib/actions";

export const metadata: Metadata = {
  title: "رێكخراوی كوردی چوار بۆ زانست و پەروەردە",
  description: "دەزگای ڕووناکی بۆ زانست و پەروەردە",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  
  // Track site visit
  try {
    await trackVisitAction();
  } catch (e) {
    console.error("Failed to track visit:", e);
  }
  
    // Only show Kurdish if English is not available
    const isKurdishOnly = !settings?.available_languages?.includes('en');
    const lang = isKurdishOnly ? 'ku' : 'en';
    const dir = lang === 'ku' ? 'rtl' : 'ltr';

    return (
      <html lang={lang} dir={dir}>
        <head>
          {settings?.logo_url && (
            <>
              <link rel="icon" href={settings.logo_url} type="image/png" />
              <link rel="apple-touch-icon" href={settings.logo_url} />
            </>
          )}
          <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary: ${settings?.primary_color || '#563a4a'};
            --secondary: ${settings?.secondary_color || '#c29181'};
            --accent: ${settings?.accent_color || '#f0ecee'};
          }
          #theme-header h1, #theme-header p, #theme-header a, #theme-header input {
            color: ${settings?.primary_color || '#563a4a'} !important;
          }
          #theme-header .border-l-4 {
            border-color: ${settings?.primary_color || '#563a4a'} !important;
          }
          button, .bg-\\[\\#563a4a\\] {
            background-color: ${settings?.primary_color || '#563a4a'} !important;
          }
          .text-\\[\\#563a4a\\] {
            color: ${settings?.primary_color || '#563a4a'} !important;
          }
          .border-\\[\\#563a4a\\] {
            border-color: ${settings?.primary_color || '#563a4a'} !important;
          }
          .bg-\\[\\#fdf8f6\\], .bg-\\[\\#f0ecee\\] {
            background-color: ${settings?.accent_color || '#f0ecee'} !important;
          }
        `}} />
      </head>
      <body className="antialiased">
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="988add51-608a-4a7f-84e3-7b9ad52c69e0"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        {children}
        <Toaster position="top-center" />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}

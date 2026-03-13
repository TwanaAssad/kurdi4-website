import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { getSiteSettings } from "@/lib/settings";
import { trackVisitAction } from "@/lib/actions";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings?.org_name || "رێكخراوی كوردی چوار بۆ زانست و پەروەردە";
  const description = settings?.footer_description || settings?.org_name || "رێكخراوی كوردی چوار بۆ زانست و پەروەردە";
  const logoUrl = settings?.logo_url;
  return {
    title,
    description,
    icons: logoUrl
      ? { icon: logoUrl, apple: logoUrl, shortcut: logoUrl }
      : undefined,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings] = await Promise.allSettled([getSiteSettings()]).then(r => r.map(x => x.status === 'fulfilled' ? x.value : null));
  
  // Track site visit (non-blocking, fire and forget)
  trackVisitAction().catch(() => {});
  
    // Only show Kurdish if English is not available
    const isKurdishOnly = !settings?.available_languages?.includes('en');
    const lang = isKurdishOnly ? 'ku' : 'en';
    const dir = lang === 'ku' ? 'rtl' : 'ltr';

  // Convert render URL to raw object URL (strips query params browsers reject for favicons)
  const faviconUrl = settings?.logo_url
    ? settings.logo_url
        .replace('/render/image/public/', '/object/public/')
        .split('?')[0]
    : null;

  return (
    <html lang={lang} dir={dir}>
      <head>
        {faviconUrl && (
          <>
            <link rel="icon" type="image/webp" href={faviconUrl} />
            <link rel="shortcut icon" href={faviconUrl} />
            <link rel="apple-touch-icon" href={faviconUrl} />
          </>
        )}
          <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary: ${settings?.primary_color || '#563a4a'};
            --secondary: ${settings?.secondary_color || '#c29181'};
            --accent: ${settings?.accent_color || '#f0ecee'};
            --color-primary: ${settings?.primary_color || '#563a4a'};
            --color-accent: ${settings?.secondary_color || '#c29181'};
            --color-chart-1: ${settings?.primary_color || '#563a4a'};
            --color-chart-2: ${settings?.secondary_color || '#c29181'};
            --color-ring: ${settings?.primary_color || '#563a4a'};
            --color-sidebar-primary: ${settings?.primary_color || '#563a4a'};
            --color-sidebar-accent-foreground: ${settings?.secondary_color || '#c29181'};
            --color-sidebar-ring: ${settings?.primary_color || '#563a4a'};
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
          .bg-\\[\\#c29181\\] {
            background-color: ${settings?.secondary_color || '#c29181'} !important;
          }
          .text-\\[\\#c29181\\] {
            color: ${settings?.secondary_color || '#c29181'} !important;
          }
          .border-\\[\\#c29181\\] {
            border-color: ${settings?.secondary_color || '#c29181'} !important;
          }
          .hover\\:bg-\\[\\#c29181\\]:hover {
            background-color: ${settings?.secondary_color || '#c29181'} !important;
          }
          .hover\\:text-\\[\\#c29181\\]:hover {
            color: ${settings?.secondary_color || '#c29181'} !important;
          }
          .shadow-\\[\\#c29181\\], .shadow-\\[\\#c29181\\]\\/20 {
            --tw-shadow-color: ${settings?.secondary_color || '#c29181'} !important;
          }
          .bg-\\[\\#c29181\\]\\/10, .bg-\\[\\#c29181\\]\\/20 {
            background-color: ${settings?.secondary_color || '#c29181'}33 !important;
          }
          .focus\\:ring-\\[\\#c29181\\]\\/20:focus {
            --tw-ring-color: ${settings?.secondary_color || '#c29181'}33 !important;
          }
          .stop-color-\\[\\#c29181\\] {
            stop-color: ${settings?.secondary_color || '#c29181'} !important;
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

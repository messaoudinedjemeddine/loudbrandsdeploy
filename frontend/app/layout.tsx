import './globals.css';
import type { Metadata } from 'next';
import { Inter, Noto_Sans_Arabic } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { RTLProvider } from '@/components/rtl-provider';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { ServiceWorkerRegister } from '@/components/service-worker-register';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { PWAStatus } from '@/components/pwa-status';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const notoSansArabic = Noto_Sans_Arabic({ 
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'LOUD BRANDS - Traditional Modern Fashion',
  description: 'Discover our exquisite collection of traditional Algerian fashion designed for the modern woman. Free delivery across Algeria.',
  keywords: 'Algerian fashion, traditional clothing, modern fashion, women clothing, Algeria, traditional dress',
  authors: [{ name: 'LOUD BRANDS' }],
  creator: 'LOUD BRANDS',
  publisher: 'LOUD BRANDS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://algerian-elegance.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'LOUD BRANDS - Traditional Modern Fashion',
    description: 'Discover our exquisite collection of traditional Algerian fashion designed for the modern woman.',
    url: 'https://algerian-elegance.com',
    siteName: 'LOUD BRANDS',
    images: [
      {
        url: '/logos/logo-light.png',
        width: 1200,
        height: 630,
        alt: 'LOUD BRANDS Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LOUD BRANDS - Traditional Modern Fashion',
    description: 'Discover our exquisite collection of traditional Algerian fashion designed for the modern woman.',
    images: ['/logos/logo-light.png'],
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/icon-192x192.png'],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icon-512x512.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LOUD BRANDS" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#C4A47C" />
      </head>
      <body 
        className={`${inter.variable} ${notoSansArabic.variable} font-sans`} 
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <RTLProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <Toaster />
            <PWAInstallPrompt />
            <PWAStatus />
          </RTLProvider>
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
);

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: 'IP Verse AI — 互動式 AI 合照體驗',
  description:
    '與虛擬 IP 角色一起拍攝 AI 合照，留下專屬於活動現場的互動影像。',
  keywords: ['AI 合照', 'IP 互動', '虛擬角色', 'AI 攝影'],
  openGraph: {
    title: 'IP Verse AI — 互動式 AI 合照體驗',
    description:
      '與虛擬 IP 角色一起拍攝 AI 合照，留下專屬於活動現場的互動影像。',
    url: '/',
    siteName: 'IP Verse AI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'IP Verse AI 互動式 AI 合照體驗',
      },
    ],
    locale: 'zh_TW',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IP Verse AI — 互動式 AI 合照體驗',
    description:
      '與虛擬 IP 角色一起拍攝 AI 合照，留下專屬於活動現場的互動影像。',
    images: ['/og-image.jpg'],
  },
  robots: 'noindex, nofollow', // MVP 階段不索引
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased bg-gradient-animated min-h-screen">
        {children}
      </body>
    </html>
  );
}

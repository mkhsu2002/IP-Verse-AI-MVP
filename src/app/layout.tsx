import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

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
  title: 'IP Verse AI — 互動式 AI 合照體驗',
  description:
    '與虛擬 IP 角色一起拍攝 AI 合照！選擇你喜歡的場景，由 AI 為你創作獨一無二的合照。',
  keywords: ['AI 合照', 'IP 互動', '虛擬角色', 'AI 攝影'],
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

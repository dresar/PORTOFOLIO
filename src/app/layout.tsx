import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import '@/lib/fontawesome';
import './globals.css';

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Muhammad Fauzan Al Hafizh | Full-Stack Software Engineer',
  description:
    'Website Portofolio Profesional & Showcase Karya Rekayasa Perangkat Lunak Muhammad Fauzan Al Hafizh.',
  keywords: [
    'Muhammad Fauzan Al Hafizh',
    'Fauzan Al Hafizh',
    'Software Engineer',
    'Full-Stack Developer',
    'Next.js Portfolio',
    'PostgreSQL',
    'React',
    'TypeScript',
  ],
  authors: [{ name: 'Muhammad Fauzan Al Hafizh' }],
  openGraph: {
    title: 'Muhammad Fauzan Al Hafizh | Full-Stack Software Engineer',
    description:
      'Website Portofolio Profesional & Showcase Karya Rekayasa Perangkat Lunak Muhammad Fauzan Al Hafizh.',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${sansFont.variable} ${monoFont.variable} dark h-full`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}

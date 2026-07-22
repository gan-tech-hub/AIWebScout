import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Web Scout',
  description: '閲覧中のWebページを、次の意思決定につながるインサイトへ。',
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

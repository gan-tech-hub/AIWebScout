import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Web Scout',
  description: 'Watch web content become actionable insight.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

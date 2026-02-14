import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Community Bot | Kira',
  description: 'Community engagement tracking and rewards',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white">{children}</body>
    </html>
  );
}

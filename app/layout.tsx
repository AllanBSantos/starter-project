import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Auto Quality System',
  description: 'Sistema de qualidade automatizada para plataforma de ensino',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

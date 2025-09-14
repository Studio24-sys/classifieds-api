import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import ClientAuthButtons from '@/components/ClientAuthButtons';

export const metadata: Metadata = {
  title: 'Clasificados',
  description: 'MVP Clasificados',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
            <nav className="flex items-center gap-4">
              <Link href="/" className="font-semibold">Clasificados</Link>
              <Link href="/new-post" className="text-sm underline">Nuevo</Link>
              <Link href="/mis-anuncios" className="text-sm underline">Mis anuncios</Link>
            </nav>
            <ClientAuthButtons />
          </div>
        </header>
        <main className="mx-auto max-w-5xl p-4">{children}</main>
      </body>
    </html>
  );
}

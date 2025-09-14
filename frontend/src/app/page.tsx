import Link from 'next/link';
import { fetchPosts } from '@/lib/api';

function formatPYG(value?: number) {
  if (!value && value !== 0) return '';
  try {
    return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(value);
  } catch {
    return `₲ ${value.toLocaleString('es-PY')}`;
  }
}

export default async function Page() {
  const data = await fetchPosts(1, 20);
  const posts = Array.isArray(data?.items) ? data.items : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Publicaciones</h1>
        <Link href="/new-post" className="rounded bg-black px-3 py-2 text-white">+ Nuevo</Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-600">No hay anuncios aún.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((p: any) => {
            const wa = p.contactWhatsapp ? `https://wa.me/${p.contactWhatsapp}?text=${encodeURIComponent('Hola, vi tu anuncio en el sitio.')}` : null;
            return (
              <li key={p.id} className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  {typeof p.pricePyg === 'number' && (
                    <span className="text-sm font-medium text-green-700">{formatPYG(p.pricePyg)}</span>
                  )}
                </div>
                {p.barrio && <p className="text-sm text-gray-600">Barrio: {p.barrio}</p>}
                <p className="mt-2 text-gray-800">{p.content}</p>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <span>por {p.author?.email ?? 'usuario'}</span>
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded bg-emerald-600 px-3 py-1 text-white"
                    >
                      Chatear por WhatsApp
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { createPost, fetchMe } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function NewPostPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<any>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [barrio, setBarrio] = useState('');
  const [pricePyg, setPricePyg] = useState<string>('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');

  useEffect(() => {
    (async () => {
      const user = await fetchMe();
      setMe(user);
      setReady(true);
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!me) {
      alert('Inicia sesión primero.');
      return;
    }
    const body = {
      title: title.trim(),
      content: content.trim(),
      barrio: barrio.trim() || undefined,
      pricePyg: pricePyg ? Number(pricePyg) : undefined,
      contactWhatsapp: contactWhatsapp.trim() || undefined,
    };
    await createPost(body);
    router.push('/');
  }

  if (!ready) return <p>Cargando…</p>;
  if (!me) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Crear Nuevo Anuncio</h1>
        <p className="text-red-600">⚠️ Debes iniciar sesión primero.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">Crear Nuevo Anuncio</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Depto en Villa Morra"
            className="w-full rounded border p-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Contenido</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Detalles del anuncio…"
            className="w-full rounded border p-2"
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Barrio</label>
            <input
              value={barrio}
              onChange={(e) => setBarrio(e.target.value)}
              placeholder="Ej: Villa Morra"
              className="w-full rounded border p-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Precio (₲)</label>
            <input
              value={pricePyg}
              onChange={(e) => setPricePyg(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="1500000"
              inputMode="numeric"
              className="w-full rounded border p-2"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">WhatsApp</label>
          <input
            value={contactWhatsapp}
            onChange={(e) => setContactWhatsapp(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="595971234567"
            inputMode="numeric"
            className="w-full rounded border p-2"
          />
          <p className="mt-1 text-xs text-gray-500">Solo números, con código país (sin +).</p>
        </div>

        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Publicar
        </button>
      </form>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Post = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  author?: { id: string; email: string };
};

type Paged = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: Post[];
};

export default function MyPostsPage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<{ id: string; email: string } | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setLoading(false);
      return;
    }

    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    (async () => {
      try {
        // 1) Who am I?
        const meRes = await fetch(`${API}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!meRes.ok) {
          throw new Error('No se pudo verificar la sesión');
        }
        const meJson = await meRes.json();
        setMe(meJson);

        // 2) Get all posts, then filter mine client-side
        const postsRes = await fetch(`${API}/api/posts`);
        if (!postsRes.ok) throw new Error('No se pudieron cargar los anuncios');
        const postsJson: Paged = await postsRes.json();

        const mine = postsJson.items.filter((p) => p.authorId === meJson.id);
        setPosts(mine);
      } catch (e: any) {
        setError(e.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Cargando…</p>;

  // Not logged in
  if (!me) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Mis anuncios</h1>
          <Link href="/new-post" className="rounded bg-black px-3 py-2 text-white">
            + Nuevo
          </Link>
        </div>
        <p>Debes iniciar sesión para ver tus anuncios.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mis anuncios</h1>
        <Link href="/new-post" className="rounded bg-black px-3 py-2 text-white">
          + Nuevo
        </Link>
      </div>

      {error && <p className="text-red-600">Error: {error}</p>}

      {posts.length === 0 ? (
        <p>No tienes anuncios todavía. <Link href="/new-post" className="underline">Publica el primero</Link>.</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.id} className="rounded border bg-white p-4 shadow-sm">
              <h3 className="font-medium">{p.title}</h3>
              <p className="text-sm text-gray-700">{p.content}</p>
              <p className="mt-1 text-xs text-gray-500">
                Publicado: {new Date(p.createdAt).toLocaleString('es-PY')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

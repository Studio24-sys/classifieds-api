'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function LoginPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('Studio54!: )'); // with the space
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }

      const data = (await res.json()) as { token: string };
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', email);

      // Notify header (and any listeners) immediately
      window.dispatchEvent(new Event('auth:changed'));

      // Go to create form (or home)
      location.href = '/new-post';
    } catch (e: any) {
      setErr('BAD_CREDENTIALS or network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">Iniciar Sesión</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">Correo</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Contraseña</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>

        <p className="text-xs text-gray-500 mt-2">
          Usuario demo: test@example.com (usa tu contraseña actual).
        </p>
      </form>
    </div>
  );
}

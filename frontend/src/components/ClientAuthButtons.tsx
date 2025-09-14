'use client';

import { useEffect, useState, useCallback } from 'react';

type AuthState = { token: string | null; email: string | null };

function readAuth(): AuthState {
  return {
    token: localStorage.getItem('token'),
    email: localStorage.getItem('email'),
  };
}

export default function ClientAuthButtons() {
  const [{ token, email }, setAuth] = useState<AuthState>({ token: null, email: null });

  const refresh = useCallback(() => setAuth(readAuth()), []);

  useEffect(() => {
    // Initial read
    refresh();

    // Update when any tab changes storage
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'email' || e.key === null) refresh();
    };

    // Custom event we’ll dispatch on login/logout
    const onAuthChanged = () => refresh();

    // Refresh when window gets focus (covers SPA nav)
    const onFocus = () => refresh();

    window.addEventListener('storage', onStorage);
    window.addEventListener('auth:changed', onAuthChanged as EventListener);
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth:changed', onAuthChanged as EventListener);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    // Tell listeners immediately
    window.dispatchEvent(new Event('auth:changed'));
    // Soft navigate to home
    location.href = '/';
  };

  if (token && email) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Hola, {email}</span>
        <button
          onClick={handleLogout}
          className="rounded-md bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <a
      href="/login"
      className="rounded-md bg-black px-3 py-1 text-sm text-white hover:bg-gray-800"
    >
      Login
    </a>
  );
}

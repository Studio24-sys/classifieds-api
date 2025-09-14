export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchPosts(page = 1, limit = 10) {
  const res = await fetch(`${API_URL}/api/posts?page=${page}&limit=${limit}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json(); // { page, limit, total, totalPages, items: Post[] }
}

export async function fetchMe() {
  const res = await fetch(`${API_URL}/api/users/me`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    cache: 'no-store',
  });
  if (res.status === 401 || res.status === 403 || res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json(); // { id, email, ... }
}

type CreatePostBody = {
  title: string;
  content: string;
  barrio?: string;
  pricePyg?: number;
  contactWhatsapp?: string;
};

export async function createPost(body: CreatePostBody) {
  const res = await fetch(`${API_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Create failed (${res.status}): ${txt}`);
  }
  return res.json();
}

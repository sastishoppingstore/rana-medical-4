import { getToken } from '../context/AuthContext';

const BASE = ((import.meta.env.VITE_API_BASE as string) || '').replace(/\/$/, '');

async function req<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as any) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(BASE + path, { ...options, headers });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  get: <T = any>(p: string) => req<T>(p, { method: 'GET' }),
  post: <T = any>(p: string, body: any) => req<T>(p, { method: 'POST', body: JSON.stringify(body) }),
  put: <T = any>(p: string, body: any) => req<T>(p, { method: 'PUT', body: JSON.stringify(body) }),
  del: <T = any>(p: string, body?: any) => req<T>(p, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
};

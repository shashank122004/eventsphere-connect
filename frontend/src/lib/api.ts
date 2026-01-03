import { User } from '@/types';

const BASE = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:3000/api';

const TOKEN_KEY = 'eventify_token';

export async function login(email: string, password: string): Promise<{ token: string; user: User }>{
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error((await res.json()).message || 'Login failed');
  const data = await res.json();
  if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
  return data;
}

export async function signup(name: string, email: string, phone: string, password: string): Promise<{ token: string; user: User }>{
  const res = await fetch(`${BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, password }),
  });

  if (!res.ok) throw new Error((await res.json()).message || 'Signup failed');
  const data = await res.json();
  if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
  return data;
}

export function setToken(token: string){
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export async function authFetch(path: string, opts: RequestInit = {}){
  const token = getToken();
  const headers = new Headers(opts.headers as HeadersInit || {});
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  return res;
}

// Contacts
export async function getContacts(){
  const res = await authFetch('/contacts');
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch contacts');
  return res.json();
}

export async function addContact(payload: { name: string; email: string; phone?: string }){
  const res = await authFetch('/contacts', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to add contact');
  return res.json();
}

export async function deleteContact(id: string){
  const res = await authFetch(`/contacts/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete contact');
  return res.json();
}

// Events
export async function getPublicEvents(){
  const res = await authFetch('/events/public');
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch events');
  return res.json();
}

export async function joinEventByCode(code: string){
  const res = await authFetch('/events/join', { method: 'POST', body: JSON.stringify({ code }) });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to join event');
  return res.json();
}

export async function createEvent(payload: any){
  const res = await authFetch('/events/create', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to create event');
  return res.json();
}

export async function getEventById(id: string){
  const res = await authFetch(`/events/${id}`);
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch event');
  return res.json();
}

export async function deleteEvent(id: string){
  const res = await authFetch(`/events/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete event');
  return res.json();
}

export async function getMyEvents(){
  const res = await authFetch('/events/user/my-events');
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch user events');
  return res.json();
}

export async function getEventHistory(){
  const res = await authFetch('/events/user/history');
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch event history');
  return res.json();
}

export async function leaveEvent(id: string){
  const res = await authFetch(`/events/${id}/leave`, { method: 'POST' });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to leave event');
  return res.json();
}

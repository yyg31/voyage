import { api } from './client';
import type {
  Activity,
  ActivityType,
  Family,
  Flight,
  ForumCategory,
  ForumThread,
  Link,
  LinkType,
  LinkVisibility,
  Stopover,
  User,
} from '../types';

// ---- auth ----
export async function login(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
  return data;
}
export async function fetchMe() {
  const { data } = await api.get<{ user: User }>('/auth/me');
  return data.user;
}
export async function changePassword(currentPassword: string, newPassword: string) {
  await api.post('/auth/change-password', { currentPassword, newPassword });
}
export async function forgotPassword(email: string) {
  const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email });
  return data.message;
}

// ---- users ----
export async function fetchUsers() {
  const { data } = await api.get<{ users: User[] }>('/users');
  return data.users;
}
export async function createUser(payload: Partial<User> & { password: string; familyId: string }) {
  const { data } = await api.post<{ user: User }>('/users', payload);
  return data.user;
}
export async function updateUser(id: string, payload: Partial<User> & { password?: string }) {
  const { data } = await api.patch<{ user: User }>(`/users/${id}`, payload);
  return data.user;
}
export async function deleteUser(id: string) {
  await api.delete(`/users/${id}`);
}

// ---- families ----
export async function fetchFamilies() {
  const { data } = await api.get<{ families: Family[] }>('/families');
  return data.families;
}

// ---- stopovers ----
export async function fetchStopovers() {
  const { data } = await api.get<{ stopovers: Stopover[] }>('/stopovers');
  return data.stopovers;
}
export async function createStopover(payload: Record<string, unknown>) {
  const { data } = await api.post<{ stopover: Stopover }>('/stopovers', payload);
  return data.stopover;
}
export async function updateStopover(id: string, payload: Record<string, unknown>) {
  const { data } = await api.patch<{ stopover: Stopover }>(`/stopovers/${id}`, payload);
  return data.stopover;
}
export async function deleteStopover(id: string) {
  await api.delete(`/stopovers/${id}`);
}

// ---- activities ----
export interface ActivityFilters {
  stopoverId?: string;
  type?: ActivityType;
  familyId?: string;
}
export async function fetchActivities(filters: ActivityFilters = {}) {
  const { data } = await api.get<{ activities: Activity[] }>('/activities', { params: filters });
  return data.activities;
}
export async function createActivity(payload: Record<string, unknown>) {
  const { data } = await api.post<{ activity: Activity }>('/activities', payload);
  return data.activity;
}
export async function updateActivity(id: string, payload: Record<string, unknown>) {
  const { data } = await api.patch<{ activity: Activity }>(`/activities/${id}`, payload);
  return data.activity;
}
export async function deleteActivity(id: string) {
  await api.delete(`/activities/${id}`);
}

// ---- links ----
export interface LinkFilters {
  stopoverId?: string;
  type?: LinkType;
}
export async function fetchLinks(filters: LinkFilters = {}) {
  const { data } = await api.get<{ links: Link[] }>('/links', { params: filters });
  return data.links;
}
export async function createLink(payload: {
  title: string;
  url: string;
  type: LinkType;
  stopoverId?: string | null;
  visibility: LinkVisibility;
  familyId?: string | null;
}) {
  const { data } = await api.post<{ link: Link }>('/links', payload);
  return data.link;
}
export async function deleteLink(id: string) {
  await api.delete(`/links/${id}`);
}

// ---- flights ----
export async function fetchFlights() {
  const { data } = await api.get<{ flights: Flight[] }>('/flights');
  return data.flights;
}
export async function createFlight(payload: Record<string, unknown>) {
  const { data } = await api.post<{ flight: Flight }>('/flights', payload);
  return data.flight;
}
export async function deleteFlight(id: string) {
  await api.delete(`/flights/${id}`);
}
export async function uploadFlightTicket(id: string, file: File) {
  const form = new FormData();
  form.append('ticket', file);
  const { data } = await api.post<{ flight: Flight }>(`/flights/${id}/ticket`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.flight;
}

// ---- forum ----
export async function fetchForumCategories() {
  const { data } = await api.get<{ categories: ForumCategory[] }>('/forum/categories');
  return data.categories;
}
export async function fetchForumThreads(categoryId?: string) {
  const { data } = await api.get<{ threads: ForumThread[] }>('/forum/threads', {
    params: categoryId ? { categoryId } : {},
  });
  return data.threads;
}
export async function fetchForumThread(id: string) {
  const { data } = await api.get<{ thread: ForumThread }>(`/forum/threads/${id}`);
  return data.thread;
}
export async function createForumThread(categoryId: string, title: string, message: string) {
  const { data } = await api.post<{ thread: ForumThread }>('/forum/threads', { categoryId, title, message });
  return data.thread;
}
export async function postForumMessage(threadId: string, content: string) {
  const { data } = await api.post(`/forum/threads/${threadId}/messages`, { content });
  return data.message;
}

import { get } from 'svelte/store';
import { tokenStore } from '$lib/stores/authStore';

const API_BASE_URL = 'http://localhost:8080/api';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = get(tokenStore);
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la petición');
  }

  return response.json();
}

export const api = {
  // Eventos
  createEvent: (data: { name: string; description: string }) =>
    fetchWithAuth('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getEvents: () => fetchWithAuth('/events'),

  getEvent: (id: string) => fetchWithAuth(`/events/${id}`),

  deleteEvent: (id: string) =>
    fetchWithAuth(`/events/${id}`, { method: 'DELETE' }),

  getEventMembers: (id: string) => fetchWithAuth(`/events/${id}/members`),

  invitePlayer: (eventId: string, userEmail: string) =>
    fetchWithAuth(`/events/${eventId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ userEmail }),
    }),

  removePlayer: (eventId: string, userId: string) =>
    fetchWithAuth(`/events/${eventId}/players/${userId}`, {
      method: 'DELETE',
    }),
};
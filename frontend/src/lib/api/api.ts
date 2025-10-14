import { get } from 'svelte/store';
import { tokenStore } from '$lib/stores/authStore';
import type { Event, EventMembers, Invitation } from '$lib/types';

const API_BASE_URL = 'http://localhost:8080/api';

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = get(tokenStore);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error en la petición' }));
    throw new Error(error.error || 'Error en la petición');
  }

  return response.json();
}

export const api = {
  // Eventos
  createEvent: (data: { name: string; description: string }) =>
    fetchWithAuth<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getEvents: () => fetchWithAuth<Event[]>('/events'),

  getEvent: (id: string) => fetchWithAuth<Event>(`/events/${id}`),

  deleteEvent: (id: string) =>
    fetchWithAuth<{ message: string }>(`/events/${id}`, { method: 'DELETE' }),

  getEventMembers: (id: string) => fetchWithAuth<EventMembers>(`/events/${id}/members`),

  invitePlayer: (eventId: string, userEmail: string) =>
    fetchWithAuth<{ message: string; invitation: Invitation }>(`/events/${eventId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ userEmail }),
    }),

  removePlayer: (eventId: string, userId: string) =>
    fetchWithAuth<{ message: string }>(`/events/${eventId}/players/${userId}`, {
      method: 'DELETE',
    }),

  // Invitaciones
  getMyInvitations: () => fetchWithAuth<Invitation[]>('/invitations'),

  respondToInvitation: (invitationId: string, action: 'accept' | 'reject') =>
    fetchWithAuth<{ message: string }>(`/invitations/${invitationId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),
};
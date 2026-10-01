import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { AuditEvent, Booking, SupportTicket, Trip, User } from '../types';
import type { AsyncRunner } from './useNotifications';

/**
 * Owns catalogue and account-scoped collections. Mutations can call
 * `loadPrivateData` to refresh every dependent view consistently.
 */
export function useTravelData(user: User | null, run: AsyncRunner) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);

  const loadTrips = useCallback(async (search: string) => {
    const response = await run(
      () => api<{ trips: Trip[] }>(`/trips?q=${encodeURIComponent(search)}`)
    );
    if (response) setTrips(response.trips);
  }, [run]);

  const loadPrivateData = useCallback(async () => {
    if (!user) return;
    const [bookingResponse, ticketResponse] = await Promise.all([
      api<{ bookings: Booking[] }>('/bookings'),
      api<{ tickets: SupportTicket[] }>('/support/tickets')
    ]);
    setBookings(bookingResponse.bookings);
    setTickets(ticketResponse.tickets);

    if (user.role === 'support') {
      const auditResponse = await api<{ events: AuditEvent[] }>('/audit');
      setEvents(auditResponse.events);
    } else {
      setEvents([]);
    }
  }, [user]);

  useEffect(() => {
    void loadTrips('');
  }, [loadTrips]);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setTickets([]);
      setEvents([]);
      return;
    }
    void run(loadPrivateData);
  }, [user, loadPrivateData, run]);

  return { trips, bookings, tickets, events, loadTrips, loadPrivateData };
}

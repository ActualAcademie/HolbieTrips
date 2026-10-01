import { useState } from 'react';
import { api } from '../api';
import type { Booking, Trip, User, View } from '../types';
import type { AsyncRunner } from './useNotifications';

type BookingWorkflowOptions = {
  user: User | null;
  run: AsyncRunner;
  reload: () => Promise<void>;
  showNotice: (message: string) => void;
  requireAuthentication: () => void;
  navigate: (view: View) => void;
};

/** Coordinates user prompts and server mutations for the booking lifecycle. */
export function useBookingWorkflow({
  user,
  run,
  reload,
  showNotice,
  requireAuthentication,
  navigate
}: BookingWorkflowOptions) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const reserve = async (trip: Trip) => {
    if (!user) {
      requireAuthentication();
      return;
    }

    const travelers = Number(prompt('Nombre de voyageurs (1 à 8)', '1'));
    if (!travelers) return;
    const couponCode = prompt('Code promo (facultatif)', '') || '';
    const result = await run(
      () => api<{ booking: Booking }>('/bookings', {
        method: 'POST',
        body: JSON.stringify({ tripId: trip.id, travelers, couponCode })
      })
    );
    if (!result) return;

    showNotice(`Réservation ${result.booking.reference} créée.`);
    await reload();
    navigate('bookings');
  };

  const pay = async (booking: Booking) => {
    const cardNumber = prompt(
      'Numéro de carte : utilisez 4242 4242 4242 4242',
      '4242 4242 4242 4242'
    );
    if (!cardNumber) return;

    const result = await run(
      () => api<{ reference: string }>(`/bookings/${booking.id}/pay`, {
        method: 'POST',
        body: JSON.stringify({ cardNumber })
      })
    );
    if (!result) return;
    showNotice(`Paiement accepté pour ${result.reference}.`);
    await reload();
  };

  const cancel = async (booking: Booking) => {
    if (!confirm(`Annuler la réservation ${booking.reference} ?`)) return;
    const result = await run(
      () => api<{ flag?: string }>(`/bookings/${booking.id}/cancel`, { method: 'POST' })
    );
    if (!result) return;

    showNotice(result.flag ? `Réservation annulée — ${result.flag}` : 'Réservation annulée.');
    await reload();
  };

  const open = async (id: string) => {
    const result = await run(() => api<{ booking: Booking }>(`/bookings/${id}`));
    if (result) setSelectedBooking(result.booking);
  };

  return {
    selectedBooking,
    closeSelectedBooking: () => setSelectedBooking(null),
    reserve,
    pay,
    cancel,
    open
  };
}

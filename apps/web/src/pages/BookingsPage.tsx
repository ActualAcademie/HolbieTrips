import { EmptyState } from '../components/common/EmptyState';
import { Page } from '../components/common/Page';
import type { Booking } from '../types';
import { formatDate, formatMoney } from '../utils/format';

type BookingsPageProps = {
  bookings: Booking[];
  onOpen: (bookingId: string) => void;
  onPay: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
};

/** Lists the signed-in traveller's bookings and their available actions. */
export function BookingsPage({ bookings, onOpen, onPay, onCancel }: BookingsPageProps) {
  return (
    <Page title="Mes voyages" kicker="Carnet de route">
      <div className="stack">
        {bookings.length ? bookings.map(booking => (
          <article className="booking" key={booking.id}>
            <div>
              <span className={`pill ${booking.status}`}>{booking.status}</span>
              <h3>{booking.title}</h3>
              <p>
                {booking.reference} · {booking.destination} · {formatDate(booking.departure_date)}
              </p>
            </div>
            <div className="booking-price">
              <b>{formatMoney(booking.total_cents)}</b>
              <small>{booking.travelers} voyageur(s)</small>
              <button className="detail-button" onClick={() => onOpen(booking.id)}>Voir le détail</button>
              {booking.status === 'pending' && (
                <button className="primary" onClick={() => onPay(booking)}>Payer maintenant</button>
              )}
              {booking.status !== 'cancelled' && (
                <button className="detail-button" onClick={() => onCancel(booking)}>Annuler</button>
              )}
              {booking.payment_status && <small>Carte •••• {booking.card_last4}</small>}
            </div>
          </article>
        )) : (
          <EmptyState text="Aucune réservation pour le moment." />
        )}
      </div>
    </Page>
  );
}

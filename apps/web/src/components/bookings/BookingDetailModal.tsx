import type { Booking } from '../../types';
import { formatDate, formatMoney } from '../../utils/format';

type BookingDetailModalProps = {
  booking: Booking;
  onClose: () => void;
};

/** Displays the complete itinerary returned for a selected booking. */
export function BookingDetailModal({ booking, onClose }: BookingDetailModalProps) {
  return (
    <div className="booking-overlay" onMouseDown={onClose}>
      <article className="booking-detail" onMouseDown={event => event.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Fermer">×</button>
        <div className="boarding-header">
          <div className="modal-brand">
            <img src="/brand-mark.svg" alt="" />
            <span>Holbie<i>Trips</i></span>
          </div>
          <span className={`pill ${booking.status}`}>{booking.status}</span>
        </div>

        <p className="eyebrow">Votre carnet de voyage</p>
        <h2>{booking.title}</h2>
        <p className="detail-description">{booking.trip_description}</p>

        <div className="booking-route">
          <div><small>DÉPART</small><b>{formatDate(booking.departure_date)}</b></div>
          <span>→</span>
          <div>
            <small>RETOUR</small>
            <b>{booking.return_date ? formatDate(booking.return_date) : 'À confirmer'}</b>
          </div>
        </div>

        <div className="detail-grid">
          <div><small>RÉFÉRENCE</small><b>{booking.reference}</b></div>
          <div>
            <small>VOYAGEUR</small>
            <b>{booking.traveler_name}</b>
            <span>{booking.traveler_email}</span>
          </div>
          <div><small>DESTINATION</small><b>{booking.destination}</b></div>
          <div><small>PARTICIPANTS</small><b>{booking.travelers}</b></div>
        </div>

        <div className="itinerary-note">
          <small>INFORMATIONS D’ITINÉRAIRE</small>
          <p>{booking.itinerary_notes}</p>
        </div>
        <div className="detail-total">
          <span>Total de la réservation</span>
          <b>{formatMoney(booking.total_cents)}</b>
        </div>
      </article>
    </div>
  );
}

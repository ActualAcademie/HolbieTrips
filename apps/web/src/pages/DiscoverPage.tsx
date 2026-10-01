import type { FormEvent } from 'react';
import type { Trip } from '../types';
import { formatDate, formatMoney, tripDuration } from '../utils/format';

type DiscoverPageProps = {
  trips: Trip[];
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onReserve: (trip: Trip) => void;
};

/** Renders the marketing landing page, catalogue search, and trip cards. */
export function DiscoverPage({
  trips,
  query,
  onQueryChange,
  onSearch,
  onReserve
}: DiscoverPageProps) {
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-badge"><span>✦</span> Voyages en petit groupe · Collection 2027</div>
          <h1>Des voyages pensés<br />pour <em>vous émerveiller.</em></h1>
          <p>
            Des itinéraires singuliers, une réservation simple et un accompagnement
            attentionné à chaque étape.
          </p>
          <div className="hero-points">
            <span>✓ Prix transparents</span>
            <span>✓ Support dédié</span>
            <span>✓ Paiement sécurisé</span>
          </div>
          <form className="search" onSubmit={submitSearch}>
            <label>
              <small>DESTINATION</small>
              <span className="search-icon">⌖</span>
              <input
                value={query}
                onChange={event => onQueryChange(event.target.value)}
                placeholder="Où souhaitez-vous aller ?"
              />
            </label>
            <div className="search-detail">
              <small>DÉPARTS</small>
              <b>Printemps — Automne 2027</b>
            </div>
            <button>Rechercher <span>→</span></button>
          </form>
        </div>

        <div className="hero-visual">
          <div className="hero-image">
            <img src="/destinations/lisbon.svg" alt="Vue illustrée de Lisbonne" />
            <div className="image-label"><span>Destination du moment</span><b>Lisbonne</b></div>
          </div>
          <div className="rating-card">
            <div className="rating-avatars"><span>A</span><span>B</span><span>S</span></div>
            <div><b>4,9/5</b><small>Avis de nos voyageurs</small></div>
          </div>
          <div className="route-card"><span>PARIS</span><b>→</b><span>LISBONNE</span></div>
        </div>
      </section>

      <section className="benefits">
        <div><span>01</span><b>Voyages sélectionnés</b><small>Des itinéraires imaginés avec soin</small></div>
        <div><span>02</span><b>Réservation sereine</b><small>Des prix clairs, sans surprise</small></div>
        <div><span>03</span><b>À vos côtés</b><small>Une équipe support disponible</small></div>
      </section>

      <section className="section">
        <div className="section-title">
          <div>
            <p className="eyebrow">Inspirations du moment</p>
            <h2>Votre prochaine histoire commence ici</h2>
            <p>Quatre échappées, quatre façons de voir le monde autrement.</p>
          </div>
          <span className="count">{String(trips.length).padStart(2, '0')} voyages</span>
        </div>
        <div className="trip-grid">
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} onReserve={() => onReserve(trip)} />
          ))}
        </div>
      </section>

      <section className="promise">
        <div>
          <p className="eyebrow">La promesse HolbieTrips</p>
          <h2>Partir loin,<br /><em>l’esprit léger.</em></h2>
        </div>
        <p>
          Une expérience fluide, de la première inspiration jusqu’au retour. Notre équipe
          veille sur chaque détail de votre aventure.
        </p>
        <div className="promise-mark">
          <img src="/brand-mark.svg" alt="" />
          <span>04</span>
          <small>DESTINATIONS</small>
        </div>
      </section>
    </>
  );
}

function TripCard({ trip, onReserve }: { trip: Trip; onReserve: () => void }) {
  return (
    <article className="trip">
      <div className="trip-art">
        <img src={`/destinations/${trip.image_key}.svg`} alt={`Illustration de ${trip.destination}`} />
        <span className="availability">
          {trip.seats_available <= 10 ? 'Dernières places' : 'Places disponibles'}
        </span>
        <button className="favorite" aria-label={`Ajouter ${trip.title} aux favoris`}>♡</button>
      </div>
      <div className="trip-body">
        <p><span>⌖</span> {trip.destination}</p>
        <h3>{trip.title}</h3>
        <span>{trip.description}</span>
        <div className="dates">
          <span>◷</span>
          <div>
            <small>DU {formatDate(trip.departure_date).toUpperCase()}</small>
            <b>{tripDuration(trip.departure_date, trip.return_date)} jours d’évasion</b>
          </div>
        </div>
        <div className="meta">
          <span>À partir de</span>
          <b>{formatMoney(trip.price_cents)} <small>/ personne</small></b>
        </div>
        <button className="book-button" onClick={onReserve}>
          Découvrir ce voyage <span>→</span>
        </button>
      </div>
    </article>
  );
}

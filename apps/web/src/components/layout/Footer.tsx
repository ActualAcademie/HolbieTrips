/** Displays the local-lab disclaimer without interrupting the booking journey. */
export function Footer() {
  return (
    <footer>
      <div className="footer-brand">
        <img src="/brand-mark.svg" alt="" />
        <span>
          <b>Holbie<i>Trips</i></b>
          <small>Voyager autrement, même en local.</small>
        </span>
      </div>
      <div className="footer-links">
        <span>Plateforme pédagogique</span>
        <span>OWASP Top 10:2025</span>
        <span>Usage local uniquement</span>
      </div>
      <div className="footer-note">
        <span>✦</span>
        <p>
          <b>Laboratoire fictif</b>
          <small>Aucun voyage, paiement ou message réel.</small>
        </p>
      </div>
    </footer>
  );
}

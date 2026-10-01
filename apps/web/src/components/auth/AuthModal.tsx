import { useState, type FormEvent } from 'react';
import type { AuthSubmission } from '../../types';

type AuthModalProps = {
  onClose: () => void;
  onSubmit: (submission: AuthSubmission, registering: boolean) => Promise<boolean>;
  onRequestReset: () => void;
};

/** Presents login and registration in one modal while keeping API work outside. */
export function AuthModal({ onClose, onSubmit, onRequestReset }: AuthModalProps) {
  const [registering, setRegistering] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const completed = await onSubmit({
      fullName: String(fields.get('fullName') ?? ''),
      email: String(fields.get('email') ?? ''),
      password: String(fields.get('password') ?? '')
    }, registering);
    if (completed && registering) setRegistering(false);
  };

  return (
    <div className="modal" onMouseDown={onClose}>
      <form onSubmit={submit} onMouseDown={event => event.stopPropagation()}>
        <button type="button" className="close" onClick={onClose} aria-label="Fermer">×</button>
        <div className="modal-brand">
          <img src="/brand-mark.svg" alt="" />
          <span>Holbie<i>Trips</i></span>
        </div>
        <p className="eyebrow">Espace voyageur</p>
        <h2>{registering ? 'Créer votre compte' : 'Heureux de vous revoir'}</h2>
        <p className="modal-intro">
          {registering
            ? 'Rejoignez notre communauté de voyageurs.'
            : 'Connectez-vous pour retrouver vos prochaines aventures.'}
        </p>

        {registering && (
          <label>
            Nom complet
            <input name="fullName" required minLength={2} placeholder="Votre nom" />
          </label>
        )}
        <label>
          E-mail
          <input
            name="email"
            type="email"
            required
            defaultValue={registering ? '' : 'alice.martin@example.test'}
          />
        </label>
        <label>
          Mot de passe
          <input
            name="password"
            type="password"
            required
            minLength={12}
            defaultValue={registering ? '' : 'Voyage!Alice2025'}
          />
        </label>
        <button className="primary full">
          {registering ? 'Créer mon compte' : 'Se connecter'} <span>→</span>
        </button>
        {!registering && (
          <button type="button" className="link" onClick={onRequestReset}>
            Mot de passe oublié ?
          </button>
        )}
        <button type="button" className="link" onClick={() => setRegistering(current => !current)}>
          {registering ? 'J’ai déjà un compte' : 'Nouveau chez HolbieTrips ? Créer un compte'}
        </button>
      </form>
    </div>
  );
}

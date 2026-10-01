import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api';
import { Page } from '../components/common/Page';
import type { TravelerProfile, User } from '../types';

type ProfilePageProps = {
  onDone: () => void;
  onError: (message: string) => void;
};

/** Loads and updates the authenticated traveller's personal information. */
export function ProfilePage({ onDone, onError }: ProfilePageProps) {
  const [profile, setProfile] = useState<TravelerProfile | null>(null);

  useEffect(() => {
    let active = true;
    api<{ user: User; profile: TravelerProfile | null }>('/me')
      .then(response => {
        if (active) setProfile(response.profile ?? {});
      })
      .catch(caught => {
        if (active) onError(caught instanceof Error ? caught.message : 'Erreur');
      });
    return () => {
      active = false;
    };
  }, [onError]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    try {
      await api('/me', {
        method: 'PUT',
        body: JSON.stringify(Object.fromEntries(fields))
      });
      onDone();
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : 'Erreur');
    }
  };

  if (!profile) {
    return <Page title="Profil voyageur" kicker="Vos informations"><p>Chargement…</p></Page>;
  }

  return (
    <Page title="Profil voyageur" kicker="Vos informations">
      <form className="panel form-grid" onSubmit={save}>
        <label>
          Téléphone
          <input name="phone" defaultValue={profile.phone ?? ''} />
        </label>
        <label>
          Date de naissance
          <input name="birthDate" type="date" defaultValue={profile.birthDate?.slice(0, 10) ?? ''} />
        </label>
        <label>
          Nationalité
          <input name="nationality" defaultValue={profile.nationality ?? ''} />
        </label>
        <label>
          Numéro de passeport
          <input
            name="passportNumber"
            defaultValue={profile.passportNumber ?? ''}
            placeholder="FR00DEMO000"
          />
        </label>
        <p className="secure-note">🔒 Donnée sensible — stockage local de démonstration.</p>
        <button className="primary">Enregistrer</button>
      </form>
    </Page>
  );
}

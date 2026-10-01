import type { User, View } from '../../types';

type HeaderProps = {
  user: User | null;
  checkingSession: boolean;
  view: View;
  onNavigate: (view: View) => void;
  onLogin: () => void;
  onLogout: () => void;
};

/** Displays primary navigation and the current account state. */
export function Header({
  user,
  checkingSession,
  view,
  onNavigate,
  onLogin,
  onLogout
}: HeaderProps) {
  return (
    <>
      <div className="lab-banner">
        <span>✦ Nouvelle collection 2027</span>
        <span>Lisbonne · Bergen · Kyoto · Atlas</span>
      </div>
      <header>
        <button
          className="brand"
          onClick={() => onNavigate('discover')}
          aria-label="Accueil HolbieTrips"
        >
          <img src="/brand-mark.svg" alt="" />
          <span className="wordmark">
            <b>Holbie</b><i>Trips</i><small>TRAVEL STUDIO</small>
          </span>
        </button>

        <nav>
          <NavigationButton active={view === 'discover'} onClick={() => onNavigate('discover')}>
            Explorer
          </NavigationButton>
          {user && (
            <NavigationButton active={view === 'bookings'} onClick={() => onNavigate('bookings')}>
              Mes voyages
            </NavigationButton>
          )}
          {user && (
            <NavigationButton active={view === 'support'} onClick={() => onNavigate('support')}>
              Support
            </NavigationButton>
          )}
          {user?.role === 'customer' && (
            <NavigationButton active={view === 'profile'} onClick={() => onNavigate('profile')}>
              Profil
            </NavigationButton>
          )}
          {user?.role === 'support' && (
            <NavigationButton active={view === 'audit'} onClick={() => onNavigate('audit')}>
              Audit
            </NavigationButton>
          )}
        </nav>

        {checkingSession ? (
          <button className="primary header-cta" disabled>Vérification…</button>
        ) : user ? (
          <div className="account">
            <span className="avatar">{user.fullName.charAt(0)}</span>
            <div>
              <small>{user.role === 'support' ? 'Équipe support' : 'Espace voyageur'}</small>
              <strong>{user.fullName}</strong>
              <button onClick={onLogout}>Déconnexion</button>
            </div>
          </div>
        ) : (
          <button className="primary header-cta" onClick={onLogin}>
            Se connecter <span>→</span>
          </button>
        )}
      </header>
    </>
  );
}

function NavigationButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button className={active ? 'active' : ''} onClick={onClick}>
      {children}
    </button>
  );
}

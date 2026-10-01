import { useState } from 'react';
import { api } from './api';
import { AuthModal } from './components/auth/AuthModal';
import { BookingDetailModal } from './components/bookings/BookingDetailModal';
import { ToastRegion } from './components/feedback/ToastRegion';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { useBookingWorkflow } from './hooks/useBookingWorkflow';
import { useNotifications } from './hooks/useNotifications';
import { useSession } from './hooks/useSession';
import { useTravelData } from './hooks/useTravelData';
import { AuditPage } from './pages/AuditPage';
import { BookingsPage } from './pages/BookingsPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ProfilePage } from './pages/ProfilePage';
import { SupportPage } from './pages/SupportPage';
import type { AuthSubmission, User, View } from './types';

/**
 * Composes the frontend from feature hooks and focused views. Business data and
 * workflows stay outside the rendering tree so the application flow is visible
 * at a glance.
 */
export function App() {
  const notifications = useNotifications();
  const session = useSession(notifications.showError);
  const [view, setView] = useState<View>('discover');
  const [query, setQuery] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const travelData = useTravelData(session.user, notifications.run);
  const bookingWorkflow = useBookingWorkflow({
    user: session.user,
    run: notifications.run,
    reload: travelData.loadPrivateData,
    showNotice: notifications.showNotice,
    requireAuthentication: () => setAuthOpen(true),
    navigate: setView
  });

  /** Handles registration or login submitted by the shared authentication modal. */
  const authenticate = async (submission: AuthSubmission, registering: boolean): Promise<boolean> => {
    if (registering) {
      const result = await notifications.run(
        () => api<{ user: User }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(submission)
        }),
        'Compte créé, vous pouvez vous connecter.'
      );
      return Boolean(result);
    }

    const result = await notifications.run(
      () => api<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(submission)
      })
    );
    if (!result) return false;

    session.establish(result.token, result.user);
    setAuthOpen(false);
    notifications.showNotice(`Bienvenue, ${result.user.fullName}.`);
    return true;
  };

  const logout = async () => {
    await notifications.run(() => api('/auth/logout', { method: 'POST' }));
    session.clear();
    setView('discover');
  };

  const requestPasswordReset = async () => {
    const account = prompt('E-mail du compte à réinitialiser', 'alice.martin@example.test');
    if (!account) return;
    await notifications.run(
      () => api('/auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify({ email: account })
      }),
      'Si le compte existe, un message de réinitialisation a été créé.'
    );
  };

  return (
    <>
      <Header
        user={session.user}
        checkingSession={session.checking}
        view={view}
        onNavigate={setView}
        onLogin={() => setAuthOpen(true)}
        onLogout={() => void logout()}
      />
      <ToastRegion
        notice={notifications.notice}
        error={notifications.error}
        onClearNotice={notifications.clearNotice}
        onClearError={notifications.clearError}
      />

      <main>
        {view === 'discover' && (
          <DiscoverPage
            trips={travelData.trips}
            query={query}
            onQueryChange={setQuery}
            onSearch={() => void travelData.loadTrips(query)}
            onReserve={trip => void bookingWorkflow.reserve(trip)}
          />
        )}
        {view === 'bookings' && (
          <BookingsPage
            bookings={travelData.bookings}
            onOpen={id => void bookingWorkflow.open(id)}
            onPay={booking => void bookingWorkflow.pay(booking)}
            onCancel={booking => void bookingWorkflow.cancel(booking)}
          />
        )}
        {view === 'profile' && (
          <ProfilePage
            onDone={() => notifications.showNotice('Profil enregistré de façon sécurisée.')}
            onError={notifications.showError}
          />
        )}
        {view === 'support' && session.user && (
          <SupportPage
            user={session.user}
            tickets={travelData.tickets}
            reload={travelData.loadPrivateData}
            onNotice={notifications.showNotice}
            onError={notifications.showError}
          />
        )}
        {view === 'audit' && <AuditPage events={travelData.events} />}
      </main>

      {bookingWorkflow.selectedBooking && (
        <BookingDetailModal
          booking={bookingWorkflow.selectedBooking}
          onClose={bookingWorkflow.closeSelectedBooking}
        />
      )}
      <Footer />
      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onSubmit={authenticate}
          onRequestReset={() => void requestPasswordReset()}
        />
      )}
    </>
  );
}

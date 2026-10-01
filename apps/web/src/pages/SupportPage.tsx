import { type FormEvent } from 'react';
import { api } from '../api';
import { EmptyState } from '../components/common/EmptyState';
import { Page } from '../components/common/Page';
import type { SupportTicket, User } from '../types';

type SupportPageProps = {
  user: User;
  tickets: SupportTicket[];
  reload: () => Promise<void>;
  onNotice: (message: string) => void;
  onError: (message: string) => void;
};

/** Presents customer ticket creation or the support agent response workflow. */
export function SupportPage({
  user,
  tickets,
  reload,
  onNotice,
  onError
}: SupportPageProps) {
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    try {
      await api('/support/tickets', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(fields))
      });
      form.reset();
      await reload();
      onNotice('Demande envoyée au support.');
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : 'Erreur');
    }
  };

  const answer = async (ticket: SupportTicket) => {
    const response = prompt('Réponse du support', ticket.support_reply ?? '');
    if (!response) return;
    try {
      await api(`/support/tickets/${ticket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'closed', response })
      });
      await reload();
      onNotice('Ticket clôturé et journalisé.');
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : 'Erreur');
    }
  };

  return (
    <Page title={user.role === 'support' ? 'Centre support' : 'Besoin d’aide ?'} kicker="Assistance">
      {user.role === 'customer' && (
        <form className="panel support-form" onSubmit={submit}>
          <input name="subject" required minLength={3} placeholder="Objet de votre demande" />
          <textarea name="message" required minLength={5} placeholder="Votre message…" />
          <button className="primary">Envoyer</button>
        </form>
      )}
      <div className="stack">
        {tickets.length ? tickets.map(ticket => (
          <article className="ticket" key={ticket.id}>
            <div>
              <span className={`pill ${ticket.status}`}>{ticket.status}</span>
              {user.role === 'support' && <small>{ticket.email}</small>}
              <h3>{ticket.subject}</h3>
              <p>{ticket.message}</p>
              {ticket.support_reply && <blockquote>{ticket.support_reply}</blockquote>}
            </div>
            {user.role === 'support' && ticket.status !== 'closed' && (
              <button onClick={() => void answer(ticket)}>Répondre</button>
            )}
          </article>
        )) : (
          <EmptyState text="Aucune demande de support." />
        )}
      </div>
    </Page>
  );
}

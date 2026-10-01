import { Page } from '../components/common/Page';
import type { AuditEvent } from '../types';

/** Displays recent audit events to authenticated support users. */
export function AuditPage({ events }: { events: AuditEvent[] }) {
  return (
    <Page title="Journal d’audit" kicker="Traçabilité">
      <div className="table">
        <div className="tr head">
          <span>Date</span><span>Compte</span><span>Action</span><span>Cible</span>
        </div>
        {events.map(event => (
          <div className="tr" key={event.id}>
            <span>{new Date(event.created_at).toLocaleString('fr-FR')}</span>
            <span>{event.email || 'Système'}</span>
            <code>{event.action}</code>
            <span>{event.entity_type}</span>
          </div>
        ))}
      </div>
    </Page>
  );
}

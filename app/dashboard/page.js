'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon, VEHICLE_TYPES } from '@/components/Icons';
import ViewCounter from '@/components/ViewCounter';
import { getRequests } from '@/lib/store';
import { timeAgo, plural } from '@/lib/format';

export default function DashboardPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refresh = () => {
      setRequests(getRequests());
      setLoading(false);
    };
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  const active = requests.filter(r => r.status === 'active');
  const completed = requests.filter(r => r.status === 'completed');

  if (loading) return (
    <div className="dash" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <Icon name="loader" className="ic-xl" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
      <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Chargement...</p>
    </div>
  );

  const card = (r, done = false) => {
    const vt = VEHICLE_TYPES.find(v => v.id === r.vehicleType) || { icon: 'wrench', name: 'Autre' };
    return (
      <div key={r.id} className="card rq-card" style={done ? { opacity: .7 } : undefined}>
        <div className="rq-hdr">
          <span className="rq-badge"><Icon name={vt.icon} /> {vt.name}</span>
          <span className={`rq-status ${done ? 'completed' : 'active'}`}>{done ? 'Terminée' : 'Active'}</span>
        </div>
        <h3 className="rq-title">{r.brand || vt.name} — Panne</h3>
        <p className="rq-desc">{r.description}</p>
        <div className="rq-meta">
          <span className="rq-meta-i"><Icon name="map-pin" /> {r.location}</span>
          <span className="rq-meta-i"><Icon name="clock" /> {timeAgo(r.createdAt)}</span>
        </div>

        {!done && (
          <>
            {/* inDrive-style view counter */}
            <div style={{ marginTop: 14 }}>
              <ViewCounter requestId={r.id} />
            </div>
            <div className="rq-foot">
              <div className="offer-ct">
                <span className="ct-badge">{r.proposalCount}</span>
                {plural(r.proposalCount, 'offre')}
              </div>
              <Link href={`/demande?id=${r.id}`} className="btn btn-p btn-sm">Voir les offres</Link>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="dash">
      <div className="dash-hdr">
        <div>
          <h1 className="dash-title"><Icon name="car" /> Mes Demandes</h1>
          <p className="dash-sub">
            {active.length} {plural(active.length, 'demande')} {plural(active.length, 'active')}
          </p>
        </div>
        <Link href="/demander" className="btn btn-p"><Icon name="plus" /> Nouvelle demande</Link>
      </div>

      {requests.length === 0 ? (
        <div className="empty">
          <Icon name="car" />
          <h3>Aucune demande</h3>
          <p>Vous n&apos;avez pas encore posté de demande de dépannage.</p>
          <Link href="/demander" className="btn btn-p">Poster une demande</Link>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <>
              <h2 className="dash-sec" style={{ color: 'var(--success)' }}>
                <Icon name="check" className="ic-sm" /> Demandes actives
              </h2>
              <div className="dash-grid" style={{ marginBottom: 40 }}>
                {active.map(r => card(r))}
              </div>
            </>
          )}

          {completed.length > 0 && (
            <>
              <h2 className="dash-sec" style={{ color: 'var(--text-muted)' }}>
                Demandes terminées
              </h2>
              <div className="dash-grid">
                {completed.map(r => card(r, true))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Icon, VEHICLE_TYPES } from '@/components/Icons';
import { useToast } from '@/components/Toast';
import ViewCounter from '@/components/ViewCounter';
import { getRequestById, getProposals, acceptProposal, rejectProposal } from '@/lib/store';
import { timeAgo, plural } from '@/lib/format';

function Spinner() {
  return (
    <div className="dash" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <Icon name="loader" className="ic-xl" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
      <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Chargement...</p>
    </div>
  );
}

function DemandeView() {
  // A static export has no server to resolve /demande/[id], so the request id
  // travels as a query param instead.
  const id = useSearchParams().get('id');
  const toast = useToast();
  const [request, setRequest] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setRequest(getRequestById(id));
    setProposals(getProposals(id).sort((a, b) => a.price - b.price));
    setLoading(false);
  };

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    refresh();
    const interval = setInterval(refresh, 4000);
    return () => clearInterval(interval);
  }, [id]);

  const handleAction = (proposalId, action) => {
    const done = action === 'accept' ? acceptProposal(proposalId) : rejectProposal(proposalId);
    if (!done) {
      toast('Proposition introuvable', 'error');
      return;
    }
    toast(
      action === 'accept' ? 'Offre acceptée ! Le dépanneur arrive.' : 'Offre refusée.',
      action === 'accept' ? 'success' : 'info',
    );
    refresh();
  };

  if (loading) return <Spinner />;

  if (!request) return (
    <div className="dash">
      <div className="empty">
        <Icon name="search" />
        <h3>Demande introuvable</h3>
        <p>Cette demande n&apos;existe pas ou a été supprimée.</p>
        <Link href="/dashboard" className="btn btn-p">Retour au dashboard</Link>
      </div>
    </div>
  );

  const vt = VEHICLE_TYPES.find(v => v.id === request.vehicleType) || { icon: 'wrench', name: 'Autre' };

  return (
    <div className="dash">
      <div className="dash-hdr">
        <div>
          <Link href="/dashboard" className="btn btn-s btn-sm" style={{ marginBottom: 12 }}>
            <Icon name="arrow-left" /> Retour
          </Link>
          <h1 className="dash-title">
            <Icon name={vt.icon} /> {request.brand || vt.name}
          </h1>
          <p className="dash-sub" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="map-pin" className="ic-sm" /> {request.location} · {timeAgo(request.createdAt)}
          </p>
        </div>
      </div>

      {/* Request details */}
      <div className="card" style={{ marginBottom: 20, padding: 16 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '.85rem' }}>{request.description}</p>
        {Number.isFinite(request.lat) && Number.isFinite(request.lng) && (
          <p style={{ marginTop: 8, fontSize: '.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon name="map-pin" className="ic-sm" /> GPS : {request.lat.toFixed(4)}, {request.lng.toFixed(4)}
          </p>
        )}
      </div>

      {/* View counter */}
      <ViewCounter requestId={id} />

      {/* Proposals */}
      <h2 className="dash-sec">
        <Icon name="dollar" className="ic-sm" /> {proposals.length} {plural(proposals.length, 'proposition')} {plural(proposals.length, 'reçue')}
      </h2>

      {proposals.length > 0 ? (
        <div className="dash-grid-pr">
          {proposals.map((p, i) => {
            const initials = p.providerName.split(' ').map(w => w[0]).join('').substring(0, 2);
            const isBest = i === 0 && p.status === 'pending';
            return (
              <div key={p.id} className={`card pr-card ${isBest ? 'best' : ''}`} style={{ position: 'relative' }}>
                {isBest && <div className="pr-best-tag">Meilleure offre</div>}
                {p.status === 'accepted' && (
                  <div className="acc-overlay">
                    <div className="acc-badge"><Icon name="check" className="ic-sm" /> Acceptée</div>
                  </div>
                )}
                <div className="pr-provider">
                  <div className="pr-avatar">{initials}</div>
                  <div>
                    <div className="pr-name">{p.providerName}</div>
                    <div className="pr-rating">
                      {Array.from({ length: 5 }, (_, j) => (
                        <Icon key={j} name={j < Math.floor(p.rating) ? 'star' : 'star-empty'} className="ic-sm" />
                      ))}
                      <span style={{ marginLeft: 4 }}>{p.rating}</span>
                      <span className="rc">({p.reviewCount} avis)</span>
                    </div>
                  </div>
                </div>
                <div className="pr-price">{p.price} <span className="cur">MAD</span></div>
                {p.message && <p className="pr-msg">{p.message}</p>}
                <div className="pr-details">
                  <div className="pr-det">
                    <span className="pr-det-lbl">Temps d&apos;arrivée</span>
                    <span className="pr-det-val"><Icon name="clock" /> {p.eta}</span>
                  </div>
                  <div className="pr-det">
                    <span className="pr-det-lbl">Statut</span>
                    <span className="pr-det-val">
                      {p.status === 'pending' && <><Icon name="clock" /> En attente</>}
                      {p.status === 'accepted' && <><Icon name="check" /> Acceptée</>}
                      {p.status === 'rejected' && <><Icon name="x" /> Refusée</>}
                    </span>
                  </div>
                </div>
                {p.status === 'pending' && request.status === 'active' && (
                  <div className="pr-actions">
                    <button className="btn btn-ok btn-sm" onClick={() => handleAction(p.id, 'accept')}>
                      <Icon name="check" /> Accepter
                    </button>
                    <button className="btn btn-no btn-sm" onClick={() => handleAction(p.id, 'reject')}>
                      <Icon name="x" /> Refuser
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <Icon name="search" />
          <h3>Aucune proposition</h3>
          <p>Les dépanneurs examinent votre demande. Les offres arrivent dans quelques instants.</p>
        </div>
      )}
    </div>
  );
}

export default function DemandePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <DemandeView />
    </Suspense>
  );
}

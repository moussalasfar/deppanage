'use client';
import { useState, useEffect, useMemo } from 'react';
import { Icon, VEHICLE_TYPES } from '@/components/Icons';
import { useToast } from '@/components/Toast';
import { getRequests, createProposal, addView } from '@/lib/store';
import { haversine } from '@/lib/geo';
import { timeAgo, plural } from '@/lib/format';

const CASABLANCA = { lat: 33.5731, lng: -7.5898 };

const DIST_FILTERS = [
  { value: 5, label: '< 5 km' },
  { value: 10, label: '< 10 km' },
  { value: 25, label: '< 25 km' },
  { value: 50, label: '< 50 km' },
  { value: Infinity, label: 'Toutes' },
];

const ETA_OPTIONS = ['5 min', '10 min', '15 min', '20 min', '30 min', '45 min', '1h'];

export default function DepanneurPage() {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geo, setGeo] = useState({ lat: null, lng: null, status: 'loading' });
  const [filter, setFilter] = useState('all');
  const [maxDist, setMaxDist] = useState(50);
  const [modal, setModal] = useState(null); // request id being bid on
  const [form, setForm] = useState({ price: '', eta: '', message: '' });
  const [sessionId] = useState(() => 'prov_' + Math.random().toString(36).slice(2, 9));

  // Provider position — falls back to Casablanca so the list is never empty.
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeo({ ...CASABLANCA, status: 'fallback' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude, status: 'ok' }),
      () => setGeo({ ...CASABLANCA, status: 'fallback' }),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    if (geo.lat === null) return;

    const refresh = () => {
      const active = getRequests().filter(r => r.status === 'active');
      // Seeing a request counts as a view, exactly once per browsing session.
      active.forEach(r => addView(r.id, sessionId));
      setRequests(active);
      setLoading(false);
    };

    refresh();
    const interval = setInterval(refresh, 6000);
    return () => clearInterval(interval);
  }, [geo.lat, geo.lng, sessionId]);

  // Distance is derived from the raw list rather than stored, so changing the
  // filters never needs a refetch.
  const visible = useMemo(() => {
    if (geo.lat === null) return [];

    return requests
      .filter(r => filter === 'all' || r.vehicleType === filter)
      .map(r => ({
        ...r,
        distance: Number.isFinite(r.lat) && Number.isFinite(r.lng)
          ? haversine(geo.lat, geo.lng, r.lat, r.lng)
          : null,
      }))
      // `null` means we cannot place the vehicle — keep it, but sort it last.
      .filter(r => r.distance === null || r.distance <= maxDist)
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }, [requests, filter, maxDist, geo.lat, geo.lng]);

  // Close the bid dialog on Escape.
  useEffect(() => {
    if (!modal) return;
    const onKey = e => e.key === 'Escape' && setModal(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]);

  const openModal = (id) => {
    setForm({ price: '', eta: '', message: '' });
    setModal(id);
  };

  const submitProposal = (e) => {
    e.preventDefault();
    const created = createProposal({
      requestId: modal,
      providerName: 'Mon Service',
      price: form.price,
      message: form.message,
      eta: form.eta,
    });

    if (!created) {
      toast('Veuillez saisir un prix valide et un temps d\'arrivée', 'error');
      return;
    }

    toast('Proposition envoyée !', 'success');
    setModal(null);
  };

  const distBadge = (dist) => {
    if (dist === null) return null;
    const cls = dist < 5 ? 'dist-near' : dist < 15 ? 'dist-mid' : 'dist-far';
    return <span className={`dist-badge ${cls}`}><Icon name="map-pin" /> {dist.toFixed(1)} km</span>;
  };

  const typeFilters = [
    { value: 'all', label: 'Toutes', icon: 'filter' },
    ...VEHICLE_TYPES.map(v => ({ value: v.id, label: v.name, icon: v.icon })),
  ];

  return (
    <div className="dash">
      <div className="dash-hdr">
        <div>
          <h1 className="dash-title"><Icon name="wrench" /> Espace Dépanneur</h1>
          <p className="dash-sub">
            {visible.length} {plural(visible.length, 'demande')} à proximité
            {geo.status === 'ok' && <span style={{ color: 'var(--success)', marginLeft: 8 }}>• GPS actif</span>}
            {geo.status === 'fallback' && <span style={{ color: 'var(--warning)', marginLeft: 8 }}>• Position approximative (Casablanca)</span>}
          </p>
        </div>
      </div>

      {geo.status === 'loading' && (
        <div className="geo-loading"><Icon name="loader" className="ic-spin" /> Localisation en cours...</div>
      )}

      {geo.status === 'fallback' && (
        <div className="geo-loading geo-warn">
          <Icon name="alert" /> GPS indisponible — les distances sont calculées depuis le centre de Casablanca.
        </div>
      )}

      {/* Type filters */}
      <div className="filters">
        {typeFilters.map(f => (
          <button key={f.value} className={`fchip ${filter === f.value ? 'on' : ''}`}
                  aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}>
            <Icon name={f.icon} /> {f.label}
          </button>
        ))}
      </div>

      {/* Distance filters */}
      <div className="filters" style={{ marginBottom: 20 }}>
        <span style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginRight: 4 }}>
          <Icon name="map-pin" className="ic-sm" /> Distance max :
        </span>
        {DIST_FILTERS.map(d => (
          <button key={d.label} className={`fchip ${maxDist === d.value ? 'on' : ''}`}
                  aria-pressed={maxDist === d.value} onClick={() => setMaxDist(d.value)}>
            {d.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Icon name="loader" className="ic-xl" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
        </div>
      ) : visible.length > 0 ? (
        <div className="dash-grid">
          {visible.map(r => {
            const vt = VEHICLE_TYPES.find(v => v.id === r.vehicleType) || { icon: 'wrench', name: 'Autre' };
            return (
              <div key={r.id} className="card rq-card">
                <div className="rq-hdr">
                  <span className="rq-badge"><Icon name={vt.icon} /> {vt.name}</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {distBadge(r.distance)}
                    <span className="rq-status active">Active</span>
                  </div>
                </div>
                <h3 className="rq-title">{r.brand || vt.name} — Panne</h3>
                <p className="rq-desc">{r.description}</p>
                <div className="rq-meta">
                  <span className="rq-meta-i"><Icon name="map-pin" /> {r.location}</span>
                  <span className="rq-meta-i"><Icon name="clock" /> {timeAgo(r.createdAt)}</span>
                  <span className="rq-meta-i"><Icon name="user" /> {r.clientName}</span>
                </div>
                <div className="rq-foot">
                  <div className="offer-ct">
                    <span className="ct-badge">{r.viewCount}</span>
                    {plural(r.viewCount, 'vue')}
                  </div>
                  <button className="btn btn-p btn-sm" onClick={() => openModal(r.id)}>
                    <Icon name="dollar" /> Proposer un prix
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <Icon name="search" />
          <h3>Aucune demande trouvée</h3>
          <p>{filter !== 'all' ? 'Aucune demande pour ce type. Essayez un autre filtre.' : 'Élargissez le rayon de recherche pour voir plus de demandes.'}</p>
        </div>
      )}

      {/* Bid dialog */}
      <div className={`modal-bg ${modal ? 'on' : ''}`} onClick={e => e.target === e.currentTarget && setModal(null)}>
        <div className="modal" role="dialog" aria-modal="true" aria-label="Proposer un prix">
          <button className="modal-x" onClick={() => setModal(null)} aria-label="Fermer">&times;</button>
          <h2 className="modal-title"><Icon name="dollar" /> Proposer un prix</h2>
          <form onSubmit={submitProposal}>
            <div className="fg">
              <label className="fl" htmlFor="bid-price">Votre prix (MAD) *</label>
              <div className="price-wrap">
                <span className="price-cur">MAD</span>
                <input id="bid-price" type="number" className="fi price-in" value={form.price}
                       onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                       placeholder="250" min="10" step="10" required />
              </div>
            </div>
            <div className="fg">
              <label className="fl" htmlFor="bid-eta">Temps d&apos;arrivée *</label>
              <select id="bid-eta" className="fs" value={form.eta}
                      onChange={e => setForm(p => ({ ...p, eta: e.target.value }))} required>
                <option value="">Sélectionner...</option>
                {ETA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="fg">
              <label className="fl" htmlFor="bid-msg">Message au client</label>
              <textarea id="bid-msg" className="ft" value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="Décrivez votre expérience, équipement..." />
            </div>
            <button type="submit" className="btn btn-p btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              <Icon name="send" /> Envoyer ma proposition
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

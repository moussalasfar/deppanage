'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, VEHICLE_TYPES, CITIES } from '@/components/Icons';
import { useToast } from '@/components/Toast';
import { createRequest } from '@/lib/store';

export default function DemanderPage() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ vehicleType: '', brand: '', description: '', city: '', address: '' });
  const [geo, setGeo] = useState({ lat: null, lng: null, status: 'idle' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeo(p => ({ ...p, status: 'unsupported' }));
      return;
    }
    setGeo(p => ({ ...p, status: 'loading' }));
    navigator.geolocation.getCurrentPosition(
      pos => setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude, status: 'ok' }),
      () => setGeo({ lat: null, lng: null, status: 'error' }),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const submitRequest = () => {
    if (!form.vehicleType || !form.description || !form.city) {
      toast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    setSubmitting(true);
    const created = createRequest({
      vehicleType: form.vehicleType,
      brand: form.brand,
      description: form.description,
      location: `${form.city}${form.address ? ' - ' + form.address : ''}`,
      lat: geo.lat,
      lng: geo.lng,
      clientName: 'Utilisateur',
    });

    if (!created) {
      toast('Erreur lors de la publication', 'error');
      setSubmitting(false);
      return;
    }

    toast('Demande publiée ! Les offres arrivent bientôt.', 'success');
    router.push(`/demande?id=${created.id}`);
  };

  const geoLabel = () => {
    if (geo.status === 'loading') return (
      <div className="geo-loading"><Icon name="loader" className="ic-spin" /> Recherche de votre position GPS...</div>
    );
    if (geo.status === 'ok') return (
      <div className="geo-loading geo-ok">
        <Icon name="map-pin" /> Position GPS capturée ({geo.lat.toFixed(4)}, {geo.lng.toFixed(4)})
      </div>
    );
    if (geo.status === 'error' || geo.status === 'unsupported') return (
      <div className="geo-loading geo-err">
        <Icon name="alert" /> Géolocalisation indisponible — indiquez une adresse précise ci-dessous
      </div>
    );
    return null;
  };

  const vType = VEHICLE_TYPES.find(v => v.id === form.vehicleType);

  return (
    <div className="section" style={{ maxWidth: 700, margin: '0 auto', paddingTop: 48 }}>
      <div className="sec-hdr" style={{ marginBottom: 20 }}>
        <div className="sec-label">Nouvelle demande</div>
        <h2 className="sec-title">Décrivez votre panne</h2>
        <p className="sec-desc">Remplissez les informations pour recevoir des offres.</p>
      </div>

      {geoLabel()}

      <div className="steps-bar">
        <div className={`step-d ${step >= 1 ? 'on' : ''} ${step > 1 ? 'done' : ''}`} />
        <div className={`step-d ${step >= 2 ? 'on' : ''} ${step > 2 ? 'done' : ''}`} />
        <div className={`step-d ${step >= 3 ? 'on' : ''}`} />
      </div>

      {/* Step 1: Vehicle type */}
      {step === 1 && (
        <div style={{ animation: 'fadeInUp .3s var(--ease)' }}>
          <h3 className="step-title">Type de véhicule</h3>
          <p className="step-sub">Sélectionnez le type de véhicule en panne</p>
          <div className="v-grid" role="radiogroup" aria-label="Type de véhicule">
            {VEHICLE_TYPES.map(v => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={form.vehicleType === v.id}
                className={`v-card ${form.vehicleType === v.id ? 'sel' : ''}`}
                onClick={() => update('vehicleType', v.id)}
              >
                <Icon name={v.icon} className="ic-xl" />
                <span>{v.name}</span>
              </button>
            ))}
          </div>
          <div className="step-nav">
            <div />
            <button className="btn btn-p" onClick={() => setStep(2)} disabled={!form.vehicleType}>
              Suivant <Icon name="arrow-right" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div style={{ animation: 'fadeInUp .3s var(--ease)' }}>
          <h3 className="step-title">Détails de la panne</h3>
          <p className="step-sub">Plus de détails = meilleures propositions</p>
          <div className="fg">
            <label className="fl" htmlFor="brand">Marque &amp; Modèle</label>
            <input id="brand" type="text" className="fi" value={form.brand} maxLength={80}
                   onChange={e => update('brand', e.target.value)}
                   placeholder="ex: Dacia Logan, Honda CB500..." />
          </div>
          <div className="fg">
            <label className="fl" htmlFor="desc">Description du problème *</label>
            <textarea id="desc" className="ft" value={form.description} maxLength={1000}
                      onChange={e => update('description', e.target.value)}
                      placeholder="Décrivez le problème : symptômes, bruits, voyants..." />
          </div>
          <div className="step-nav">
            <button className="btn btn-s" onClick={() => setStep(1)}><Icon name="arrow-left" /> Retour</button>
            <button className="btn btn-p" onClick={() => setStep(3)} disabled={!form.description.trim()}>
              Suivant <Icon name="arrow-right" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Location */}
      {step === 3 && (
        <div style={{ animation: 'fadeInUp .3s var(--ease)' }}>
          <h3 className="step-title">Votre localisation</h3>
          <p className="step-sub">Où se trouve votre véhicule ?</p>
          <div className="fg">
            <label className="fl" htmlFor="city">Ville *</label>
            <select id="city" className="fs" value={form.city} onChange={e => update('city', e.target.value)}>
              <option value="">Sélectionner une ville...</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="fg">
            <label className="fl" htmlFor="address">Adresse précise / Repère</label>
            <input id="address" type="text" className="fi" value={form.address} maxLength={120}
                   onChange={e => update('address', e.target.value)}
                   placeholder="ex: Boulevard Zerktouni, devant Carrefour Market..." />
          </div>

          {/* Recap */}
          <div className="card" style={{ padding: 16, marginTop: 20 }}>
            <h4 className="recap-t"><Icon name="edit" className="ic-sm" /> Récapitulatif</h4>
            <div className="recap-list">
              {vType && <span><Icon name={vType.icon} className="ic-sm" /> <strong>Type :</strong> {vType.name}</span>}
              {form.brand && <span><strong>Véhicule :</strong> {form.brand}</span>}
              {form.description && <span><strong>Problème :</strong> {form.description.substring(0, 80)}{form.description.length > 80 ? '...' : ''}</span>}
              {geo.status === 'ok' && <span><Icon name="map-pin" className="ic-sm" /> <strong>GPS :</strong> {geo.lat.toFixed(4)}, {geo.lng.toFixed(4)}</span>}
            </div>
          </div>

          <div className="step-nav">
            <button className="btn btn-s" onClick={() => setStep(2)}><Icon name="arrow-left" /> Retour</button>
            <button className="btn btn-p btn-lg" onClick={submitRequest} disabled={submitting || !form.city}>
              <Icon name="send" /> {submitting ? 'Publication...' : 'Publier ma demande'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

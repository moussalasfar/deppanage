'use client';
// Client-side data store for the dépannage platform.
// State lives in localStorage so the app works as a fully static site
// (GitHub Pages / Netlify / Vercel) with no server and no database.

const KEY = 'depanvite_v1';

const empty = () => ({ requests: [], proposals: [], views: {}, pending: [] });

// --- persistence -------------------------------------------------------

function read() {
  if (typeof window === 'undefined') return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const seeded = seed();
      write(seeded);
      return seeded;
    }
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return seed();
  }
}

function write(state) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or private mode — keep working in memory for this session
  }
}

// Read-only access. Only touches localStorage if materialize() revealed a
// pending offer — otherwise the 3s pollers would rewrite the whole state
// several times a second for nothing.
function query(fn) {
  const state = read();
  const changed = materialize(state);
  const result = fn(state);
  if (changed) write(state);
  return result;
}

// Read, mutate, persist. Returns whatever the mutator returns.
function mutate(fn) {
  const state = read();
  materialize(state);
  const result = fn(state);
  write(state);
  return result;
}

// --- demo data (realistic Moroccan GPS coordinates) --------------------

function seed() {
  const ago = (ms) => new Date(Date.now() - ms).toISOString();

  return {
    requests: [
      {
        id: 'req_001',
        vehicleType: 'automobile',
        brand: 'Dacia Logan',
        description: 'Ma voiture ne démarre plus, je pense que c\'est un problème de batterie. Je suis stationné sur le côté de la route.',
        location: 'Casablanca - Boulevard Zerktouni',
        lat: 33.5731,
        lng: -7.5898,
        status: 'active',
        clientName: 'Ahmed',
        createdAt: ago(1800000),
      },
      {
        id: 'req_002',
        vehicleType: 'moto',
        brand: 'Honda CB500',
        description: 'Pneu crevé en pleine route, besoin d\'aide pour le changement ou remorquage vers le mécanicien le plus proche.',
        location: 'Rabat - Avenue Mohammed V',
        lat: 34.0209,
        lng: -6.8416,
        status: 'active',
        clientName: 'Youssef',
        createdAt: ago(3600000),
      },
      {
        id: 'req_003',
        vehicleType: 'camion',
        brand: 'Renault Master',
        description: 'Panne moteur sur l\'autoroute. Le camion est chargé, besoin d\'un dépanneur avec capacité de remorquage lourd.',
        location: 'Autoroute Casablanca-Rabat, KM 45',
        lat: 33.8,
        lng: -7.2,
        status: 'active',
        clientName: 'Karim',
        createdAt: ago(7200000),
      },
      {
        id: 'req_004',
        vehicleType: 'automobile',
        brand: 'Renault Clio',
        description: 'Surchauffe du moteur, voyant rouge allumé. Je suis garé devant le centre commercial.',
        location: 'Marrakech - Gueliz',
        lat: 31.6295,
        lng: -8.0083,
        status: 'active',
        clientName: 'Fatima',
        createdAt: ago(900000),
      },
      {
        id: 'req_005',
        vehicleType: 'tracteur',
        brand: 'Massey Ferguson',
        description: 'Tracteur en panne au milieu du champ. Problème hydraulique, impossible de le déplacer.',
        location: 'Meknès - Route de Fès',
        lat: 33.8935,
        lng: -5.5473,
        status: 'active',
        clientName: 'Hassan',
        createdAt: ago(5400000),
      },
    ],

    proposals: [
      {
        id: 'prop_001', requestId: 'req_001',
        providerName: 'Mohamed Remorquage', price: 250,
        message: 'Je suis à 10 min de vous. Équipement complet pour diagnostic batterie.',
        rating: 4.8, reviewCount: 127, eta: '10 min', status: 'pending',
        createdAt: ago(1200000),
      },
      {
        id: 'prop_002', requestId: 'req_001',
        providerName: 'Auto Secours Express', price: 200,
        message: 'Spécialiste batterie et démarrage. Prix tout compris.',
        rating: 4.5, reviewCount: 89, eta: '15 min', status: 'pending',
        createdAt: ago(900000),
      },
      {
        id: 'prop_003', requestId: 'req_001',
        providerName: 'SOS Dépannage', price: 300,
        message: 'Dépanneur certifié, je peux aussi remorquer si nécessaire.',
        rating: 4.9, reviewCount: 215, eta: '8 min', status: 'pending',
        createdAt: ago(600000),
      },
      {
        id: 'prop_004', requestId: 'req_002',
        providerName: 'Flash Assistance', price: 150,
        message: 'Spécialiste moto. Arrivée rapide.',
        rating: 4.6, reviewCount: 64, eta: '12 min', status: 'pending',
        createdAt: ago(3000000),
      },
      {
        id: 'prop_005', requestId: 'req_003',
        providerName: 'Dépan Pro 24/7', price: 800,
        message: 'Dépanneuse poids lourd. Capacité 5 tonnes.',
        rating: 4.7, reviewCount: 178, eta: '25 min', status: 'pending',
        createdAt: ago(6000000),
      },
      {
        id: 'prop_006', requestId: 'req_004',
        providerName: 'Karim Auto Service', price: 180,
        message: 'Mécanicien expérimenté, diagnostic sur place.',
        rating: 4.4, reviewCount: 52, eta: '18 min', status: 'pending',
        createdAt: ago(400000),
      },
    ],

    views: {
      req_001: ['s1', 's2', 's3', 's4', 's5', 's6', 's7'],
      req_002: ['s1', 's3', 's5'],
      req_003: ['s2', 's4'],
      req_004: ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12'],
      req_005: ['s1'],
    },

    pending: [],
  };
}

// --- simulated incoming offers -----------------------------------------

const PROVIDER_NAMES = [
  'Mohamed Remorquage', 'Auto Secours Express', 'SOS Dépannage',
  'Flash Assistance', 'Dépan Pro 24/7', 'Mehdi Mécanique',
  'Atlas Remorquage', 'Rapide Dépannage', 'Karim Auto Service',
  'Express Panne', 'Nabil Assistance', 'Top Dépannage',
];

const MESSAGES = [
  'Je suis disponible immédiatement. Équipement professionnel.',
  'Dépanneur certifié avec 10 ans d\'expérience.',
  'Arrivée rapide garantie. Pas de frais cachés.',
  'Je connais bien le secteur. Travail propre et rapide.',
  'Disponible 24/7. Satisfaction garantie.',
  'Dépannage express avec tout le matériel nécessaire.',
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const BASE_PRICES = { camion: 600, bus: 700, tracteur: 500, moto: 120 };

// Offers are generated up front with a scheduled reveal time, then surfaced
// by materialize() as that time passes. This survives reloads and navigation,
// unlike a setTimeout that only lives as long as one page view.
function scheduleOffers(state, request) {
  const base = BASE_PRICES[request.vehicleType] || 200;
  const delays = [4000, 18000, 45000, 95000].slice(0, 2 + Math.floor(Math.random() * 3));

  delays.forEach((delay, i) => {
    state.pending.push({
      at: Date.now() + delay,
      requestId: request.id,
      providerName: pick(PROVIDER_NAMES),
      price: Math.round((base * (0.7 + Math.random() * 0.8)) / 10) * 10,
      message: pick(MESSAGES),
      eta: (5 + Math.floor(Math.random() * 30)) + ' min',
      viewers: 1 + Math.floor(Math.random() * 3),
      seq: i,
    });
  });
}

// Turn any due pending offers into real proposals. Called on every read.
function materialize(state) {
  if (!state.pending.length) return false;

  const now = Date.now();
  const due = state.pending.filter(p => p.at <= now);
  if (!due.length) return false;

  state.pending = state.pending.filter(p => p.at > now);

  due.forEach(p => {
    const request = state.requests.find(r => r.id === p.requestId);
    if (!request || request.status !== 'active') return;

    state.proposals.unshift(buildProposal(state, p));

    // A few dépanneurs looked at the request without bidding.
    const seen = state.views[p.requestId] || (state.views[p.requestId] = []);
    for (let i = 0; i < p.viewers; i++) seen.push(`sim_${p.requestId}_${p.seq}_${i}`);
  });

  return true;
}

function buildProposal(state, data) {
  return {
    id: 'prop_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7),
    requestId: data.requestId,
    providerName: data.providerName || 'Dépanneur',
    price: data.price,
    message: data.message || '',
    rating: data.rating ?? Number((4 + Math.random()).toFixed(1)),
    reviewCount: data.reviewCount ?? Math.floor(20 + Math.random() * 100),
    eta: data.eta,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

// --- requests ----------------------------------------------------------

// Each request is returned with its live viewCount and proposalCount so the
// dashboard cards can render counts without a second lookup.
export function getRequests() {
  return query(state => state.requests.map(r => ({
    ...r,
    viewCount: (state.views[r.id] || []).length,
    proposalCount: state.proposals.filter(p => p.requestId === r.id).length,
  })));
}

export function getRequestById(id) {
  return getRequests().find(r => r.id === id) || null;
}

export function createRequest(data) {
  const lat = Number(data.lat);
  const lng = Number(data.lng);

  return mutate(state => {
    const request = {
      id: 'req_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7),
      vehicleType: data.vehicleType,
      brand: (data.brand || '').slice(0, 80),
      description: (data.description || '').slice(0, 1000),
      location: (data.location || '').slice(0, 160),
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
      status: 'active',
      clientName: data.clientName || 'Utilisateur',
      createdAt: new Date().toISOString(),
    };

    state.requests.unshift(request);
    state.views[request.id] = [];
    scheduleOffers(state, request);

    return request;
  });
}

// --- proposals ---------------------------------------------------------

// Always a fresh array — callers sort the result in place.
export function getProposals(requestId) {
  return query(state => requestId
    ? state.proposals.filter(p => p.requestId === requestId)
    : [...state.proposals]);
}

export function createProposal(data) {
  const price = Number(data.price);
  if (!data.requestId || !Number.isFinite(price) || price <= 0 || !data.eta) return null;

  return mutate(state => {
    const proposal = buildProposal(state, { ...data, price: Math.round(price) });
    state.proposals.unshift(proposal);
    return proposal;
  });
}

export function acceptProposal(proposalId) {
  return mutate(state => {
    const proposal = state.proposals.find(p => p.id === proposalId);
    if (!proposal) return null;

    // Accepting one offer declines the others on the same request.
    state.proposals.forEach(p => {
      if (p.requestId === proposal.requestId) {
        p.status = p.id === proposalId ? 'accepted' : 'rejected';
      }
    });

    const request = state.requests.find(r => r.id === proposal.requestId);
    if (request) request.status = 'completed';
    state.pending = state.pending.filter(p => p.requestId !== proposal.requestId);

    return proposal;
  });
}

export function rejectProposal(proposalId) {
  return mutate(state => {
    const proposal = state.proposals.find(p => p.id === proposalId);
    if (proposal) proposal.status = 'rejected';
    return proposal;
  });
}

// --- views -------------------------------------------------------------

// Called on a 6s loop for every visible request, so a repeat view must not
// cost a localStorage write.
export function addView(requestId, sessionId) {
  const state = read();
  const revealed = materialize(state);
  const seen = state.views[requestId] || (state.views[requestId] = []);

  const isNew = !seen.includes(sessionId);
  if (isNew) seen.push(sessionId);
  if (isNew || revealed) write(state);

  return seen.length;
}

export function getViewCount(requestId) {
  return query(state => (state.views[requestId] || []).length);
}

// --- utilities ---------------------------------------------------------

export function resetStore() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}

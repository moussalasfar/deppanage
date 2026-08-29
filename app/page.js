import Link from 'next/link';
import { Icon, VEHICLE_TYPES } from '@/components/Icons';

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="pulse-dot" />
            Plateforme #1 de dépannage au Maroc
          </div>
          <h1>
            En panne ?<br />
            <span className="grad">Recevez des offres</span><br />
            en quelques secondes
          </h1>
          <p className="hero-sub">
            Postez votre demande de dépannage et recevez des propositions de prix
            en temps réel de dépanneurs vérifiés près de vous.
          </p>
          <div className="hero-actions">
            <Link href="/demander" className="btn btn-p btn-lg">
              <Icon name="alert" /> Demander un dépannage
            </Link>
            <Link href="/depanneur" className="btn btn-s btn-lg">
              <Icon name="wrench" /> Je suis dépanneur
            </Link>
          </div>
          <div className="hero-stats">
            <div><div className="stat-val">2,500+</div><div className="stat-lbl">Dépanneurs actifs</div></div>
            <div><div className="stat-val">15,000+</div><div className="stat-lbl">Pannes résolues</div></div>
            <div><div className="stat-val">4.8/5</div><div className="stat-lbl">Note moyenne</div></div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="section">
        <div className="sec-hdr">
          <div className="sec-label">Comment ça marche</div>
          <h2 className="sec-title">Simple comme 1-2-3</h2>
          <p className="sec-desc">Notre système vous dépanne le plus rapidement possible.</p>
        </div>
        <div className="steps-grid">
          {[
            { n: '01', icon: 'edit', t: 'Décrivez votre panne', d: 'Sélectionnez le type de véhicule, décrivez le problème et partagez votre position GPS.' },
            { n: '02', icon: 'dollar', t: 'Recevez des offres', d: 'Les dépanneurs à proximité vous envoient leurs propositions de prix en temps réel.' },
            { n: '03', icon: 'check', t: 'Choisissez & partez', d: 'Comparez les prix, les notes et les ETA. Acceptez la meilleure offre.' },
          ].map((s, i) => (
            <div key={i} className="card stp-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="stp-num">{s.n}</div>
              <div className="stp-ico"><Icon name={s.icon} /></div>
              <h3 className="stp-t">{s.t}</h3>
              <p className="stp-d">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vehicles */}
      <section className="section">
        <div className="sec-hdr">
          <div className="sec-label">Tous véhicules</div>
          <h2 className="sec-title">Quel que soit votre véhicule</h2>
        </div>
        <div className="v-grid" style={{ maxWidth: 680, margin: '0 auto' }}>
          {VEHICLE_TYPES.map((v, i) => (
            <div key={v.id} className="card v-card" style={{ cursor: 'default', animation: `fadeInUp .4s var(--ease) ${i * .06}s both` }}>
              <Icon name={v.icon} className="ic-xl" />
              <span>{v.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="sec-hdr">
          <div className="sec-label">Pourquoi DepanVite</div>
          <h2 className="sec-title">La plateforme qui change tout</h2>
        </div>
        <div className="feat-grid">
          {[
            { icon: 'zap', t: 'Ultra rapide', d: 'Recevez votre première offre en moins de 2 minutes.' },
            { icon: 'dollar', t: 'Prix compétitifs', d: 'Les dépanneurs se font concurrence pour vous offrir le meilleur prix.' },
            { icon: 'shield', t: 'Dépanneurs vérifiés', d: 'Tous notés et vérifiés par la communauté.' },
            { icon: 'map-pin', t: 'Géolocalisation GPS', d: 'Votre position exacte est partagée pour un dépannage ultra précis.' },
            { icon: 'eye', t: 'Suivi en temps réel', d: 'Voyez combien de dépanneurs ont vu votre demande, comme inDrive.' },
            { icon: 'lock', t: 'Paiement sécurisé', d: 'Prix fixé avant l\'intervention. Pas de surprises.' },
          ].map((f, i) => (
            <div key={i} className="card feat-card">
              <div className="feat-ico"><Icon name={f.icon} /></div>
              <h3 className="feat-t">{f.t}</h3>
              <p className="feat-d">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: 650, margin: '0 auto', padding: '48px 32px' }}>
          <h2 className="sec-title" style={{ marginBottom: 12 }}>Prêt à être dépanné ?</h2>
          <p className="sec-desc" style={{ marginBottom: 24 }}>
            Postez votre première demande et recevez des offres en quelques secondes.
          </p>
          <Link href="/demander" className="btn btn-p btn-lg">
            <Icon name="rocket" /> Commencer maintenant
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Icon name="bolt" /> Depan<span style={{ color: 'var(--accent)' }}>Vite</span>
          </div>
          <div className="footer-links">
            <a href="#">À propos</a>
            <a href="#">Contact</a>
            <a href="#">Conditions</a>
          </div>
          <p className="footer-copy">© 2026 DepanVite. Tous droits réservés.</p>
        </div>
      </footer>
    </>
  );
}

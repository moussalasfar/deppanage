'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './Icons';

const LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/demander', label: 'Demander' },
  { href: '/dashboard', label: 'Mes Demandes' },
  { href: '/depanneur', label: 'Espace Dépanneur' },
];

// The toggle is a shortcut between the two sides of the marketplace, and
// reflects which one you are currently on.
const MODES = [
  { id: 'client', href: '/dashboard', label: 'Client', icon: 'car' },
  { id: 'provider', href: '/depanneur', label: 'Dépanneur', icon: 'wrench' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever navigation lands on a new page.
  useEffect(() => setMenuOpen(false), [pathname]);

  // trailingSlash makes usePathname() return "/demander/", so strip the slash
  // before comparing against the hrefs above.
  const here = pathname.replace(/\/+$/, '') || '/';
  const mode = here === '/depanneur' ? 'provider' : 'client';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-logo">
          <Icon name="bolt" className="ic-md" style={{ color: 'var(--accent)' }} />
          <span>Depan<span className="logo-hi">Vite</span></span>
        </Link>

        <div className={`nav-links ${menuOpen ? 'show' : ''}`}>
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link ${here === l.href ? 'active' : ''}`}
              aria-current={here === l.href ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="nav-right">
          <div className="mode-toggle">
            {MODES.map(m => (
              <Link key={m.id} href={m.href} className={`mode-btn ${mode === m.id ? 'active' : ''}`}>
                <Icon name={m.icon} /> {m.label}
              </Link>
            ))}
          </div>
          <button
            className={`hamburger ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}

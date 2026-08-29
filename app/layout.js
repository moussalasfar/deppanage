import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { ToastProvider } from '@/components/Toast';

// Self-hosted at build time: no request to fonts.googleapis.com at runtime,
// no layout shift, and it keeps working on a static host.
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'DepanVite — Dépannage Rapide & Prix Compétitifs',
  description: 'Plateforme de dépannage rapide au Maroc. Trouvez un dépanneur près de chez vous et recevez des offres en temps réel.',
};

export const viewport = {
  themeColor: '#0b1121',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <ToastProvider>
          <Navbar />
          <main className="main">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}

import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, Share2, Send } from 'lucide-react';

import { Logo } from './Logo';

const FOOTER_LINKS = [
  { to: '/products', label: 'Catalogue' },
  { to: '/products#vedettes', label: 'Vedettes' },
  { to: '/cart', label: 'Panier' },
  { to: '/login', label: 'Connexion' },
];

const INFO_LINKS = [
  { to: '#', label: 'Livraison' },
  { to: '#', label: 'Paiement' },
  { to: '#', label: 'FAQ' },
  { to: '#', label: 'CGV' },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr]">
          
          {/* Marque */}
          <div>
            <Logo to="/" size="md" className="h-10" />
            <p className="mt-4 text-sm leading-relaxed text-white/70 max-w-xs">
              Goodies personnalisés de qualité pour vos projets de marque.
              Paiement CinetPay et livraison partout au Togo.
            </p>
            <div className="mt-4 flex gap-3">
              {[Heart, Share2, Send].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-accent hover:bg-accent hover:text-white"
                  aria-label={`Réseau social ${i + 1}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white">Navigation</h4>
            <ul className="mt-4 space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/70 transition hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Infos */}
          <div>
            <h4 className="text-sm font-bold text-white">Infos</h4>
            <ul className="mt-4 space-y-2">
              {INFO_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.to}
                    className="text-sm text-white/70 transition hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white">Contact</h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2 text-sm text-white/70">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                Worlddesign45@gmail.com
              </li>
              <li className="flex items-center gap-2 text-sm text-white/70">
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                +228 92 45 58 00
              </li>
              <li className="flex items-start gap-2 text-sm text-white/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                Lomé, Togo
              </li>
            </ul>
            <p className="mt-3 text-xs text-white/50">
              WORLD DESIGN WD SARL U
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} WORLD DESIGN. Tous droits réservés.
          </p>
          <p className="inline-flex items-center gap-1 text-xs text-white/50">
            Fabriqué avec <Heart className="h-3 w-3 fill-accent/30 text-accent/30" /> au Togo
          </p>
        </div>
      </div>
    </footer>
  );
}

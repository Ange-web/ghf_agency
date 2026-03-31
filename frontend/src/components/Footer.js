import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer py-16" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-baseline gap-0.5 text-2xl font-bold tracking-wider mb-4">
              <span className="text-[#FF2A85]">GHF</span>
              <span className="text-white">_</span>
              <span className="text-[#D4AF37]">AGENCY</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">
              L'agence événementielle qui transforme vos nuits en expériences inoubliables.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/40 hover:text-[#FF2A85] transition-colors"
                data-testid="social-instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/40 hover:text-[#FF2A85] transition-colors"
                data-testid="social-twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/40 hover:text-[#FF2A85] transition-colors"
                data-testid="social-youtube"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wide">Navigation</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-white/50 hover:text-white text-sm transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-white/50 hover:text-white text-sm transition-colors">
                  Événements
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-white/50 hover:text-white text-sm transition-colors">
                  Galerie
                </Link>
              </li>
              <li>
                <Link to="/contests" className="text-white/50 hover:text-white text-sm transition-colors">
                  Concours
                </Link>
              </li>
              <li>
                <Link to="/booking" className="text-white/50 hover:text-white text-sm transition-colors">
                  Réservation
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wide">Informations</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-white/50 hover:text-white text-sm transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white/50 hover:text-white text-sm transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-white/50 hover:text-white text-sm transition-colors">
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-white/50 hover:text-white text-sm transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wide">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/50 text-sm">
                <MapPin size={16} className="text-[#FF2A85]" />
                Paris, France
              </li>
              <li className="flex items-center gap-3 text-white/50 text-sm">
                <Phone size={16} className="text-[#FF2A85]" />
                +33 1 23 45 67 89
              </li>
              <li className="flex items-center gap-3 text-white/50 text-sm">
                <Mail size={16} className="text-[#FF2A85]" />
                contact@ghfagency.com
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} GHF Agency. Tous droits réservés.
          </p>
          <p className="text-white/30 text-sm">
            Crafted with <span className="text-[#FF2A85]">♥</span> in Paris
          </p>
        </div>
      </div>
    </footer>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Calendar, Image, Trophy, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/events', label: 'Événements', icon: Calendar },
  { href: '/gallery', label: 'Galerie', icon: Image },
  { href: '/contests', label: 'Concours', icon: Trophy },
];

export default function Header({ onAuthClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <>
      <header 
        className={`header-glass transition-all duration-300 ${
          isScrolled ? 'py-3' : 'py-4'
        }`}
        data-testid="header"
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-baseline gap-0.5 text-xl font-bold tracking-wider"
            data-testid="header-logo"
          >
            <span className="text-[#FF2A85]">GHF</span>
            <span className="text-white">_</span>
            <span className="text-[#D4AF37]">AGENCY</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8" data-testid="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  location.pathname === link.href
                    ? 'text-[#FF2A85]'
                    : 'text-white/70 hover:text-white'
                }`}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                  data-testid="profile-link"
                >
                  <User size={18} />
                  <span>{user?.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-white/70 hover:text-[#FF2A85] transition-colors"
                  data-testid="logout-btn"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="btn-primary px-6 py-2 rounded-full text-sm"
                data-testid="login-btn"
              >
                Connexion
              </button>
            )}
            <Link
              to="/booking"
              className="btn-secondary px-6 py-2 rounded-full text-sm"
              data-testid="booking-btn"
            >
              Réserver
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(true)}
            data-testid="mobile-menu-btn"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-menu flex flex-col"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            data-testid="mobile-menu"
          >
            {/* Close Button */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-white p-2"
                data-testid="close-menu-btn"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 flex flex-col items-center justify-center gap-8">
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      className={`flex items-center gap-3 text-2xl font-semibold tracking-wide ${
                        location.pathname === link.href
                          ? 'text-[#FF2A85]'
                          : 'text-white'
                      }`}
                      data-testid={`mobile-nav-${link.label.toLowerCase()}`}
                    >
                      <Icon size={24} />
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Mobile Actions */}
            <div className="p-6 space-y-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center justify-center gap-2 w-full py-3 text-white border border-white/20 rounded-full"
                    data-testid="mobile-profile-link"
                  >
                    <User size={18} />
                    {user?.name}
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center justify-center gap-2 w-full py-3 text-white/70"
                    data-testid="mobile-logout-btn"
                  >
                    <LogOut size={18} />
                    Déconnexion
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onAuthClick();
                  }}
                  className="btn-primary w-full py-3 rounded-full"
                  data-testid="mobile-login-btn"
                >
                  Connexion
                </button>
              )}
              <Link
                to="/booking"
                className="btn-secondary block text-center w-full py-3 rounded-full"
                data-testid="mobile-booking-btn"
              >
                Réserver
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

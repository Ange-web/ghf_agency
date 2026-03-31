import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, User, Phone, Mail, Users, MessageSquare, Check, Loader2, ArrowLeft, Star } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function TableVIPPage({ onAuthClick }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    guests: 4,
    special_requests: ''
  });

  const eventId = searchParams.get('event');

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    } else {
      navigate('/events');
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/events/${eventId}`);
      if (!data.has_table_vip) {
        navigate(`/events/${eventId}`);
        return;
      }
      setEvent(data);
    } catch (error) {
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value) || 1 : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      onAuthClick();
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await axios.post(`${API_URL}/api/tables/reserve`, {
        event_id: eventId,
        table_type: 'vip',
        ...formData
      }, { withCredentials: true });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center px-4" data-testid="table-vip-success">
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#D4AF37] to-[#B8962E] rounded-full flex items-center justify-center mb-6">
            <Crown size={40} className="text-black" />
          </div>
          <h2 className="heading-md text-white mb-4">Table VIP réservée !</h2>
          <p className="text-white/60 mb-2">
            Votre expérience VIP pour <span className="text-[#D4AF37]">{event?.title}</span> est confirmée.
          </p>
          <p className="text-2xl font-bold text-[#D4AF37] mb-6">{event?.table_vip_price}€</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/profile')}
              className="bg-[#D4AF37] text-black px-6 py-3 rounded-full font-bold hover:bg-[#E5C048] transition-colors"
            >
              Voir mes réservations
            </button>
            <button
              onClick={() => navigate('/events')}
              className="btn-secondary px-6 py-3 rounded-full"
            >
              Autres événements
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20" data-testid="table-vip-page">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            Retour
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
              <Crown className="text-[#D4AF37]" size={28} />
            </div>
            <div>
              <span className="text-[#D4AF37] text-xs uppercase tracking-[0.2em]">
                Expérience Premium
              </span>
              <h1 className="heading-lg text-white">Table VIP</h1>
            </div>
          </div>
          
          {event && (
            <div className="bg-gradient-to-r from-[#0F0F13] to-[#1A1A24] rounded-xl p-4 border border-[#D4AF37]/30 mt-6">
              <div className="flex items-center gap-4">
                <img
                  src={event.image_url || 'https://images.pexels.com/photos/11481894/pexels-photo-11481894.jpeg'}
                  alt={event.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h3 className="text-white font-bold">{event.title}</h3>
                  <p className="text-white/50 text-sm">
                    {new Date(event.date).toLocaleDateString('fr-FR')} • {event.location}
                  </p>
                  <p className="text-[#D4AF37] font-bold mt-1">{event.table_vip_price}€ / table</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-[#0F0F13] to-[#1A1A24] rounded-xl p-6 border border-[#D4AF37]/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Star className="text-[#D4AF37]" size={20} />
            Informations de réservation VIP
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-white/70 mb-2">Nom complet *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  className="form-input w-full pl-12 pr-4 py-3 rounded-lg border-[#D4AF37]/20 focus:border-[#D4AF37]"
                  required
                  data-testid="vip-name-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">Téléphone *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+33 6 12 34 56 78"
                  className="form-input w-full pl-12 pr-4 py-3 rounded-lg border-[#D4AF37]/20 focus:border-[#D4AF37]"
                  required
                  data-testid="vip-phone-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">Email *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  className="form-input w-full pl-12 pr-4 py-3 rounded-lg border-[#D4AF37]/20 focus:border-[#D4AF37]"
                  required
                  data-testid="vip-email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">Nombre de personnes *</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className="form-input w-full pl-12 pr-4 py-3 rounded-lg border-[#D4AF37]/20 focus:border-[#D4AF37]"
                  required
                  data-testid="vip-guests-input"
                />
              </div>
              <p className="text-xs text-white/40 mt-1">Maximum 10 personnes par table VIP</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-white/70 mb-2">Demandes spéciales</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 text-white/40" size={18} />
                <textarea
                  name="special_requests"
                  value={formData.special_requests}
                  onChange={handleChange}
                  placeholder="Champagne spécifique, décoration, occasion spéciale..."
                  rows={3}
                  className="form-input w-full pl-12 pr-4 py-3 rounded-lg resize-none border-[#D4AF37]/20 focus:border-[#D4AF37]"
                  data-testid="vip-requests-input"
                />
              </div>
            </div>
          </div>

          {/* VIP Inclusions */}
          <div className="mt-6 p-4 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/30">
            <h3 className="text-[#D4AF37] font-medium mb-3 flex items-center gap-2">
              <Crown size={18} />
              L'expérience VIP inclut :
            </h3>
            <div className="grid md:grid-cols-2 gap-2 text-white/70 text-sm">
              <div>• Emplacement premium jusqu'à 10 personnes</div>
              <div>• 2 bouteilles de champagne offertes</div>
              <div>• Service personnalisé dédié</div>
              <div>• Accès backstage</div>
              <div>• Coupe-file à l'entrée</div>
              <div>• Vestiaire VIP gratuit</div>
            </div>
          </div>

          {error && (
            <motion.p
              className="text-red-400 text-sm mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#D4AF37]/20">
            <div>
              <p className="text-white/50 text-sm">Total à payer</p>
              <p className="text-3xl font-bold text-[#D4AF37]">{event?.table_vip_price}€</p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#D4AF37] text-black px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#E5C048] transition-colors disabled:opacity-50"
              data-testid="submit-table-vip-btn"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Réservation...
                </>
              ) : isAuthenticated ? (
                <>
                  <Crown size={20} />
                  Confirmer VIP
                </>
              ) : (
                'Se connecter pour réserver'
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

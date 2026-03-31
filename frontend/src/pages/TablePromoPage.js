import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, User, Phone, Mail, Users, MessageSquare, Check, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function TablePromoPage({ onAuthClick }) {
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
      if (!data.has_table_promo) {
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
        table_type: 'promo',
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
        <Loader2 className="animate-spin text-[#FF2A85]" size={48} />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center px-4" data-testid="table-promo-success">
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#FF2A85] to-[#D4AF37] rounded-full flex items-center justify-center mb-6">
            <Check size={40} className="text-white" />
          </div>
          <h2 className="heading-md text-white mb-4">Table Promo réservée !</h2>
          <p className="text-white/60 mb-2">
            Votre table promo pour <span className="text-[#FF2A85]">{event?.title}</span> est confirmée.
          </p>
          <p className="text-2xl font-bold text-[#D4AF37] mb-6">{event?.table_promo_price}€</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/profile')}
              className="btn-primary px-6 py-3 rounded-full"
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
    <div className="min-h-screen pt-24 pb-20" data-testid="table-promo-page">
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
            <div className="w-14 h-14 rounded-full bg-[#FF2A85]/20 flex items-center justify-center">
              <Sparkles className="text-[#FF2A85]" size={28} />
            </div>
            <div>
              <span className="text-[#FF2A85] text-xs uppercase tracking-[0.2em]">
                Réservation
              </span>
              <h1 className="heading-lg text-white">Table Promo</h1>
            </div>
          </div>
          
          {event && (
            <div className="bg-[#0F0F13] rounded-xl p-4 border border-white/10 mt-6">
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
                  <p className="text-[#FF2A85] font-bold mt-1">{event.table_promo_price}€ / table</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-[#0F0F13] rounded-xl p-6 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-bold text-white mb-6">Informations de réservation</h2>
          
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
                  className="form-input w-full pl-12 pr-4 py-3 rounded-lg"
                  required
                  data-testid="table-name-input"
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
                  className="form-input w-full pl-12 pr-4 py-3 rounded-lg"
                  required
                  data-testid="table-phone-input"
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
                  className="form-input w-full pl-12 pr-4 py-3 rounded-lg"
                  required
                  data-testid="table-email-input"
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
                  max="6"
                  className="form-input w-full pl-12 pr-4 py-3 rounded-lg"
                  required
                  data-testid="table-guests-input"
                />
              </div>
              <p className="text-xs text-white/40 mt-1">Maximum 6 personnes par table promo</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-white/70 mb-2">Demandes spéciales</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 text-white/40" size={18} />
                <textarea
                  name="special_requests"
                  value={formData.special_requests}
                  onChange={handleChange}
                  placeholder="Anniversaire, occasion spéciale..."
                  rows={3}
                  className="form-input w-full pl-12 pr-4 py-3 rounded-lg resize-none"
                  data-testid="table-requests-input"
                />
              </div>
            </div>
          </div>

          {/* Inclusions */}
          <div className="mt-6 p-4 bg-[#FF2A85]/10 rounded-lg border border-[#FF2A85]/20">
            <h3 className="text-white font-medium mb-2">La Table Promo inclut :</h3>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Emplacement réservé pour 6 personnes max</li>
              <li>• Service prioritaire</li>
              <li>• 1 bouteille offerte</li>
            </ul>
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

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
            <div>
              <p className="text-white/50 text-sm">Total à payer</p>
              <p className="text-2xl font-bold text-[#FF2A85]">{event?.table_promo_price}€</p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-8 py-3 rounded-lg flex items-center gap-2"
              data-testid="submit-table-promo-btn"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Réservation...
                </>
              ) : isAuthenticated ? (
                'Confirmer la réservation'
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

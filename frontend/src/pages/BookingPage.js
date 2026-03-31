import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, Phone, MessageSquare, Check, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function BookingPage({ onAuthClick }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    event_id: searchParams.get('event') || '',
    guests: 1,
    phone: '',
    special_requests: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/events`);
      setEvents(data);
      
      // Pre-select event from URL if exists
      const eventId = searchParams.get('event');
      if (eventId && data.find(e => e.id === eventId)) {
        setFormData(prev => ({ ...prev, event_id: eventId }));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
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
    
    if (!formData.event_id) {
      setError('Veuillez sélectionner un événement');
      return;
    }
    
    if (!formData.phone) {
      setError('Veuillez entrer votre numéro de téléphone');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await axios.post(`${API_URL}/api/reservations`, formData, {
        withCredentials: true
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEvent = events.find(e => e.id === formData.event_id);

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center px-4" data-testid="booking-success">
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#FF2A85] to-[#D4AF37] rounded-full flex items-center justify-center mb-6">
            <Check size={40} className="text-white" />
          </div>
          <h2 className="heading-md text-white mb-4">Réservation confirmée !</h2>
          <p className="text-white/60 mb-8">
            Votre réservation pour <span className="text-[#FF2A85]">{selectedEvent?.title}</span> a été confirmée. 
            Vous recevrez un email de confirmation avec tous les détails.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/profile')}
              className="btn-primary px-6 py-3 rounded-full"
              data-testid="view-reservations-btn"
            >
              Voir mes réservations
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setFormData({ event_id: '', guests: 1, phone: '', special_requests: '' });
              }}
              className="btn-secondary px-6 py-3 rounded-full"
              data-testid="new-booking-btn"
            >
              Nouvelle réservation
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20" data-testid="booking-page">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mb-12"
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
          <span className="text-[#D4AF37] text-xs uppercase tracking-[0.2em]">
            Réservation
          </span>
          <h1 className="heading-lg text-white mt-2">Réserver votre place</h1>
          <p className="text-white/60 mt-4">
            Remplissez le formulaire ci-dessous pour réserver votre place à l'événement de votre choix.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Event Selection */}
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Événement *
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <select
                  name="event_id"
                  value={formData.event_id}
                  onChange={handleChange}
                  className="form-input w-full pl-12 pr-4 py-3 rounded-lg appearance-none cursor-pointer"
                  required
                  data-testid="event-select"
                >
                  <option value="">Sélectionnez un événement</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} - {new Date(event.date).toLocaleDateString('fr-FR')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Number of Guests */}
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Nombre de personnes *
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  min="1"
                  max={selectedEvent?.available_spots || 10}
                  className="form-input w-full pl-12 pr-4 py-3 rounded-lg"
                  required
                  data-testid="guests-input"
                />
              </div>
              {selectedEvent && (
                <p className="text-xs text-white/40 mt-1">
                  {selectedEvent.available_spots} places disponibles
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Téléphone *
              </label>
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
                  data-testid="phone-input"
                />
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Demandes spéciales
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 text-white/40" size={18} />
                <textarea
                  name="special_requests"
                  value={formData.special_requests}
                  onChange={handleChange}
                  placeholder="Table VIP, anniversaire, etc."
                  rows={3}
                  className="form-input w-full pl-12 pr-4 py-3 rounded-lg resize-none"
                  data-testid="special-requests-input"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                className="text-red-400 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                data-testid="booking-error"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-4 rounded-lg flex items-center justify-center gap-2"
              data-testid="submit-booking-btn"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Réservation en cours...
                </>
              ) : isAuthenticated ? (
                'Confirmer la réservation'
              ) : (
                'Se connecter pour réserver'
              )}
            </button>

            {!isAuthenticated && (
              <p className="text-center text-white/50 text-sm">
                Vous devez être connecté pour effectuer une réservation
              </p>
            )}
          </motion.form>

          {/* Event Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {selectedEvent ? (
              <div className="sticky top-28 bg-[#0F0F13] rounded-xl overflow-hidden border border-white/10">
                <div className="aspect-video">
                  <img
                    src={selectedEvent.image_url || 'https://images.pexels.com/photos/11481894/pexels-photo-11481894.jpeg'}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <span className="inline-block px-3 py-1 bg-[#FF2A85]/20 text-[#FF2A85] text-xs uppercase tracking-wider rounded-full mb-3">
                    {selectedEvent.category}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2">{selectedEvent.title}</h3>
                  <p className="text-white/60 text-sm mb-4">{selectedEvent.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-white/70">
                      <span>Date</span>
                      <span className="text-white">
                        {new Date(selectedEvent.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Lieu</span>
                      <span className="text-white">{selectedEvent.location}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Prix unitaire</span>
                      <span className="text-[#D4AF37] font-bold">
                        {selectedEvent.price === 0 ? 'Gratuit' : `${selectedEvent.price}€`}
                      </span>
                    </div>
                    {formData.guests > 1 && selectedEvent.price > 0 && (
                      <div className="flex justify-between text-white/70 pt-2 border-t border-white/10">
                        <span>Total ({formData.guests} pers.)</span>
                        <span className="text-[#FF2A85] font-bold text-lg">
                          {selectedEvent.price * formData.guests}€
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="sticky top-28 bg-[#0F0F13] rounded-xl p-8 border border-white/10 text-center">
                <Calendar size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-white/50">
                  Sélectionnez un événement pour voir les détails
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

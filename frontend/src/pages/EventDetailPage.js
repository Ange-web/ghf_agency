import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Ticket, Crown, Sparkles } from 'lucide-react';
import axios from 'axios';
import CountdownTimer from '../components/CountdownTimer';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/events/${eventId}`);
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="skeleton w-full max-w-4xl h-96 rounded-xl mx-4" />
      </div>
    );
  }

  if (!event) return null;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-20" data-testid="event-detail-page">
      {/* Hero */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <img
          src={event.image_url || 'https://images.pexels.com/photos/11481894/pexels-photo-11481894.jpeg'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-24 left-4 flex items-center gap-2 text-white/70 hover:text-white transition-colors z-10"
          data-testid="back-button"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        {/* Event Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-block px-3 py-1 bg-[#FF2A85] text-white text-xs uppercase tracking-wider rounded-full mb-4">
                {event.category}
              </span>
              <h1 className="heading-xl text-white mb-4">{event.title}</h1>
              <div className="flex flex-wrap gap-4 md:gap-6 text-white/70">
                <span className="flex items-center gap-2">
                  <Calendar size={18} className="text-[#D4AF37]" />
                  {formatDate(event.date)}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={18} className="text-[#D4AF37]" />
                  {event.location}
                </span>
                <span className="flex items-center gap-2">
                  <Users size={18} className="text-[#D4AF37]" />
                  {event.available_spots} places restantes
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-white mb-4">À propos de l'événement</h2>
              <p className="text-white/70 leading-relaxed">{event.description}</p>
            </motion.div>

            {/* Countdown */}
            <motion.div
              className="bg-[#0F0F13] rounded-xl p-6 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-[#FF2A85]" size={24} />
                <h3 className="text-lg font-bold text-white">Compte à rebours</h3>
              </div>
              <CountdownTimer targetDate={event.date} />
            </motion.div>

            {/* Reservation Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-xl font-bold text-white mb-6">Options de réservation</h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                {/* Standard Entry */}
                <div className="bg-[#0F0F13] rounded-xl p-6 border border-white/10 hover:border-[#FF2A85]/50 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#FF2A85]/20 flex items-center justify-center">
                      <Ticket className="text-[#FF2A85]" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">Entrée Standard</h3>
                      <p className="text-white/50 text-sm">Accès général</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#FF2A85] mb-4">
                    {event.price === 0 ? 'Gratuit' : `${event.price}€`}
                  </p>
                  <p className="text-white/50 text-sm mb-4">{event.available_spots} places</p>
                  <Link
                    to={`/booking?event=${event.id}`}
                    className="btn-primary w-full py-3 rounded-lg text-center block"
                    data-testid="book-standard-btn"
                  >
                    Réserver
                  </Link>
                </div>

                {/* Table Promo */}
                {event.has_table_promo && (
                  <div className="bg-[#0F0F13] rounded-xl p-6 border border-[#FF2A85]/30 hover:border-[#FF2A85] transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-[#FF2A85]/20 flex items-center justify-center">
                        <Sparkles className="text-[#FF2A85]" size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">Table Promo</h3>
                        <p className="text-white/50 text-sm">Jusqu'à 6 personnes</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#FF2A85] mb-4">
                      {event.table_promo_price}€
                    </p>
                    <p className="text-white/50 text-sm mb-4">
                      {event.table_promo_available || 0} tables disponibles
                    </p>
                    <Link
                      to={`/tables/promo?event=${event.id}`}
                      className="btn-primary w-full py-3 rounded-lg text-center block"
                      data-testid="book-table-promo-btn"
                    >
                      Réserver
                    </Link>
                  </div>
                )}

                {/* Table VIP */}
                {event.has_table_vip && (
                  <div className="bg-gradient-to-br from-[#0F0F13] to-[#1A1A24] rounded-xl p-6 border border-[#D4AF37]/50 hover:border-[#D4AF37] transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                      VIP
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                        <Crown className="text-[#D4AF37]" size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">Table VIP</h3>
                        <p className="text-white/50 text-sm">Expérience premium</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#D4AF37] mb-4">
                      {event.table_vip_price}€
                    </p>
                    <p className="text-white/50 text-sm mb-4">
                      {event.table_vip_available || 0} tables disponibles
                    </p>
                    <Link
                      to={`/tables/vip?event=${event.id}`}
                      className="w-full py-3 rounded-lg text-center block bg-[#D4AF37] text-black font-bold hover:bg-[#E5C048] transition-colors"
                      data-testid="book-table-vip-btn"
                    >
                      Réserver VIP
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              className="sticky top-28 bg-[#0F0F13] rounded-xl p-6 border border-white/10"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-bold text-white mb-4">Récapitulatif</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Date</span>
                  <span className="text-white">{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Heure</span>
                  <span className="text-white">
                    {new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Lieu</span>
                  <span className="text-white">{event.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Places restantes</span>
                  <span className="text-[#FF2A85]">{event.available_spots}</span>
                </div>
                
                {event.has_table_promo && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Tables Promo</span>
                    <span className="text-[#FF2A85]">{event.table_promo_available || 0}</span>
                  </div>
                )}
                
                {event.has_table_vip && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Tables VIP</span>
                    <span className="text-[#D4AF37]">{event.table_vip_available || 0}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 mt-6 pt-6">
                <p className="text-white/50 text-xs mb-4">
                  Les réservations sont définitives. Annulation possible jusqu'à 48h avant l'événement.
                </p>
                <Link
                  to={`/booking?event=${event.id}`}
                  className="btn-primary w-full py-3 rounded-lg text-center block"
                  data-testid="sidebar-book-btn"
                >
                  Réserver maintenant
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

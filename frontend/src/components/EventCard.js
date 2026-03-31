import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

export default function EventCard({ event, featured = false }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Gratuit' : `${price}€`;
  };

  if (featured) {
    return (
      <motion.div
        className="event-card rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        data-testid={`featured-event-${event.id}`}
      >
        <div className="relative aspect-[16/9] md:aspect-[21/9]">
          <img
            src={event.image_url || 'https://images.pexels.com/photos/11481894/pexels-photo-11481894.jpeg'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-overlay" />
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <span className="inline-block px-3 py-1 bg-[#FF2A85] text-white text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
                  Prochain événement
                </span>
                <h3 className="heading-lg text-white mb-3">{event.title}</h3>
                <p className="text-white/70 text-sm md:text-base max-w-xl mb-4 line-clamp-2">
                  {event.description}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-white/60">
                  <span className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#D4AF37]" />
                    {formatDate(event.date)}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#D4AF37]" />
                    {event.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users size={16} className="text-[#D4AF37]" />
                    {event.available_spots} places
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end gap-4">
                <CountdownTimer targetDate={event.date} />
                <div className="flex gap-3">
                  <span className="text-2xl font-bold text-[#D4AF37]">
                    {formatPrice(event.price)}
                  </span>
                  <Link
                    to={`/booking?event=${event.id}`}
                    className="btn-primary px-6 py-3 rounded-full flex items-center gap-2"
                    data-testid={`book-event-${event.id}`}
                  >
                    Réserver
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <Link to={`/events/${event.id}`}>
      <motion.div
        className="event-card rounded-xl overflow-hidden group cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        data-testid={`event-card-${event.id}`}
      >
        <div className="event-card-image">
          <img
            src={event.image_url || 'https://images.pexels.com/photos/11481894/pexels-photo-11481894.jpeg'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-overlay opacity-60" />
          
          {/* Price Tag */}
          <div className="absolute top-4 right-4 bg-[#D4AF37] text-black px-3 py-1 text-sm font-bold rounded-full">
            {formatPrice(event.price)}
          </div>
          
          {/* Category */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white/80 px-3 py-1 text-xs uppercase tracking-wider rounded-full">
            {event.category}
          </div>
          
          {/* Table badges */}
          {(event.has_table_promo || event.has_table_vip) && (
            <div className="absolute bottom-4 left-4 flex gap-2">
              {event.has_table_promo && (
                <span className="bg-[#FF2A85]/80 text-white px-2 py-0.5 text-xs rounded">
                  Tables Promo
                </span>
              )}
              {event.has_table_vip && (
                <span className="bg-[#D4AF37]/80 text-black px-2 py-0.5 text-xs font-medium rounded">
                  VIP
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="p-5">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FF2A85] transition-colors">
            {event.title}
          </h3>
          <p className="text-white/60 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>
          
          <div className="flex flex-wrap gap-3 text-xs text-white/50 mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[#FF2A85]" />
              {formatDate(event.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-[#FF2A85]" />
              {event.location}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#D4AF37]">
              {event.available_spots} places restantes
            </span>
            <span
              className="text-[#FF2A85] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
              data-testid={`book-btn-${event.id}`}
            >
              Voir détails
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

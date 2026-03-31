import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, ChevronDown } from 'lucide-react';
import axios from 'axios';
import EventCard from '../components/EventCard';
import TestimonialCard from '../components/TestimonialCard';
import Marquee from '../components/Marquee';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, galleryRes, testimonialsRes] = await Promise.all([
        axios.get(`${API_URL}/api/events`),
        axios.get(`${API_URL}/api/gallery`),
        axios.get(`${API_URL}/api/testimonials`)
      ]);
      setEvents(eventsRes.data);
      setGallery(galleryRes.data.slice(0, 4));
      setTestimonials(testimonialsRes.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToEvents = () => {
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="hero-section" data-testid="hero-section">
        <div className="hero-bg">
          <img
            src="https://images.unsplash.com/photo-1741767123174-a76960011e6c"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 gradient-overlay" />
        </div>

        <div className="hero-content max-w-7xl mx-auto pt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block text-[#D4AF37] text-xs md:text-sm uppercase tracking-[0.3em] mb-4">
              Experience the Night
            </span>
          </motion.div>

          <motion.h1
            className="heading-xl text-white max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Vivez des{' '}
            <span className="text-gradient">expériences</span>
            {' '}inoubliables
          </motion.h1>

          <motion.p
            className="text-white/70 text-base md:text-lg max-w-xl mt-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            GHF Agency organise les événements les plus exclusifs de Paris. 
            Soirées VIP, concerts, expériences uniques — rejoignez notre communauté.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 mt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link
              to="/booking"
              className="btn-primary px-8 py-4 rounded-full text-center flex items-center justify-center gap-2"
              data-testid="hero-booking-btn"
            >
              <Calendar size={20} />
              Réserver maintenant
            </Link>
            <Link
              to="/events"
              className="btn-secondary px-8 py-4 rounded-full text-center flex items-center justify-center gap-2"
              data-testid="hero-events-btn"
            >
              Voir les événements
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.button
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2"
          onClick={scrollToEvents}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-xs uppercase tracking-widest">Découvrir</span>
          <ChevronDown size={24} />
        </motion.button>
      </section>

      {/* Marquee */}
      <Marquee />

      {/* Featured Event */}
      {events.length > 0 && (
        <section id="events" className="py-20 px-4" data-testid="featured-event-section">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#D4AF37] text-xs uppercase tracking-[0.2em]">
                À ne pas manquer
              </span>
              <h2 className="heading-md text-white mt-2">Prochain événement</h2>
            </motion.div>

            <EventCard event={events[0]} featured />
          </div>
        </section>
      )}

      {/* Events Grid */}
      {events.length > 1 && (
        <section className="py-20 px-4 bg-[#0A0A0A]" data-testid="events-grid-section">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="text-[#D4AF37] text-xs uppercase tracking-[0.2em]">
                  Calendrier
                </span>
                <h2 className="heading-md text-white mt-2">Autres événements</h2>
              </div>
              <Link
                to="/events"
                className="text-[#FF2A85] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                data-testid="see-all-events-btn"
              >
                Voir tout
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.slice(1, 4).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Preview */}
      {gallery.length > 0 && (
        <section className="py-20 px-4" data-testid="gallery-preview-section">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="text-[#D4AF37] text-xs uppercase tracking-[0.2em]">
                  Souvenirs
                </span>
                <h2 className="heading-md text-white mt-2">Galerie</h2>
              </div>
              <Link
                to="/gallery"
                className="text-[#FF2A85] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                data-testid="see-all-gallery-btn"
              >
                Voir tout
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.map((item, index) => (
                <motion.div
                  key={item.id}
                  className={`gallery-item rounded-xl overflow-hidden ${
                    index === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  data-testid={`gallery-preview-${item.id}`}
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="gallery-overlay">
                    <p className="text-white text-sm font-medium">{item.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 px-4 bg-[#0A0A0A]" data-testid="testimonials-section">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#D4AF37] text-xs uppercase tracking-[0.2em]">
                Témoignages
              </span>
              <h2 className="heading-md text-white mt-2">Ce qu'ils disent de nous</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard 
                  key={testimonial.id} 
                  testimonial={testimonial} 
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden" data-testid="cta-section">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(https://images.pexels.com/photos/18718691/pexels-photo-18718691.jpeg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/80" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            className="heading-lg text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Prêt à vivre une{' '}
            <span className="text-[#FF2A85]">expérience unique</span> ?
          </motion.h2>
          <motion.p
            className="text-white/60 text-lg mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Réservez votre place maintenant et rejoignez-nous pour une soirée inoubliable.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/booking"
              className="btn-primary inline-flex items-center gap-2 px-10 py-4 rounded-full text-lg animate-glow-pulse"
              data-testid="cta-booking-btn"
            >
              Réserver maintenant
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

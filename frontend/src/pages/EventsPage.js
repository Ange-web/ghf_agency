import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import axios from 'axios';
import EventCard from '../components/EventCard';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const categories = [
  { value: '', label: 'Tous' },
  { value: 'party', label: 'Soirées' },
  { value: 'vip', label: 'VIP' },
  { value: 'techno', label: 'Techno' },
  { value: 'concert', label: 'Concerts' },
];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [search, category, events]);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/events`);
      setEvents(data);
      setFilteredEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        event =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower)
      );
    }
    
    if (category) {
      filtered = filtered.filter(event => event.category === category);
    }
    
    setFilteredEvents(filtered);
  };

  return (
    <div className="min-h-screen pt-24 pb-20" data-testid="events-page">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-[#D4AF37] text-xs uppercase tracking-[0.2em]">
            Calendrier
          </span>
          <h1 className="heading-lg text-white mt-2">Nos événements</h1>
          <p className="text-white/60 mt-4 max-w-xl">
            Découvrez tous nos événements à venir et réservez votre place pour une expérience inoubliable.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un événement..."
              className="form-input w-full pl-12 pr-4 py-3 rounded-lg"
              data-testid="search-events-input"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input pl-12 pr-8 py-3 rounded-lg appearance-none cursor-pointer min-w-[180px]"
              data-testid="category-filter"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-80 rounded-xl" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-white/50 text-lg">Aucun événement trouvé</p>
            <p className="text-white/30 text-sm mt-2">
              Essayez de modifier vos critères de recherche
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

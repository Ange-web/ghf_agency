import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Filter } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterEvent, setFilterEvent] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [galleryRes, eventsRes] = await Promise.all([
        axios.get(`${API_URL}/api/gallery`),
        axios.get(`${API_URL}/api/events?upcoming=false`)
      ]);
      setItems(galleryRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = filterEvent
    ? items.filter(item => item.event_id === filterEvent)
    : items;

  const handleDownload = (url, title) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = title || 'image';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pt-24 pb-20" data-testid="gallery-page">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-[#D4AF37] text-xs uppercase tracking-[0.2em]">
            Souvenirs
          </span>
          <h1 className="heading-lg text-white mt-2">Galerie</h1>
          <p className="text-white/60 mt-4 max-w-xl">
            Revivez nos meilleurs moments à travers ces photos et vidéos exclusives.
          </p>
        </motion.div>

        {/* Filter */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative inline-block">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <select
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="form-input pl-12 pr-8 py-3 rounded-lg appearance-none cursor-pointer min-w-[220px]"
              data-testid="gallery-filter"
            >
              <option value="">Tous les événements</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="masonry-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton h-64 rounded-xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-white/50 text-lg">Aucune photo trouvée</p>
          </motion.div>
        ) : (
          <div className="masonry-grid">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                className="gallery-item rounded-xl overflow-hidden cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedItem(item)}
                data-testid={`gallery-item-${item.id}`}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  style={{ 
                    aspectRatio: index % 3 === 0 ? '1/1' : index % 3 === 1 ? '4/3' : '3/4'
                  }}
                />
                <div className="gallery-overlay">
                  <div>
                    <p className="text-white font-medium">{item.title}</p>
                    {item.event_name && (
                      <p className="text-white/60 text-sm">{item.event_name}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            data-testid="gallery-lightbox"
          >
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
              onClick={() => setSelectedItem(null)}
              data-testid="close-lightbox"
            >
              <X size={32} />
            </button>

            <motion.div
              className="relative max-w-5xl max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedItem.url}
                alt={selectedItem.title}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{selectedItem.title}</p>
                    {selectedItem.event_name && (
                      <p className="text-white/60 text-sm">{selectedItem.event_name}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDownload(selectedItem.url, selectedItem.title)}
                    className="btn-secondary px-4 py-2 rounded-full flex items-center gap-2 text-sm"
                    data-testid="download-image-btn"
                  >
                    <Download size={16} />
                    Télécharger
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

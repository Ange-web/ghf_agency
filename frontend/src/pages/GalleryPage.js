import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Filter, Plus, Camera, Loader2, Check, Clock } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function GalleryPage({ onAuthClick }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [myPhotos, setMyPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterEvent, setFilterEvent] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', url: '', event_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyPhotos();
    }
  }, [isAuthenticated]);

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

  const fetchMyPhotos = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/photos/my`, { withCredentials: true });
      setMyPhotos(data);
    } catch (error) {
      console.error('Error fetching my photos:', error);
    }
  };

  const handleSubmitPhoto = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onAuthClick();
      return;
    }

    setUploading(true);
    try {
      await axios.post(`${API_URL}/api/photos/submit`, uploadForm, { withCredentials: true });
      setUploadSuccess(true);
      setUploadForm({ title: '', url: '', event_id: '' });
      fetchMyPhotos();
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess(false);
      }, 2000);
    } catch (error) {
      alert(error.response?.data?.detail || 'Erreur lors de la soumission');
    } finally {
      setUploading(false);
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
          className="mt-8 flex flex-wrap gap-4 items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
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
          
          {/* Upload Button */}
          <button
            onClick={() => isAuthenticated ? setShowUploadModal(true) : onAuthClick()}
            className="btn-primary px-4 py-3 rounded-lg flex items-center gap-2"
            data-testid="upload-photo-btn"
          >
            <Camera size={18} />
            Partager une photo
          </button>
        </motion.div>

        {/* My Photos Status */}
        {isAuthenticated && myPhotos.length > 0 && (
          <motion.div
            className="mt-6 p-4 bg-[#0F0F13] rounded-lg border border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Camera size={18} className="text-[#FF2A85]" />
              Mes soumissions ({myPhotos.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {myPhotos.slice(0, 5).map((photo) => (
                <div key={photo.id} className="relative">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    photo.status === 'approved' ? 'bg-green-500' :
                    photo.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}>
                    {photo.status === 'approved' ? <Check size={12} /> :
                     photo.status === 'rejected' ? <X size={12} /> : <Clock size={12} />}
                  </span>
                </div>
              ))}
              {myPhotos.length > 5 && (
                <span className="text-white/50 text-sm self-center ml-2">+{myPhotos.length - 5} autres</span>
              )}
            </div>
          </motion.div>
        )}
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

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            className="fixed inset-0 z-[500] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => !uploading && setShowUploadModal(false)}
            />
            
            <motion.div
              className="relative bg-[#0F0F13] rounded-xl p-6 w-full max-w-md border border-white/10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              data-testid="upload-modal"
            >
              {uploadSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Check className="text-green-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Photo soumise !</h3>
                  <p className="text-white/60 text-sm">
                    Votre photo sera visible après validation par un administrateur.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Camera className="text-[#FF2A85]" size={24} />
                      Partager une photo
                    </h3>
                    <button
                      onClick={() => setShowUploadModal(false)}
                      className="text-white/50 hover:text-white"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmitPhoto} className="space-y-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Titre *</label>
                      <input
                        type="text"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                        placeholder="Titre de votre photo"
                        className="form-input w-full px-4 py-3 rounded-lg"
                        required
                        data-testid="photo-title-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-white/70 mb-2">URL de l'image *</label>
                      <input
                        type="url"
                        value={uploadForm.url}
                        onChange={(e) => setUploadForm({...uploadForm, url: e.target.value})}
                        placeholder="https://..."
                        className="form-input w-full px-4 py-3 rounded-lg"
                        required
                        data-testid="photo-url-input"
                      />
                      <p className="text-xs text-white/40 mt-1">
                        Collez le lien direct vers votre image (Imgur, Google Photos, etc.)
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Événement associé</label>
                      <select
                        value={uploadForm.event_id}
                        onChange={(e) => setUploadForm({...uploadForm, event_id: e.target.value})}
                        className="form-input w-full px-4 py-3 rounded-lg"
                        data-testid="photo-event-select"
                      >
                        <option value="">Aucun événement</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {uploadForm.url && (
                      <div className="mt-4">
                        <p className="text-sm text-white/70 mb-2">Aperçu :</p>
                        <img
                          src={uploadForm.url}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-lg"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                    
                    <div className="p-3 bg-[#FF2A85]/10 rounded-lg border border-[#FF2A85]/20 text-sm text-white/70">
                      <p>Votre photo sera soumise à validation par un administrateur avant d'apparaître dans la galerie publique.</p>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={uploading}
                      className="btn-primary w-full py-3 rounded-lg flex items-center justify-center gap-2"
                      data-testid="submit-photo-btn"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Plus size={18} />
                          Soumettre la photo
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

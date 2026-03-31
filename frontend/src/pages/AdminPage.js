import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Calendar, Trophy, Image, Users, Ticket, 
  Loader2, Check, X, Trash2, Eye, ChevronDown, ChevronUp 
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [contests, setContests] = useState([]);
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [tableReservations, setTableReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [showEventForm, setShowEventForm] = useState(false);
  const [showContestForm, setShowContestForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [eventForm, setEventForm] = useState({
    title: '', description: '', date: '', location: '', image_url: '',
    price: 0, capacity: 100, category: 'party',
    has_table_promo: false, table_promo_price: 150, table_promo_capacity: 10,
    has_table_vip: false, table_vip_price: 300, table_vip_capacity: 5
  });
  
  const [contestForm, setContestForm] = useState({
    title: '', description: '', prize: '', end_date: '', image_url: ''
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchData();
    }
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, contestsRes, photosRes, reservationsRes, tableResRes] = await Promise.all([
        axios.get(`${API_URL}/api/events?upcoming=false`),
        axios.get(`${API_URL}/api/contests?active_only=false`),
        axios.get(`${API_URL}/api/photos/pending`, { withCredentials: true }),
        axios.get(`${API_URL}/api/admin/reservations`, { withCredentials: true }),
        axios.get(`${API_URL}/api/admin/table-reservations`, { withCredentials: true })
      ]);
      setEvents(eventsRes.data);
      setContests(contestsRes.data);
      setPendingPhotos(photosRes.data);
      setReservations(reservationsRes.data);
      setTableReservations(tableResRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...eventForm,
        date: new Date(eventForm.date).toISOString(),
        price: parseFloat(eventForm.price),
        capacity: parseInt(eventForm.capacity),
        table_promo_price: parseFloat(eventForm.table_promo_price),
        table_promo_capacity: parseInt(eventForm.table_promo_capacity),
        table_vip_price: parseFloat(eventForm.table_vip_price),
        table_vip_capacity: parseInt(eventForm.table_vip_capacity)
      };
      await axios.post(`${API_URL}/api/events`, payload, { withCredentials: true });
      setShowEventForm(false);
      setEventForm({
        title: '', description: '', date: '', location: '', image_url: '',
        price: 0, capacity: 100, category: 'party',
        has_table_promo: false, table_promo_price: 150, table_promo_capacity: 10,
        has_table_vip: false, table_vip_price: 300, table_vip_capacity: 5
      });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateContest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...contestForm,
        end_date: new Date(contestForm.end_date).toISOString()
      };
      await axios.post(`${API_URL}/api/contests`, payload, { withCredentials: true });
      setShowContestForm(false);
      setContestForm({ title: '', description: '', prize: '', end_date: '', image_url: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Supprimer cet événement ?')) return;
    try {
      await axios.delete(`${API_URL}/api/events/${eventId}`, { withCredentials: true });
      fetchData();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleDeleteContest = async (contestId) => {
    if (!window.confirm('Supprimer ce concours ?')) return;
    try {
      await axios.delete(`${API_URL}/api/contests/${contestId}`, { withCredentials: true });
      fetchData();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handlePhotoApproval = async (photoId, approved) => {
    try {
      await axios.put(`${API_URL}/api/photos/${photoId}/approve`, { approved }, { withCredentials: true });
      setPendingPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (error) {
      alert('Erreur lors de la modération');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF2A85]" size={48} />
      </div>
    );
  }

  const tabs = [
    { id: 'events', label: 'Événements', icon: Calendar, count: events.length },
    { id: 'contests', label: 'Concours', icon: Trophy, count: contests.length },
    { id: 'photos', label: 'Photos', icon: Image, count: pendingPhotos.length },
    { id: 'reservations', label: 'Réservations', icon: Ticket, count: reservations.length },
    { id: 'tables', label: 'Tables', icon: Users, count: tableReservations.length },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20" data-testid="admin-page">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-[#D4AF37] text-xs uppercase tracking-[0.2em]">
            Administration
          </span>
          <h1 className="heading-lg text-white mt-2">Dashboard Admin</h1>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#FF2A85] text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <Icon size={18} />
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-black/30 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Gestion des événements</h2>
              <button
                onClick={() => setShowEventForm(!showEventForm)}
                className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
                data-testid="add-event-btn"
              >
                <Plus size={18} />
                Ajouter
              </button>
            </div>

            {/* Event Form */}
            {showEventForm && (
              <motion.form
                onSubmit={handleCreateEvent}
                className="bg-[#0F0F13] rounded-xl p-6 mb-6 border border-white/10"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <h3 className="text-lg font-bold text-white mb-4">Nouvel événement</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Titre *</label>
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                      className="form-input w-full px-4 py-2 rounded-lg"
                      required
                      data-testid="event-title-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Catégorie</label>
                    <select
                      value={eventForm.category}
                      onChange={(e) => setEventForm({...eventForm, category: e.target.value})}
                      className="form-input w-full px-4 py-2 rounded-lg"
                      data-testid="event-category-select"
                    >
                      <option value="party">Soirée</option>
                      <option value="vip">VIP</option>
                      <option value="techno">Techno</option>
                      <option value="concert">Concert</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-white/70 mb-2">Description *</label>
                    <textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                      className="form-input w-full px-4 py-2 rounded-lg"
                      rows={3}
                      required
                      data-testid="event-description-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Date *</label>
                    <input
                      type="datetime-local"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                      className="form-input w-full px-4 py-2 rounded-lg"
                      required
                      data-testid="event-date-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Lieu *</label>
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                      className="form-input w-full px-4 py-2 rounded-lg"
                      required
                      data-testid="event-location-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Prix (€)</label>
                    <input
                      type="number"
                      value={eventForm.price}
                      onChange={(e) => setEventForm({...eventForm, price: e.target.value})}
                      className="form-input w-full px-4 py-2 rounded-lg"
                      min="0"
                      data-testid="event-price-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Capacité</label>
                    <input
                      type="number"
                      value={eventForm.capacity}
                      onChange={(e) => setEventForm({...eventForm, capacity: e.target.value})}
                      className="form-input w-full px-4 py-2 rounded-lg"
                      min="1"
                      data-testid="event-capacity-input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-white/70 mb-2">URL Image</label>
                    <input
                      type="url"
                      value={eventForm.image_url}
                      onChange={(e) => setEventForm({...eventForm, image_url: e.target.value})}
                      className="form-input w-full px-4 py-2 rounded-lg"
                      placeholder="https://..."
                      data-testid="event-image-input"
                    />
                  </div>
                  
                  {/* Table Promo */}
                  <div className="md:col-span-2 border-t border-white/10 pt-4 mt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eventForm.has_table_promo}
                        onChange={(e) => setEventForm({...eventForm, has_table_promo: e.target.checked})}
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-white font-medium">Proposer des Tables Promo</span>
                    </label>
                    {eventForm.has_table_promo && (
                      <div className="grid md:grid-cols-2 gap-4 mt-4 ml-8">
                        <div>
                          <label className="block text-sm text-white/70 mb-2">Prix Table Promo (€)</label>
                          <input
                            type="number"
                            value={eventForm.table_promo_price}
                            onChange={(e) => setEventForm({...eventForm, table_promo_price: e.target.value})}
                            className="form-input w-full px-4 py-2 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/70 mb-2">Nombre de Tables Promo</label>
                          <input
                            type="number"
                            value={eventForm.table_promo_capacity}
                            onChange={(e) => setEventForm({...eventForm, table_promo_capacity: e.target.value})}
                            className="form-input w-full px-4 py-2 rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Table VIP */}
                  <div className="md:col-span-2 border-t border-white/10 pt-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eventForm.has_table_vip}
                        onChange={(e) => setEventForm({...eventForm, has_table_vip: e.target.checked})}
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-white font-medium">Proposer des Tables VIP</span>
                    </label>
                    {eventForm.has_table_vip && (
                      <div className="grid md:grid-cols-2 gap-4 mt-4 ml-8">
                        <div>
                          <label className="block text-sm text-white/70 mb-2">Prix Table VIP (€)</label>
                          <input
                            type="number"
                            value={eventForm.table_vip_price}
                            onChange={(e) => setEventForm({...eventForm, table_vip_price: e.target.value})}
                            className="form-input w-full px-4 py-2 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/70 mb-2">Nombre de Tables VIP</label>
                          <input
                            type="number"
                            value={eventForm.table_vip_capacity}
                            onChange={(e) => setEventForm({...eventForm, table_vip_capacity: e.target.value})}
                            className="form-input w-full px-4 py-2 rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary px-6 py-2 rounded-lg flex items-center gap-2"
                    data-testid="submit-event-btn"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                    Créer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="btn-secondary px-6 py-2 rounded-lg"
                  >
                    Annuler
                  </button>
                </div>
              </motion.form>
            )}

            {/* Events List */}
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-[#0F0F13] rounded-xl p-4 border border-white/10 flex items-center gap-4"
                  data-testid={`admin-event-${event.id}`}
                >
                  <img
                    src={event.image_url || 'https://images.pexels.com/photos/11481894/pexels-photo-11481894.jpeg'}
                    alt={event.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{event.title}</h3>
                    <p className="text-white/50 text-sm">
                      {new Date(event.date).toLocaleDateString('fr-FR')} • {event.location}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-[#FF2A85]/20 text-[#FF2A85] px-2 py-0.5 rounded">
                        {event.category}
                      </span>
                      <span className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded">
                        {event.price}€
                      </span>
                      {event.has_table_promo && (
                        <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded">
                          Tables Promo
                        </span>
                      )}
                      {event.has_table_vip && (
                        <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded">
                          Tables VIP
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                    data-testid={`delete-event-${event.id}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contests Tab */}
        {activeTab === 'contests' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Gestion des concours</h2>
              <button
                onClick={() => setShowContestForm(!showContestForm)}
                className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
                data-testid="add-contest-btn"
              >
                <Plus size={18} />
                Ajouter
              </button>
            </div>

            {/* Contest Form */}
            {showContestForm && (
              <motion.form
                onSubmit={handleCreateContest}
                className="bg-[#0F0F13] rounded-xl p-6 mb-6 border border-white/10"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <h3 className="text-lg font-bold text-white mb-4">Nouveau concours</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Titre *</label>
                    <input
                      type="text"
                      value={contestForm.title}
                      onChange={(e) => setContestForm({...contestForm, title: e.target.value})}
                      className="form-input w-full px-4 py-2 rounded-lg"
                      required
                      data-testid="contest-title-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Prix à gagner *</label>
                    <input
                      type="text"
                      value={contestForm.prize}
                      onChange={(e) => setContestForm({...contestForm, prize: e.target.value})}
                      className="form-input w-full px-4 py-2 rounded-lg"
                      required
                      data-testid="contest-prize-input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-white/70 mb-2">Description *</label>
                    <textarea
                      value={contestForm.description}
                      onChange={(e) => setContestForm({...contestForm, description: e.target.value})}
                      className="form-input w-full px-4 py-2 rounded-lg"
                      rows={3}
                      required
                      data-testid="contest-description-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Date de fin *</label>
                    <input
                      type="datetime-local"
                      value={contestForm.end_date}
                      onChange={(e) => setContestForm({...contestForm, end_date: e.target.value})}
                      className="form-input w-full px-4 py-2 rounded-lg"
                      required
                      data-testid="contest-date-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">URL Image</label>
                    <input
                      type="url"
                      value={contestForm.image_url}
                      onChange={(e) => setContestForm({...contestForm, image_url: e.target.value})}
                      className="form-input w-full px-4 py-2 rounded-lg"
                      data-testid="contest-image-input"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary px-6 py-2 rounded-lg flex items-center gap-2"
                    data-testid="submit-contest-btn"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                    Créer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContestForm(false)}
                    className="btn-secondary px-6 py-2 rounded-lg"
                  >
                    Annuler
                  </button>
                </div>
              </motion.form>
            )}

            {/* Contests List */}
            <div className="space-y-4">
              {contests.map((contest) => (
                <div
                  key={contest.id}
                  className="bg-[#0F0F13] rounded-xl p-4 border border-white/10 flex items-center gap-4"
                  data-testid={`admin-contest-${contest.id}`}
                >
                  <img
                    src={contest.image_url || 'https://images.pexels.com/photos/11481894/pexels-photo-11481894.jpeg'}
                    alt={contest.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{contest.title}</h3>
                    <p className="text-white/50 text-sm">
                      Fin: {new Date(contest.end_date).toLocaleDateString('fr-FR')} • {contest.participants_count} participants
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${
                      contest.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {contest.is_active ? 'Actif' : 'Terminé'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteContest(contest.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                    data-testid={`delete-contest-${contest.id}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Photos en attente de validation</h2>
            
            {pendingPhotos.length === 0 ? (
              <div className="text-center py-16 bg-[#0F0F13] rounded-xl border border-white/10">
                <Image size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-white/50">Aucune photo en attente</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-[#0F0F13] rounded-xl overflow-hidden border border-white/10"
                    data-testid={`pending-photo-${photo.id}`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-white font-medium">{photo.title}</h3>
                      <p className="text-white/50 text-sm">Par {photo.user_name}</p>
                      {photo.event_name && (
                        <p className="text-[#D4AF37] text-xs mt-1">{photo.event_name}</p>
                      )}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handlePhotoApproval(photo.id, true)}
                          className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-500/30"
                          data-testid={`approve-photo-${photo.id}`}
                        >
                          <Check size={18} />
                          Approuver
                        </button>
                        <button
                          onClick={() => handlePhotoApproval(photo.id, false)}
                          className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-500/30"
                          data-testid={`reject-photo-${photo.id}`}
                        >
                          <X size={18} />
                          Rejeter
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Toutes les réservations</h2>
            
            {reservations.length === 0 ? (
              <div className="text-center py-16 bg-[#0F0F13] rounded-xl border border-white/10">
                <Ticket size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-white/50">Aucune réservation</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.map((r) => (
                  <div
                    key={r.id}
                    className="bg-[#0F0F13] rounded-xl p-4 border border-white/10"
                    data-testid={`admin-reservation-${r.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-medium">{r.event_title}</h3>
                        <p className="text-white/50 text-sm">{r.user_name} • {r.guests} pers. • {r.phone}</p>
                        {r.special_requests && (
                          <p className="text-white/40 text-xs mt-1">Note: {r.special_requests}</p>
                        )}
                      </div>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Réservations de tables</h2>
            
            {tableReservations.length === 0 ? (
              <div className="text-center py-16 bg-[#0F0F13] rounded-xl border border-white/10">
                <Users size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-white/50">Aucune réservation de table</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tableReservations.map((r) => (
                  <div
                    key={r.id}
                    className="bg-[#0F0F13] rounded-xl p-4 border border-white/10"
                    data-testid={`admin-table-${r.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-medium">{r.event_title}</h3>
                        <p className="text-white/50 text-sm">{r.name} • {r.guests} pers. • {r.phone}</p>
                        <p className="text-white/40 text-xs">{r.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded ${
                          r.table_type === 'vip' 
                            ? 'bg-[#D4AF37]/20 text-[#D4AF37]' 
                            : 'bg-[#FF2A85]/20 text-[#FF2A85]'
                        }`}>
                          Table {r.table_type.toUpperCase()}
                        </span>
                        <p className="text-white font-bold mt-1">{r.price}€</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

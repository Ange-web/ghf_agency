import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Ticket, Edit2, LogOut, Loader2, X, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, isAuthenticated, loading: authLoading } = useAuth();
  
  const [reservations, setReservations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReservations();
      setEditName(user?.name || '');
    }
  }, [isAuthenticated, user]);

  const fetchReservations = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/reservations/my`, {
        withCredentials: true
      });
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) return;
    
    setSaving(true);
    const result = await updateProfile({ name: editName.trim() });
    setSaving(false);
    
    if (result.success) {
      setEditing(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;
    
    setCancellingId(reservationId);
    try {
      await axios.delete(`${API_URL}/api/reservations/${reservationId}`, {
        withCredentials: true
      });
      setReservations(prev => prev.filter(r => r.id !== reservationId));
    } catch (error) {
      alert(error.response?.data?.detail || 'Erreur lors de l\'annulation');
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF2A85]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20" data-testid="profile-page">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <motion.div
          className="bg-[#0F0F13] rounded-2xl p-8 border border-white/10 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF2A85] to-[#D4AF37] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            {/* Info */}
            <div className="flex-1">
              {editing ? (
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="form-input px-4 py-2 rounded-lg text-xl font-bold"
                    data-testid="edit-name-input"
                  />
                  <button
                    onClick={handleUpdateProfile}
                    disabled={saving}
                    className="btn-primary px-4 py-2 rounded-lg"
                    data-testid="save-name-btn"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : 'Enregistrer'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditName(user.name);
                    }}
                    className="text-white/50 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-white/50 hover:text-[#FF2A85] transition-colors"
                    data-testid="edit-profile-btn"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-white/60">
                <span className="flex items-center gap-2">
                  <Mail size={16} className="text-[#FF2A85]" />
                  {user.email}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#FF2A85]" />
                  Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </span>
                {user.role === 'admin' && (
                  <span className="px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded-full text-xs uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleLogout}
              className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              data-testid="logout-btn"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </motion.div>

        {/* Reservations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Ticket className="text-[#FF2A85]" size={24} />
            <h2 className="text-xl font-bold text-white">Mes réservations</h2>
          </div>

          {loadingData ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-24 rounded-xl" />
              ))}
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-16 bg-[#0F0F13] rounded-xl border border-white/10">
              <Ticket size={48} className="mx-auto text-white/20 mb-4" />
              <p className="text-white/50">Aucune réservation</p>
              <p className="text-white/30 text-sm mt-2">
                Réservez votre place pour nos prochains événements !
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation, index) => (
                <motion.div
                  key={reservation.id}
                  className="bg-[#0F0F13] rounded-xl p-6 border border-white/10 hover:border-[#FF2A85]/30 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  data-testid={`reservation-${reservation.id}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {reservation.event_title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-white/60">
                        <span>{reservation.guests} {reservation.guests > 1 ? 'personnes' : 'personne'}</span>
                        <span>{reservation.phone}</span>
                        <span>
                          {new Date(reservation.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      {reservation.special_requests && (
                        <p className="text-white/40 text-sm mt-2">
                          Note: {reservation.special_requests}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider ${
                        reservation.status === 'confirmed'
                          ? 'bg-green-500/20 text-green-400'
                          : reservation.status === 'cancelled'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {reservation.status === 'confirmed' ? 'Confirmée' : 
                         reservation.status === 'cancelled' ? 'Annulée' : 'En attente'}
                      </span>
                      
                      {reservation.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelReservation(reservation.id)}
                          disabled={cancellingId === reservation.id}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          data-testid={`cancel-reservation-${reservation.id}`}
                        >
                          {cancellingId === reservation.id ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

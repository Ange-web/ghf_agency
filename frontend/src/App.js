import React, { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import SplashScreen from "./components/SplashScreen";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import GalleryPage from "./pages/GalleryPage";
import BookingPage from "./pages/BookingPage";
import ContestsPage from "./pages/ContestsPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import TablePromoPage from "./pages/TablePromoPage";
import TableVIPPage from "./pages/TableVIPPage";
import { Toaster } from "./components/ui/sonner";

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Show splash for 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App min-h-screen bg-[#050505]">
      <SplashScreen show={showSplash} />
      
      {!showSplash && (
        <>
          <Header onAuthClick={() => setShowAuth(true)} />
          
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:eventId" element={<EventDetailPage />} />
              <Route 
                path="/gallery" 
                element={<GalleryPage onAuthClick={() => setShowAuth(true)} />} 
              />
              <Route 
                path="/booking" 
                element={<BookingPage onAuthClick={() => setShowAuth(true)} />} 
              />
              <Route 
                path="/contests" 
                element={<ContestsPage onAuthClick={() => setShowAuth(true)} />} 
              />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route 
                path="/tables/promo" 
                element={<TablePromoPage onAuthClick={() => setShowAuth(true)} />} 
              />
              <Route 
                path="/tables/vip" 
                element={<TableVIPPage onAuthClick={() => setShowAuth(true)} />} 
              />
            </Routes>
          </main>
          
          <Footer />
          
          <AuthModal 
            isOpen={showAuth} 
            onClose={() => setShowAuth(false)} 
          />
          
          <Toaster position="top-right" />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

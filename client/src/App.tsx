import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { CityProvider } from './context/CityContext.js';
import { BookingProvider } from './context/BookingContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { CityModal } from './components/CityModal.js';

// Pages
import { Home } from './pages/Home.js';
import { Movies } from './pages/Movies.js';
import { MovieDetails } from './pages/MovieDetails.js';
import { SeatSelection } from './pages/SeatSelection.js';
import { Checkout } from './pages/Checkout.js';
import { BookingConfirmation } from './pages/BookingConfirmation.js';
import { DigitalTicket } from './pages/DigitalTicket.js';
import { UserBookings } from './pages/UserBookings.js';
import { CineNovaPlus } from './pages/CineNovaPlus.js';
import { Offers } from './pages/Offers.js';
import { Theatres } from './pages/Theatres.js';
import { HelpCenter } from './pages/HelpCenter.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { TheatreOwnerPortal } from './pages/TheatreOwnerPortal.js';

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <CityProvider>
          <BookingProvider>
            <div className="min-h-screen flex flex-col bg-[#070A13] text-slate-100 selection:bg-brand-purple selection:text-white">
              <Navbar />
              <CityModal />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/movies" element={<Movies />} />
                  <Route path="/movie/:idOrSlug" element={<MovieDetails />} />
                  <Route path="/seat-selection/:showId" element={<SeatSelection />} />
                  <Route path="/checkout/:showId" element={<Checkout />} />
                  <Route
                    path="/booking-confirmation/:reference"
                    element={<BookingConfirmation />}
                  />
                  <Route path="/ticket/:reference" element={<DigitalTicket />} />
                  <Route path="/my-bookings" element={<UserBookings />} />
                  <Route path="/cinenova-plus" element={<CineNovaPlus />} />
                  <Route path="/offers" element={<Offers />} />
                  <Route path="/theatres" element={<Theatres />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/theatre-portal" element={<TheatreOwnerPortal />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BookingProvider>
        </CityProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;

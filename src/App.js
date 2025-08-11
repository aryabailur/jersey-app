import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import './App.css';

// Import Components
import Header from './components/Header';
import Footer from './components/Footer';

// Import Pages
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import CartPage from './pages/CartPage';

const ADMIN_UIDS = [
  process.env.REACT_APP_ADMIN_UID_1,
  process.env.REACT_APP_ADMIN_UID_2
];

export default function App() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="app">
        <Header user={user} onSearchChange={setSearchQuery} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage searchQuery={searchQuery} user={user} />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
            <Route 
              path="/admin" 
              element={user && ADMIN_UIDS.includes(user.uid) ? <AdminPage /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
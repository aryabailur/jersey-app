// src/components/Header.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';

const ADMIN_UIDS = [
  process.env.REACT_APP_ADMIN_UID_1,
  process.env.REACT_APP_ADMIN_UID_2
];

export default function Header({ user }) {

  // --- DEBUGGING LINES ---
  console.clear(); // Clears old messages from the console
  console.log("--- ADMIN BUTTON CHECK ---");
  console.log("1. Are you logged in? User object:", user);
  console.log("2. What is your UID?", user ? user.uid : "N/A (Not Logged In)");
  console.log("3. What are the Admin UIDs from .env file?", ADMIN_UIDS);
  console.log("4. Does your UID match an Admin UID?", user ? ADMIN_UIDS.includes(user.uid) : "N/A");
  console.log("--------------------------");
  // -----------------------

  const handleLogout = () => {
    signOut(auth);
  };
  
  // The rest of your component is here...
  return (
    <header className="header">
      <div className="container header__container">
        <NavLink to="/" className="header__logo">JERSEY<span className="header__logo--red">HUB</span></NavLink>
        <nav className={`header__nav`}>
          <NavLink to="/" className="header__nav-link">Home</NavLink>
          {user && ADMIN_UIDS.includes(user.uid) && (
            <NavLink to="/admin" className="header__nav-link admin-link">Admin</NavLink>
          )}
        </nav>
        <div className="header__actions">
          {/* ...your actions JSX... */}
          {user ? (
            <button onClick={handleLogout} className="button button--secondary button--small">Logout</button>
          ) : (
            <NavLink to="/login" className="header__icon-link"><User size={24} /></NavLink>
          )}
          {/* ...other actions... */}
        </div>
      </div>
    </header>
  );
}
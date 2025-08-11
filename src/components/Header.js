import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';

const ADMIN_UIDS = [
  process.env.REACT_APP_ADMIN_UID_1,
  process.env.REACT_APP_ADMIN_UID_2
];

export default function Header({ user, onSearchChange }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <header className="header">
      <div className="container header__container">
        <NavLink to="/" className="header__logo">JERSEY<span className="header__logo--red">HUB</span></NavLink>
        
        <nav className={`header__nav ${isMenuOpen ? "is-open" : ""}`}>
          <NavLink to="/" className="header__nav-link" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
          {user && ADMIN_UIDS.includes(user.uid) && (
            <NavLink to="/admin" className="header__nav-link admin-link" onClick={() => setIsMenuOpen(false)}>Admin</NavLink>
          )}
        </nav>

        <div className="header__actions">
          {/* 👇 THIS IS THE SEARCH BAR CODE THAT WAS MISSING */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search..."
              className="search-bar__input"
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            />
            <Search className="search-bar__icon" size={20} />
          </div>

          {user ? (
            <button onClick={handleLogout} className="button button--secondary button--small">Logout</button>
          ) : (
            <NavLink to="/login" className="header__icon-link"><User size={24} /></NavLink>
          )}

          <NavLink to="/cart" className="header__icon-link cart-link">
            <ShoppingCart size={24} />
            <span className="cart-link__badge">3</span>
          </NavLink>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="header__menu-toggle">
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>
    </header>
  );
}
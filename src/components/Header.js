import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import "../App.css"; 
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";

export default function Header({ user }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Logout function ab yaha use nahi hoga, isliye isko hata sakte hain
  // const handleLogout = () => {
  //   signOut(auth);
  //   setIsMenuOpen(false);
  // };

  return (
    <header className="header">
      <div className="container header__container">
        <NavLink to="/" className="header__logo">
          JERSEY<span className="header__logo--red">HUB</span>
        </NavLink>

        <nav className={`header__nav ${isMenuOpen ? "is-open" : ""}`}>
            <NavLink to="/" className="header__nav-link" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
            <NavLink to="/shop" className="header__nav-link" onClick={() => setIsMenuOpen(false)}>Shop</NavLink>
        </nav>

        <div className="header__actions">
          <Link to="/shop" className="header__icon-link">
            <Search size={24} />
          </Link>

          {/* ✅ UPDATED LOGIC HERE */}
          {user ? (
            // Agar user logged in hai, toh account page ka link dikhao
            <NavLink to="/account" className="header__icon-link">
              <User size={24} />
            </NavLink>
          ) : (
            // Agar user logged in nahi hai, toh login page ka link dikhao
            <NavLink to="/login" className="header__icon-link">
              <User size={24} />
            </NavLink>
          )}

          <NavLink to="/cart" className="header__icon-link cart-link">
            <ShoppingCart size={24} />
            {/* Your cart badge logic here */}
          </NavLink>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="header__menu-toggle"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>
    </header>
  );
}

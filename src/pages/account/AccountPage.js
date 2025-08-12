import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { LogOut, User, ShoppingBag, MapPin, Settings, Shield } from 'lucide-react';
import '../../App.css';

// Admin UIDs should be defined here or imported
const ADMIN_UIDS = [
  process.env.REACT_APP_ADMIN_UID_1,
  process.env.REACT_APP_ADMIN_UID_2,
];

export default function AccountPage({ user }) {
  const navigate = useNavigate();
  // Check if the current user's UID is in the admin list
  const isAdmin = user && ADMIN_UIDS.includes(user.uid);

  const handleLogout = () => {
    signOut(auth);
    navigate('/');
  };

  return (
    <div className="account-page">
      <div className="container">
        <div className="account-page__grid">
          <aside className="account-page__sidebar">
            <h2 className="sidebar__title">My Account</h2>
            <nav className="sidebar__nav">
              {/* ✅ ADMIN PORTAL LINK (Conditional) */}
              {isAdmin && (
                <NavLink to="/admin" className="sidebar__link sidebar__link--admin">
                  <Shield size={20} />
                  <span>Admin Portal</span>
                </NavLink>
              )}
              <NavLink to="/account" end className="sidebar__link">
                <User size={20} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/account/orders" className="sidebar__link">
                <ShoppingBag size={20} />
                <span>My Orders</span>
              </NavLink>
              <NavLink to="/account/addresses" className="sidebar__link">
                <MapPin size={20} />
                <span>Manage Addresses</span>
              </NavLink>
              <NavLink to="/account/settings" className="sidebar__link">
                <Settings size={20} />
                <span>Account Settings</span>
              </NavLink>
              <button onClick={handleLogout} className="sidebar__link sidebar__link--logout">
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </nav>
          </aside>
          <main className="account-page__content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

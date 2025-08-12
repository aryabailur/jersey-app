import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { Toaster } from "react-hot-toast";

// ... your other imports like React, Router, etc.
import { auth } from "./firebase/config";
import "./App.css";

// Import Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Import Pages
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import CartPage from "./pages/CartPage";
import ShopPage from "./pages/ShopPage";

// Import Account Pages
import AccountPage from "./pages/account/AccountPage";
import MyOrders from "./pages/account/MyOrders";
import ManageAddresses from "./pages/account/ManageAddresses";
import AccountSettings from "./pages/account/AccountSettings";

//import context pages
import { CartProvider } from "./context/CartContext";

const ADMIN_UIDS = [
  process.env.REACT_APP_ADMIN_UID_1,
  process.env.REACT_APP_ADMIN_UID_2,
];

// This component protects routes and passes the user prop down
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // This line is important - it adds the 'user' prop to the child component (AccountPage)
  return React.cloneElement(children, { user });
};

const AccountDashboard = () => (
  <div className="account-content-wrapper">
    <h1 className="account-content__title">Dashboard</h1>
    <p>
      Welcome to your account dashboard! From here, you can manage your orders,
      addresses, and account settings.
    </p>
  </div>
);

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
    <CartProvider>
      {/* ✅ ADDED: Place the Toaster component here */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
      <Router>
        <div className="app">
          <Header user={user} />
          <main>
            <Routes>
              <Route path="/" element={<HomePage user={user} />} />
              <Route
                path="/shop"
                element={
                  <ShopPage
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    user={user}
                  />
                }
              />
              <Route path="/cart" element={<CartPage />} />
              <Route
                path="/login"
                element={!user ? <LoginPage /> : <Navigate to="/" />}
              />
              <Route
                path="/admin"
                element={
                  user && ADMIN_UIDS.includes(user.uid) ? (
                    <AdminPage />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

              {/* NESTED ACCOUNT ROUTES */}
              <Route
                path="/account"
                element={
                  <ProtectedRoute user={user}>
                    <AccountPage />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AccountDashboard />} />
                <Route path="orders" element={<MyOrders />} />
                {/* <Route path="orders/:orderId" element={<OrderDetails />} /> */}
                <Route path="addresses" element={<ManageAddresses />} />
                <Route path="settings" element={<AccountSettings />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

import React from "react";
import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react"; // Import ShoppingCart
import { Link } from "react-router-dom"; // Import Link for the button

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart-container">
        <ShoppingCart size={64} strokeWidth={1} />
        <h1 className="section-title">Your Cart is Empty</h1>
        <p className="section-subtitle">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link to="/shop" className="button button--primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <section className="cart-page">
      <div className="container">
        <h1
          className="section-title"
          style={{ textAlign: "left", marginBottom: "2rem" }}
        >
          Your Cart
        </h1>
        <div className="cart-grid">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="cart-item__image"
                />
                <div className="cart-item__details">
                  <p className="cart-item__team">{item.team}</p>
                  <h3 className="cart-item__name">{item.name}</h3>
                  <p className="cart-item__price">
                    ₹{Number(item.price).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="cart-item__quantity">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus size={16} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="cart-item__total">
                  <p>
                    ₹
                    {Number(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="cart-item__remove">
                  <button onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{Number(subtotal).toLocaleString("en-IN")}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>₹{Number(subtotal).toLocaleString("en-IN")}</span>
            </div>
            <button
              className="button button--primary"
              style={{ width: "100%", marginTop: "1rem" }}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

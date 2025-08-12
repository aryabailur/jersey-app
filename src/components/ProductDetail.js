import React from "react";
import { Star, X, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext"; // Assuming you have this for cart functionality

export default function ProductDetail({ product, onBack }) {
  const { addToCart } = useCart();
  const safeProduct = product || {};

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(safeProduct.price || 0);

  const handleAddToCart = () => {
    addToCart(safeProduct);
  };

  return (
    // This overlay darkens the background and closes the modal when clicked
    <div className="product-detail__overlay" onClick={onBack}>
      {/* This is the actual modal window; clicking inside it won't close it */}
      <div
        className="product-detail__modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="product-detail__close-btn" onClick={onBack}>
          <X size={24} />
        </button>
        <div className="product-detail__grid">
          <div className="product-detail__image-container">
            <img
              src={safeProduct.imageUrl}
              alt={`${safeProduct.team} - ${safeProduct.name}`}
              className="product-detail__image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/600x600/222222/f5f5f5?text=Image+Not+Found";
              }}
            />
          </div>
          <div className="product-detail__info">
            <p className="product-detail__team">{safeProduct.team}</p>
            <h1 className="product-detail__title">{safeProduct.name}</h1>
            <div className="product-detail__rating">
              <Star size={18} fill="currentColor" />
              <span>{safeProduct.rating || "N/A"}</span>
            </div>
            <p className="product-detail__description">
              {safeProduct.description ||
                "A high-quality jersey perfect for fans and players. Made with breathable fabric to keep you cool and comfortable."}
            </p>
            <p className="product-detail__price">{formattedPrice}</p>
            <button
              className="button button--primary product-detail__add-to-cart-btn"
              onClick={handleAddToCart}
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

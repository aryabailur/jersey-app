
import React from 'react';
import { Star, ArrowLeft } from 'lucide-react';

export default function ProductDetail({ product, onBack }) {
  return (
    <section className="product-detail-page">
      <div className="container">
        <div style={{padding: '1rem 0'}}>
            <button onClick={onBack} className="button button--secondary">
                <ArrowLeft size={20} /> Back to Shop
            </button>
        </div>
        <div className="product-detail-grid">
          <div className="product-detail-image-container">
            <img
              src={product.imageUrl}
              alt={product.alt}
              className="product-detail-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/800x800/cccccc/ffffff?text=Image+Not+Found";
              }}
            />
          </div>
          <div className="product-detail-info">
            <p className="product-detail-team">{product.team}</p>
            <h1 className="product-detail-name">{product.name}</h1>
            <div className="product-detail-rating">
              <Star size={24} fill="currentColor" />
              <span>{product.rating}</span>
            </div>
            <p className="product-detail-price">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </p>
            <div className="product-detail-actions">
              <button className="button button--primary">Add to Cart</button>
              <button className="button button--secondary">Buy Now</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
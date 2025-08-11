import React from 'react';
import { Star } from 'lucide-react';
import { useInView } from '../hooks/useInView';

export default function ProductCard({ jersey, onProductClick }) {
  const [ref, isInView] = useInView({ threshold: 0.1, triggerOnce: true });

  const getTagClass = (tag) => {
    if (!tag) return "";
    const lowerCaseTag = tag.toLowerCase();
    if (lowerCaseTag.includes("sale")) return "product-card__tag--sale";
    if (lowerCaseTag.includes("limited")) return "product-card__tag--limited";
    return "product-card__tag--new";
  };

  return (
    <div
      ref={ref}
      className={`product-card ${isInView ? "is-visible" : ""}`}
      onClick={() => onProductClick(jersey)}
    >
      {jersey.tag && (
        <div className={`product-card__tag ${getTagClass(jersey.tag)}`}>
          {jersey.tag}
        </div>
      )}
      <div className="product-card__image-wrapper">
        <img
          src={jersey.imageUrl}
          alt={jersey.alt || `${jersey.team} - ${jersey.name}` || "Jersey Image"}
          className="product-card__image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/400x400/cccccc/ffffff?text=Image+Not+Found";
          }}
        />
      </div>
      <div className="product-card__info">
        <p className="product-card__team">{jersey.team}</p>
        <h3 className="product-card__name">{jersey.name}</h3>
        <div className="product-card__footer">
          <p className="product-card__price">
            ₹{Number(jersey.price).toLocaleString("en-IN")}
          </p>
          <div className="product-card__rating">
            <Star size={18} fill="currentColor" />
            <span>{jersey.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
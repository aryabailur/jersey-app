// src/components/CategoryGrid.js
import React from "react";

// Updated categories to match your new structure
const categories = [
  { id: 1, name: "Club Kits", image: "/assets/clubkit.png" }, // Replace with your actual image path
  { id: 2, name: "National Kits", image: "/assets/nationalkit.png" }, // Replace with your actual image path
  { id: 3, name: "Player Version", image: "/assets/player-version-bg.jpg" }, // Replace with your actual image path
];

export default function CategoryGrid() {
  return (
    // The main container for the whole section
    <div className="home-categories">
      {/* The grid that holds the category cards */}
      <div className="category-grid">
        {categories.map((cat) => (
          // Each individual category card
          <div key={cat.id} className="category-item">
            {/* The background image */}
            <div className="category-item__background">
              <img src={cat.image} alt={cat.name} />
            </div>
            {/* The overlay for the text content */}
            <div className="category-item__overlay">
              <h3 className="category-item__title">{cat.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

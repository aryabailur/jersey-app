// src/components/CategoryGrid.js
import React from "react";

const categories = [
  { id: 1, name: "Men's Jerseys", image: "/images/mens-jersey.jpg" },
  { id: 2, name: "Women's Jerseys", image: "/images/womens-jersey.jpg" },
  { id: 3, name: "Kids' Jerseys", image: "/images/kids-jersey.jpg" },
];

export default function CategoryGrid() {
  return (
    <div className="category-grid" style={styles.grid}>
      {categories.map((cat) => (
        <div key={cat.id} style={styles.card}>
          <img
            src={cat.image}
            alt={cat.name}
            style={styles.image}
          />
          <h3>{cat.name}</h3>
        </div>
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    padding: "20px",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
    textAlign: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
  image: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "8px",
  },
};

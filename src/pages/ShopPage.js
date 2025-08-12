import React, { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
// ✅ STEP 1: Import the ProductDetail component from its file.
// Make sure the path "../components/ProductDetail.js" is correct for your project structure.
import ProductDetail from "../components/ProductDetail.js";
import { Search, ChevronDown, Star } from "lucide-react";

// --- PRODUCT CARD COMPONENT ---
const ProductCard = ({ jersey, onProductClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const safeJersey = jersey || {};
  const team = safeJersey.team || "Unknown Team";
  const name = safeJersey.name || "Unnamed Jersey";
  const rating = safeJersey.rating || "N/A";
  const imageUrl =
    safeJersey.imageUrl ||
    "https://placehold.co/400x400/222222/f5f5f5?text=No+Image";

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(safeJersey.price || 0);

  const getTag = (tag) => {
    if (!tag) return null;
    const tagLower = tag.toLowerCase();
    if (tagLower.includes("new"))
      return (
        <div className="product-card__tag product-card__tag--new">New</div>
      );
    if (tagLower.includes("sale"))
      return (
        <div className="product-card__tag product-card__tag--sale">Sale</div>
      );
    if (tagLower.includes("limited"))
      return (
        <div className="product-card__tag product-card__tag--limited">
          Limited
        </div>
      );
    return (
      <div className="product-card__tag product-card__tag--limited">{tag}</div>
    );
  };

  return (
    <div
      className={`product-card ${isVisible ? "is-visible" : ""}`}
      onClick={() => onProductClick(safeJersey)}
    >
      <div className="product-card__image-wrapper">
        {getTag(safeJersey.tag)}
        <img
          src={imageUrl}
          alt={`${team} - ${name}`}
          className="product-card__image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/400x400/222222/f5f5f5?text=Image+Not+Found";
          }}
        />
      </div>
      <div className="product-card__info">
        <p className="product-card__team">{team}</p>
        <h3 className="product-card__name">{name}</h3>
        <div className="product-card__footer">
          <p className="product-card__price">{formattedPrice}</p>
          <div className="product-card__rating">
            <Star size={16} fill="currentColor" />
            <span>{rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SHOP PAGE COMPONENT ---
export default function ShopPage({ user }) {
  const [jerseys, setJerseys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [activeFilter, setActiveFilter] = useState("All");

  // ✅ STEP 2: Create a state to hold the product that the user clicks on.
  // It starts as 'null' (meaning no product is selected).
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const firestorePath = `artifacts/jerseyhub/public/data/products`;
    const q = collection(db, firestorePath);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jerseysData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJerseys(jerseysData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // This function updates the state when a card is clicked
  const handleProductClick = (product) => setSelectedProduct(product);
  // This function closes the detail view
  const handleBackToShop = () => setSelectedProduct(null);

  const filteredJerseys = useMemo(() => {
    return jerseys.filter((j) => {
      const name = j.name || "";
      const team = j.team || "";
      const tag = j.tag || "";
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      switch (activeFilter) {
        case "New":
          return tag.toLowerCase().includes("new");
        case "On Sale":
          return tag.toLowerCase().includes("sale");
        default:
          return true;
      }
    });
  }, [jerseys, searchQuery, activeFilter]);

  const sortedAndFilteredJerseys = useMemo(() => {
    const sortable = [...filteredJerseys];
    switch (sortBy) {
      case "price-asc":
        return sortable.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-desc":
        return sortable.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "rating":
        return sortable.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return sortable.sort(
          (a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0)
        );
    }
  }, [filteredJerseys, sortBy]);

  return (
    // Use a React Fragment <> to wrap the two main sections
    <>
      {/* ✅ STEP 3: Conditionally render the ProductDetail component.
          This line means: "If 'selectedProduct' is NOT null, then show the ProductDetail component." */}
      {selectedProduct && (
        <ProductDetail product={selectedProduct} onBack={handleBackToShop} />
      )}

      <main className="shoppage">
        <div className="container">
          <div className="shoppage__header">
            <h1 className="shoppage__title">
              Shop Our{" "}
              <span className="shoppage__title--highlight">Collection</span>
            </h1>
            <div className="search-bar">
              <Search className="search-bar__icon" size={20} />
              <input
                type="text"
                placeholder="Search jerseys by name..."
                className="search-bar__input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-bar">
            <div className="filter-bar__group">
              <span className="filter-bar__label">Filter by:</span>
              {["All", "New", "On Sale"].map((filter) => (
                <button
                  key={filter}
                  className={`filter-bar__button ${
                    activeFilter === filter ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="filter-bar__group">
              <label htmlFor="sort-by" className="filter-bar__label">
                Sort by:
              </label>
              <div className="filter-bar__select-wrapper">
                <select
                  id="sort-by"
                  className="filter-bar__select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popularity">Popularity</option>
                  <option value="rating">Rating</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <ChevronDown className="filter-bar__select-icon" size={16} />
              </div>
            </div>
          </div>
          <section className="product-section">
            {isLoading ? (
              <p style={{ textAlign: "center", padding: "4rem" }}>
                Loading Products...
              </p>
            ) : (
              <div className="product-grid">
                {sortedAndFilteredJerseys.map((jersey) => (
                  <ProductCard
                    key={jersey.id}
                    jersey={jersey}
                    onProductClick={handleProductClick}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

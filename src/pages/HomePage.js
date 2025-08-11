import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

// Import reusable components
import HeroSection from '../components/HeroSection';
import FilterBar from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';

export default function HomePage({ searchQuery }) {
  const [jerseys, setJerseys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("popularity");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const firestorePath = `artifacts/jerseyhub/public/data/products`;
    const q = collection(db, firestorePath);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jerseysData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJerseys(jerseysData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleProductClick = (product) => setSelectedProduct(product);
  const handleBackToShop = () => setSelectedProduct(null);

  const filteredJerseys = useMemo(() =>
    jerseys.filter(
      (j) =>
        j.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.team.toLowerCase().includes(searchQuery.toLowerCase())
    ), [jerseys, searchQuery]);

  const sortedAndFilteredJerseys = useMemo(() => {
    const sortable = [...filteredJerseys];
    switch (sortBy) {
      case 'price-asc': return sortable.sort((a, b) => a.price - b.price);
      case 'price-desc': return sortable.sort((a, b) => b.price - a.price);
      case 'rating': return sortable.sort((a, b) => b.rating - a.rating);
      default: return sortable.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
    }
  }, [filteredJerseys, sortBy]);

  if (selectedProduct) {
    return <ProductDetail product={selectedProduct} onBack={handleBackToShop} />;
  }

  return (
    <>
      {searchQuery === "" && <HeroSection />}
      {searchQuery === "" && <FilterBar sortBy={sortBy} onSortChange={setSortBy} />}
      <section className="product-section">
        <div className="container">
          {isLoading ? <p style={{ textAlign: 'center', padding: '4rem' }}>Loading Products...</p> : (
            <div className="product-grid">
              {sortedAndFilteredJerseys.map((jersey) => (
                <ProductCard key={jersey.id} jersey={jersey} onProductClick={handleProductClick} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
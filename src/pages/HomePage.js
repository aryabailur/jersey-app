import React from 'react';

// Import reusable components
import HeroSection from '../components/HeroSection';
import CategoryGrid from '../components/CategoryGrid'; // Import the new component

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid /> 
      {/* You can add other homepage sections here, like featured products */}
    </>
  );
}

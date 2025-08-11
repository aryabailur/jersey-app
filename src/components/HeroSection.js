import React from 'react';

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__bg"></div>
      <div className="hero__content">
        <h1 className="hero__title">Gear Up. Stand Out. Play Loud.</h1>
        <p className="hero__subtitle">
          The official 2024/25 kits have landed. Find your team's colours and
          support them in style.
        </p>
        <a href="#products" className="button button--primary">
          Shop The Collection
        </a>
      </div>
      <div className="hero__fade"></div>
    </section>
  );
}
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function HeroSection() {
  const containerRef = useRef(null);
  
  // Track scroll progress for subtle parallax, no scroll-locking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax effects for normal scrolling
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  
  // Jersey 3D tilt and scale parallax
  const yJersey = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const rotateXJersey = useTransform(scrollYProgress, [0, 1], [0, 15]);
  const scaleJersey = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const opacityJersey = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  return (
    <section ref={containerRef} className="hero-modern-container">
      <div className="hero-bg-dark"></div>
      
      <div className="hero-content-wrapper">
        <motion.div 
          className="hero-text-content"
          style={{ y: yText, opacity: opacityText }}
        >
          <h1 className="hero-title-main">
            Gear Up.<br/>Stand Out.<br/><span className="text-accent">Play Loud.</span>
          </h1>
          <p className="hero-subtitle-main">
            The official kits have landed. Find your team's colours and
            support them in style.
          </p>
          <a href="#products" className="button button--primary hero-btn-main">
            Shop The Collection
          </a>
        </motion.div>

        {/* The floating Real Madrid jersey */}
        <motion.div 
          className="hero-jersey-wrapper"
          style={{ 
            y: yJersey,
            rotateX: rotateXJersey,
            scale: scaleJersey,
            opacity: opacityJersey,
            perspective: 1000
          }}
          // Add a subtle floating animation that runs continuously
          animate={{
            y: [0, -15, 0],
            rotateY: [-2, 2, -2]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img src="/assets/real-madrid-jersey.png" alt="Real Madrid Kit" className="hero-jersey-img" />
          
          {/* Subtle glow behind the jersey */}
          <div className="hero-jersey-glow"></div>
        </motion.div>
      </div>
      
      <div className="hero-fade-bottom"></div>
    </section>
  );
}
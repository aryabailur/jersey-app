import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function HeroSection() {
  const containerRef = useRef(null);
  
  // Track scroll progress relative to this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Advanced animations for the Jersey
  const rotateZ = useTransform(scrollYProgress, [0, 1], [0, 360]); // Full 360 rotation
  const scale = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [1, 1.3, 0.8, 0.5]); // Dynamic scale
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "80%"]);
  const opacity = useTransform(scrollYProgress, [0.8, 1], [1, 0]); // Fade out at the very end

  // Animations for text
  const textOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.15], [0, -100]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.5]);

  return (
    <section ref={containerRef} className="hero-scroll-container">
      <div className="hero-sticky">
        <motion.div className="hero-bg-dark" style={{ opacity: bgOpacity }}></motion.div>
        
        <motion.div 
          className="hero-text-content"
          style={{ opacity: textOpacity, y: textY }}
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

        {/* The rotating jersey */}
        <motion.div 
          className="hero-jersey-wrapper"
          style={{ 
            rotateZ, 
            scale, 
            opacity,
            y 
          }}
        >
          <img src="/assets/clubkit.png" alt="Official Kit" className="hero-jersey-img" />
          
          {/* Subtle glow behind the jersey */}
          <div className="hero-jersey-glow"></div>
        </motion.div>
        
        <div className="hero-fade-bottom"></div>
      </div>
    </section>
  );
}
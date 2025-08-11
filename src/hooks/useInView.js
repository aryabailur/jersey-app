import { useState, useEffect, useRef } from 'react';

// Make sure 'export' keyword is here
export const useInView = (options) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (typeof window.IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }
    const observer = new window.IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        if (entry.target) {
          observer.unobserve(entry.target);
        }
      }
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);

  return [ref, isInView];
};
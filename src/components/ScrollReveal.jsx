
import { useEffect, useRef, useState } from 'react';

const ScrollReveal = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        // Cuando el elemento entra en el visor (viewport)
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Una vez que es visible, dejamos de observar para que no se repita
          observer.unobserve(domRef.current);
        }
      });
    }, { threshold: 0.1 }); // Se activa cuando el 10% del componente es visible

    observer.observe(domRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
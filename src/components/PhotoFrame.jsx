import { useState, useEffect } from 'react';

const PhotoFrame = ({ images = [], alt = "Momento especial" }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    // Solo activamos el timer si hay más de una imagen
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 4000); // Cambia cada 4 segundos (un poco más rápido que el Hero para dar dinamismo)

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="py-12 px-6 max-w-4xl mx-auto">
      {/* El marco con rotación y sombra */}
      <div className="border-2 border-boda-terracota p-2 rounded-2xl shadow-lg bg-white rotate-1 hover:rotate-0 transition-transform duration-500">
        
        {/* Contenedor de las imágenes con aspect ratio */}
        <div className="relative overflow-hidden rounded-xl aspect-[4/3] md:aspect-video bg-gray-100">
          
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${alt} ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out animate-slow-zoom ${
                index === current ? 'opacity-100' : 'opacity-0'
              }`}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/800x600?text=Error+al+cargar+imagen";
              }}
            />
          ))}

          {/* Indicadores sutiles (bolitas) en la esquina inferior para saber que hay más fotos */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 z-20 flex gap-1.5">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? 'bg-white scale-125' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoFrame;
/* src/components/MusicPlayer.jsx */
import { useState, useRef, useEffect } from 'react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Efecto para configurar el volumen al cargar el componente
  useEffect(() => {
    if (audioRef.current) {
      // Ajustamos el volumen aquí. 0.3 es el 30%.
      audioRef.current.volume = 0.35;
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play()
        .catch(err => console.log("Error al reproducir:", err));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-white/90 backdrop-blur-md p-2 pr-5 rounded-full shadow-lg border border-boda-terracota/20">
      
      {/* Etiqueta de audio con el archivo en /public */}
      <audio ref={audioRef} src="/music-boda.mp3" loop />

      <button 
        onClick={togglePlay}
        className="w-12 h-12 flex items-center justify-center bg-boda-terracota text-white rounded-full shadow-md transition-all active:scale-90 hover:scale-105"
      >
        {isPlaying ? (
          /* Icono Pausa */
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
        ) : (
          /* Icono Play */
          <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
        )}
      </button>

      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-widest font-bold text-boda-terracota">Nuestra Música</span>
        <span className="text-[9px] text-boda-texto italic">
          {isPlaying ? 'Reproduciendo...' : 'Toca para escuchar'}
        </span>
      </div>
    </div>
  );
};

export default MusicPlayer;
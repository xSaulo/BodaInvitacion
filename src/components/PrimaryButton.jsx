/* src/components/PrimaryButton.jsx */
const PrimaryButton = ({ 
  text, 
  href, 
  onClick, 
  variant = 'terracota', // 'terracota' o 'verde'
  icon 
}) => {
  
  // Clases base del botón
  const baseStyles = "inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full font-bold shadow-md transition-all duration-300 transform active:scale-95 hover:scale-105 text-white w-full md:w-auto";
  
  // Colores según la variante
  const variants = {
    terracota: "bg-boda-terracota hover:bg-boda-texto",
    verde: "bg-boda-verde hover:bg-boda-texto",
  };

  const className = `${baseStyles} ${variants[variant]}`;

  // Si tiene href, se comporta como un enlace externo
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {icon}
        {text}
      </a>
    );
  }

  // Si no, se comporta como un botón normal
  return (
    <button onClick={onClick} className={className}>
      {icon}
      {text}
    </button>
  );
};

export default PrimaryButton;
import PrimaryButton from './PrimaryButton';
const EventCard = ({ title, time, location, address, mapLink, icon }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm text-center flex flex-col items-center border border-boda-acento/5">
      <div className="text-boda-acento mb-4">
        {icon}
      </div>
      <h3 className="font-serif text-2xl mb-2">{title}</h3>
      <div className="w-16 h-[1px] bg-boda-acento mb-4"></div>
      <p className="font-bold text-lg">{time}</p>
      <p className="text-boda-texto mb-6 italic">
        {location} <br />
        <span className="text-sm not-italic opacity-70">{address}</span>
      </p>
      <PrimaryButton 
        text="¿CÓMO LLEGAR?" 
        href={mapLink} 
        variant="terracota" 
      />
    </div>
  );
};

export default EventCard;
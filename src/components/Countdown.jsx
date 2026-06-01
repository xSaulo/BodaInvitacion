import { useState, useEffect } from 'react';

const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const Item = ({ value, label }) => (
    <div className="text-center">
      <span className="block text-4xl md:text-6xl font-serif text-boda-oliva-oscuro font-light tracking-tighter">
        {value < 10 ? `0${value}` : value}
      </span>
      <span className="text-[9px] md:text-[10px] uppercase tracking-[2px] text-boda-texto/60 mt-2 block font-sans">
        {label}
      </span>
    </div>
  );

  const Separator = () => (
    <span className="text-3xl md:text-5xl font-serif text-boda-oliva-oscuro/30 mb-6">:</span>
  );

  return (
    <div className="flex justify-center items-center gap-2 md:gap-4 py-8">
      <Item value={timeLeft.days} label="Días" />
      <Separator />
      <Item value={timeLeft.hours} label="Horas" />
      <Separator />
      <Item value={timeLeft.minutes} label="Minutos" />
      <Separator />
      <Item value={timeLeft.seconds} label="Segundos" />
    </div>
  );
};

export default Countdown;
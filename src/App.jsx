import { useEffect, useMemo, useState } from 'react';
import Hero from './components/Hero';
import Countdown from './components/Countdown';
import EventCard from './components/EventCard';
import PhotoFrame from './components/PhotoFrame';
import GiftSection from './components/GiftSection';
import PhotoAlbum from './components/PhotoAlbum';
import MusicPlayer from './components/MusicPlayer';
import DressCode from './components/DressCode';
import { BookOpenText, Wine } from 'lucide-react';
import ScrollReveal from './components/ScrollReveal';
import ConfirmationSection from './components/ConfirmationSection';
import AdminAccessButton from './components/AdminAccessButton';
import AdminLoginModal from './components/AdminLoginModal';
import AdminPanelPage from './components/AdminPanelPage';
import { readLegacyLocalGuests, writeLocalGuests } from './utils/guestStorage';

function App() {
  const [guests, setGuests] = useState(() => readLegacyLocalGuests());
  const [view, setView] = useState(() => (window.location.hash === '#admin' ? 'admin' : 'site'));
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  useEffect(() => {
    writeLocalGuests(guests);
  }, [guests]);

  useEffect(() => {
    const handleHashChange = () => {
      setView(window.location.hash === '#admin' ? 'admin' : 'site');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const sortedGuests = useMemo(
    () => [...guests].sort((left, right) => new Date(right.requestedAt) - new Date(left.requestedAt)),
    [guests],
  );

  const handleGuestSubmit = (guest) => {
    setGuests((currentGuests) => [guest, ...currentGuests]);
  };

  const confirmGuest = (guestId) => {
    setGuests((currentGuests) =>
      currentGuests.map((guest) =>
        guest.id === guestId
          ? { ...guest, status: 'confirmed', confirmedAt: new Date().toISOString() }
          : guest,
      ),
    );
  };

  const revertGuestToPending = (guestId) => {
    setGuests((currentGuests) =>
      currentGuests.map((guest) =>
        guest.id === guestId
          ? { ...guest, status: 'pending', confirmedAt: null }
          : guest,
      ),
    );
  };

  const deleteGuest = (guestId) => {
    setGuests((currentGuests) => currentGuests.filter((guest) => guest.id !== guestId));
  };

  const openAdminModal = () => {
    setIsAdminModalOpen(true);
  };

  const closeAdminModal = () => {
    setIsAdminModalOpen(false);
  };

  const handleAdminAccessGranted = () => {
    setIsAdminModalOpen(false);
    window.location.hash = '#admin';
  };

  if (view === 'admin') {
    return (
      <>
        <AdminAccessButton isAdminView />
        <AdminPanelPage
          guests={sortedGuests}
          onConfirmGuest={confirmGuest}
          onRevertGuest={revertGuestToPending}
          onDeleteGuest={deleteGuest}
        />
      </>
    );
  }

  return (
    <>
      <main className="bg-boda-oliva text-boda-texto font-sans overflow-x-hidden transition-colors duration-500">
      
      <MusicPlayer />
      <ScrollReveal>
      <Hero />
      </ScrollReveal>

      {/* Sección Contador - Diseño Elegante y Centrado */}
      <ScrollReveal>
      <section className="bg-white/40 backdrop-blur-sm py-16 border-y border-boda-oliva-oscuro/10">
        <h3 className="text-center text-boda-oliva-oscuro uppercase tracking-[4px] text-xs mb-4 font-semibold">
          Faltan tan solo...
        </h3>
        {/* FECHA AJUSTADA: 15 de Enero de 2027 */}
        <Countdown targetDate="2027-01-15T16:00:00" />
      </section>
      </ScrollReveal>

      {/* Imagen después de la cuenta regresiva */}
      <ScrollReveal>
      <PhotoFrame images={["/photo_5.jpeg"]} alt="Nosotros" />
      </ScrollReveal>
      
      {/* Mensaje de bienvenida */}
      <ScrollReveal>
      <section className="py-16 text-center px-6">
        <h2 className="font-serif text-4xl mb-6 text-boda-oliva-oscuro">¡Estás invitado!</h2>
        <p className="max-w-2xl mx-auto leading-relaxed text-lg opacity-90">
          Hay momentos en la vida que son únicos, y compartirlos con las personas que más queremos los hace inolvidables. Gracias por ser parte de nuestra historia.
        </p>
      </section>
      </ScrollReveal>

      {/* Detalles de los Eventos - Iconos Minimalistas */}
      <ScrollReveal>
      <section className="py-20 bg-boda-crema px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <EventCard 
            title="Civil y Discurso"
            time="16:00 hs"
            location="Salón del Reino"
            address="Las Golondrinas 1738 - Barrio Bancario"
            mapLink="https://maps.app.goo.gl/TYMZQhhha1KsGyTQ8?g_st=aw" 
            icon={<BookOpenText size={44} strokeWidth={1} className="text-boda-oliva-oscuro" />}
          />
          <EventCard 
            title="Celebración"
            time="18:00 hs a 02:00 hs"
            location="Salón de Fiestas Turquesa"
            address="Av. Suiza y Punta del Este - Barrio Morosini"
            mapLink="https://maps.app.goo.gl/AmwmwCZhLQdTUDtGA?g_st=iw"
            icon={<Wine size={44} strokeWidth={1} className="text-boda-oliva-oscuro" />}
          />
        </div>
      </section>
      </ScrollReveal>

      {/* Sección de Detalles: Vestimenta y Regalos */}
      <ScrollReveal>
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <PhotoFrame images={["/photo_4.jpeg", "/photo_6.jpeg"]} alt="Nosotros" />
          
          <div className="grid md:grid-cols-2 gap-12 items-start bg-white/50 backdrop-blur-md rounded-[50px] p-10 md:p-16 border border-white mt-12 shadow-sm">
            <DressCode />
            <div className="border-t md:border-t-0 md:border-l border-boda-oliva-oscuro/10 pt-10 md:pt-0 md:pl-10">
              <GiftSection />
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Sección de Álbum */}
      <ScrollReveal>
      <section className="py-24 px-6 bg-white/30">
        <div className="max-w-4xl mx-auto text-center">
          <PhotoFrame images={["/photo_album_1.jpeg", "/photo_album_2.jpeg", "/photo_album_3.jpeg", "/photo_album_4.jpeg"]} alt="Momentos divertidos" />
          <div className="bg-white rounded-[50px] p-16 shadow-sm border border-boda-verde/20 mt-12">
            <PhotoAlbum />
          </div>
        </div>
      </section>
      </ScrollReveal>
      
      <ScrollReveal>
      <ConfirmationSection
        guests={sortedGuests}
        onGuestSubmit={handleGuestSubmit}
      />
      </ScrollReveal>

      <footer className="relative py-12 text-center text-[10px] tracking-[4px] opacity-40 text-boda-oliva-oscuro uppercase">
        <div className="flex flex-col items-center gap-3 px-6">
          <p>HECHO CON AMOR • 2027</p>
        </div>
        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6">
          <AdminAccessButton isAdminView={false} onOpen={openAdminModal} />
        </div>
      </footer>
      </main>

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={closeAdminModal}
        onSuccess={handleAdminAccessGranted}
      />
    </>
  );
}

export default App;

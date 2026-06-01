import { useState } from 'react';
import { Clock3, UserPlus2 } from 'lucide-react';
import PrimaryButton from './PrimaryButton';
import { createGuest, getGuestNameKey, normalizeGuestName } from '../utils/guestStorage';

const ConfirmationSection = ({ guests, onGuestSubmit, isLoadingGuests, isSyncingGuests, guestError }) => {
  const [guestName, setGuestName] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleGuestSubmit = async (event) => {
    event.preventDefault();
    const normalizedName = normalizeGuestName(guestName);

    if (!normalizedName) {
      setFeedback('Ingresa tu nombre para enviar la solicitud.');
      return;
    }

    const normalizedNameKey = getGuestNameKey(normalizedName);

    const existingGuest = guests.find(
      (guest) => getGuestNameKey(guest.name) === normalizedNameKey,
    );

    if (existingGuest) {
      setFeedback(
        existingGuest.status === 'confirmed'
          ? 'Tu asistencia ya fue confirmada por el admin.'
          : 'Tu solicitud ya fue enviada y está en espera de confirmación.',
      );
      return;
    }

    try {
      await onGuestSubmit(createGuest(normalizedName));
      setGuestName('');
      setFeedback('Solicitud enviada. Quedaste en espera de confirmación.');
    } catch (error) {
      setFeedback(error.message || 'No se pudo enviar la solicitud.');
    }
  };

  return (
    <section className="py-24 bg-white px-6 border-t border-boda-oliva-oscuro/10">
      <div className="mx-auto max-w-3xl space-y-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-5xl mb-8 text-boda-oliva-oscuro">Confirmación</h2>
          <div className="space-y-6">
            <p className="text-xl leading-relaxed text-boda-texto">
              Ingresa tu nombre para enviar tu asistencia. El admin verá tu solicitud y la aprobará desde un panel independiente.
            </p>
            <p className="text-sm text-boda-texto/70 italic max-w-2xl mx-auto">
              Las solicitudes quedan compartidas entre dispositivos usando almacenamiento centralizado en Vercel.
            </p>
          </div>
        </div>

        {guestError ? (
          <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
            {guestError}
          </div>
        ) : null}

        <div className="rounded-[40px] border border-boda-verde/20 bg-boda-crema/60 p-8 shadow-sm backdrop-blur-sm">
          <div className="mb-8 flex items-center gap-3 text-boda-oliva-oscuro">
            <div className="rounded-full bg-white p-3 shadow-sm">
              <UserPlus2 size={24} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[3px]">Invitado</p>
              <h3 className="font-serif text-3xl">Registrar asistencia</h3>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleGuestSubmit}>
            <label className="block text-left">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[3px] text-boda-oliva-oscuro">
                Nombre del invitado
              </span>
              <input
                type="text"
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                placeholder="Ej. Mariana López"
                className="w-full rounded-[22px] border border-boda-verde/20 bg-white px-5 py-4 text-boda-texto outline-none transition focus:border-boda-verde focus:ring-2 focus:ring-boda-verde/20"
              />
            </label>

            <PrimaryButton
              text={isSyncingGuests ? 'ENVIANDO...' : 'ENVIAR SOLICITUD'}
              variant="verde"
              disabled={isLoadingGuests || isSyncingGuests}
            />
          </form>

          <div className="mt-6 rounded-[26px] border border-dashed border-boda-oliva-oscuro/15 bg-white/70 p-5 text-left">
            <div className="mb-3 flex items-center gap-2 text-boda-oliva-oscuro">
              <Clock3 size={18} strokeWidth={1.8} />
              <p className="text-xs font-semibold uppercase tracking-[3px]">Estado</p>
            </div>
            <p className="text-sm leading-relaxed text-boda-texto/80">
              {feedback || 'Todavía no has enviado ninguna solicitud al listado compartido.'}
            </p>
          </div>

          <div className="mt-6 rounded-[30px] border border-white/70 bg-white/80 px-6 py-5 text-left shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[3px] text-boda-oliva-oscuro">
              Invitados registrados en general
            </p>
            <p className="mt-3 font-serif text-4xl text-boda-oliva-oscuro">{guests.length}</p>
            <p className="mt-2 text-sm text-boda-texto/70">
              {isLoadingGuests
                ? 'Cargando invitados compartidos...'
                : 'Las solicitudes se comparten entre celulares, computadoras y el panel admin.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConfirmationSection;
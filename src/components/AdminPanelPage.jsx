import { Check, Clock3, Download, Filter, ListChecks, RotateCcw, Search, ShieldCheck, Trash2, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import PrimaryButton from './PrimaryButton';
import { buildGuestFamilyGroups, formatGuestDate, getGuestFirstSurname } from '../utils/guestStorage';

const StatusBadge = ({ status }) => {
  const variants = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const labels = {
    pending: 'En espera',
    confirmed: 'Confirmado',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[2px] ${variants[status]}`}>
      {labels[status]}
    </span>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="rounded-[28px] border border-boda-verde/20 bg-boda-crema/70 p-5 text-left shadow-sm">
    <div className="mb-3 flex items-center gap-3 text-boda-oliva-oscuro">
      <div className="rounded-full bg-white p-2 shadow-sm">{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-[3px]">{label}</p>
    </div>
    <p className="font-serif text-4xl text-boda-oliva-oscuro">{value}</p>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="rounded-[24px] border border-dashed border-boda-verde/20 bg-white/60 px-5 py-6 text-sm italic text-boda-texto/70">
    {text}
  </div>
);

const SectionHeader = ({ icon, title, description, tone }) => {
  const tones = {
    pending: 'bg-amber-50 border-amber-200/70 text-amber-900',
    confirmed: 'bg-emerald-50 border-emerald-200/70 text-emerald-900',
  };

  return (
    <div className={`rounded-[26px] border px-5 py-4 ${tones[tone]}`}>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <h2 className="font-serif text-2xl">{title}</h2>
      </div>
      <p className="text-sm leading-relaxed opacity-75">{description}</p>
    </div>
  );
};

const AdminPanelPage = ({ guests, onConfirmGuest, onRevertGuest, onDeleteGuest }) => {
  const [selectedFamily, setSelectedFamily] = useState('Todas');
  const [activeView, setActiveView] = useState('pending');
  const [nameQuery, setNameQuery] = useState('');

  const familyGroups = useMemo(() => buildGuestFamilyGroups(guests), [guests]);

  const familyOptions = useMemo(() => {
    return [
      { value: 'Todas', label: 'Todas las familias' },
      ...familyGroups.map((group) => ({
        value: group.id,
        label: `${group.label} (${group.members.length})`,
      })),
    ];
  }, [familyGroups]);

  const guestFamilyMap = useMemo(() => {
    const entries = familyGroups.flatMap((group) =>
      group.members.map((guest) => [guest.id, group]),
    );

    return new Map(entries);
  }, [guests]);

  const filteredGuests = useMemo(() => {
    const normalizedQuery = nameQuery.trim().toLowerCase();

    return guests.filter((guest) => {
      const matchesFamily = selectedFamily === 'Todas'
        ? true
        : guestFamilyMap.get(guest.id)?.id === selectedFamily;

      const matchesName = normalizedQuery
        ? guest.name.toLowerCase().includes(normalizedQuery)
        : true;

      return matchesFamily && matchesName;
    });
  }, [guests, guestFamilyMap, selectedFamily, nameQuery]);

  const pendingGuests = filteredGuests.filter((guest) => guest.status === 'pending');
  const confirmedGuests = filteredGuests.filter((guest) => guest.status === 'confirmed');
  const allGuests = filteredGuests;

  const exportGuestsToExcel = () => {
    const rows = allGuests.map((guest) => ({
      Nombre: guest.name,
      Familia: guestFamilyMap.get(guest.id)?.label || getGuestFirstSurname(guest.name),
      Estado: guest.status === 'confirmed' ? 'Confirmado' : 'En espera',
      'Fecha de solicitud': formatGuestDate(guest.requestedAt),
      'Fecha de confirmacion': guest.confirmedAt ? formatGuestDate(guest.confirmedAt) : 'Pendiente',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Mensaje: 'No hay invitados para exportar con los filtros actuales.' }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invitados');

    const activeFamily = familyOptions.find((option) => option.value === selectedFamily);
    const fileSuffix = selectedFamily === 'Todas'
      ? 'todos'
      : activeFamily?.label.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'familia';
    XLSX.writeFile(workbook, `invitados-${fileSuffix}.xlsx`);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f7f8ef_0%,#edf0e0_48%,#dde3c4_100%)] px-6 py-24 text-boda-texto">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-boda-oliva-oscuro">
            <div className="rounded-full bg-white p-4 shadow-sm">
              <ShieldCheck size={28} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[4px]">Panel admin</p>
              <h1 className="font-serif text-4xl md:text-6xl">Gestión de invitados</h1>
            </div>
          </div>
          <StatusBadge status={pendingGuests.length > 0 ? 'pending' : 'confirmed'} />
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <StatCard icon={<Users size={18} strokeWidth={1.8} />} label="Total" value={filteredGuests.length} />
          <StatCard icon={<Clock3 size={18} strokeWidth={1.8} />} label="En espera" value={pendingGuests.length} />
          <StatCard icon={<Check size={18} strokeWidth={1.8} />} label="Confirmados" value={confirmedGuests.length} />
        </div>

        <div className="rounded-[40px] border border-boda-verde/20 bg-white/90 p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-8 grid gap-4 rounded-[28px] border border-boda-verde/15 bg-boda-crema/50 p-5 lg:grid-cols-[1.3fr_0.8fr_0.7fr] lg:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-boda-oliva-oscuro">
                <Filter size={18} strokeWidth={1.8} />
                <p className="text-xs font-semibold uppercase tracking-[3px]">Filtros</p>
              </div>
              <p className="text-sm text-boda-texto/70">
                Busca por nombre y combina el resultado con el filtro por primer apellido para ubicar invitados más rápido.
              </p>
            </div>

            <label className="block text-left">
              <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[3px] text-boda-oliva-oscuro">
                <Search size={14} strokeWidth={1.8} />
                Buscar por nombre
              </span>
              <input
                type="text"
                value={nameQuery}
                onChange={(event) => setNameQuery(event.target.value)}
                placeholder="Ej. Leonardo Garcia"
                className="w-full rounded-[18px] border border-boda-verde/20 bg-white px-4 py-3 text-boda-texto outline-none transition focus:border-boda-verde focus:ring-2 focus:ring-boda-verde/20"
              />
            </label>

            <label className="block min-w-[220px] text-left">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[3px] text-boda-oliva-oscuro">
                Grupo familiar
              </span>
              <select
                value={selectedFamily}
                onChange={(event) => setSelectedFamily(event.target.value)}
                className="w-full rounded-[18px] border border-boda-verde/20 bg-white px-4 py-3 text-boda-texto outline-none transition focus:border-boda-verde focus:ring-2 focus:ring-boda-verde/20"
              >
                {familyOptions.map((family) => (
                  <option key={family.value} value={family.value}>
                    {family.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mb-8 flex flex-wrap gap-3 rounded-[24px] border border-boda-verde/15 bg-white/80 p-3">
            <button
              type="button"
              onClick={() => setActiveView('pending')}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[2px] transition ${
                activeView === 'pending'
                  ? 'bg-amber-100 text-amber-900 shadow-sm border border-amber-200'
                  : 'bg-transparent text-boda-texto/70 border border-transparent hover:bg-boda-crema/70'
              }`}
            >
              <Clock3 size={16} strokeWidth={1.8} />
              Lista de espera
              <span className="rounded-full bg-white/80 px-2 py-1 text-xs">{pendingGuests.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('all')}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[2px] transition ${
                activeView === 'all'
                  ? 'bg-emerald-100 text-emerald-900 shadow-sm border border-emerald-200'
                  : 'bg-transparent text-boda-texto/70 border border-transparent hover:bg-boda-crema/70'
              }`}
            >
              <ListChecks size={16} strokeWidth={1.8} />
              Todos los invitados
              <span className="rounded-full bg-white/80 px-2 py-1 text-xs">{allGuests.length}</span>
            </button>

            <button
              type="button"
              onClick={exportGuestsToExcel}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-boda-verde/20 bg-boda-crema/70 px-5 py-3 text-sm font-semibold uppercase tracking-[2px] text-boda-oliva-oscuro transition hover:bg-boda-crema"
            >
              <Download size={16} strokeWidth={1.8} />
              Exportar Excel
            </button>
          </div>

          <div className="space-y-8">
            {activeView === 'pending' ? (
            <section className="space-y-4">
              <SectionHeader
                icon={<Clock3 size={18} strokeWidth={1.8} />}
                title="Lista de espera"
                description="Solicitudes nuevas que todavía necesitan una decisión del admin."
                tone="pending"
              />

              {pendingGuests.length === 0 ? (
                <EmptyState text="No hay invitados pendientes por confirmar." />
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {pendingGuests.map((guest) => (
                    <div key={guest.id} className="rounded-[28px] border border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,248,220,0.88))] p-5 text-left shadow-sm">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <p className="font-serif text-2xl text-boda-oliva-oscuro">{guest.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[2px] text-boda-texto/60">
                            Familia: {guestFamilyMap.get(guest.id)?.label || getGuestFirstSurname(guest.name)}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[2px] text-boda-texto/60">
                            Solicitó el {formatGuestDate(guest.requestedAt)}
                          </p>
                        </div>
                        <StatusBadge status="pending" />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <div className="min-w-[220px] flex-1">
                          <PrimaryButton text="CONFIRMAR INVITADO" onClick={() => onConfirmGuest(guest.id)} variant="verde" />
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeleteGuest(guest.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[2px] text-red-700 transition hover:bg-red-50"
                        >
                          <Trash2 size={16} strokeWidth={1.8} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            ) : (
            <section className="space-y-4">
              <SectionHeader
                icon={<ListChecks size={18} strokeWidth={1.8} />}
                title="Todos los invitados"
                description="Vista general compacta con invitados en espera y confirmados, filtrados por familia cuando lo necesites."
                tone="confirmed"
              />

              {allGuests.length === 0 ? (
                <EmptyState text="No hay invitados registrados con el filtro actual." />
              ) : (
                <div className="grid gap-4">
                  {allGuests.map((guest) => (
                    <div key={guest.id} className={`grid gap-4 rounded-[26px] p-5 shadow-sm lg:grid-cols-[1.5fr_auto] lg:items-center ${
                      guest.status === 'confirmed'
                        ? 'border border-emerald-200/70 bg-[linear-gradient(90deg,rgba(247,252,249,0.98),rgba(239,248,243,0.92))]'
                        : 'border border-amber-200/70 bg-[linear-gradient(90deg,rgba(255,251,235,0.98),rgba(255,248,220,0.9))]'
                    }`}>
                      <div>
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <p className="font-serif text-2xl text-boda-oliva-oscuro">{guest.name}</p>
                          <StatusBadge status={guest.status} />
                        </div>
                        <div className="grid gap-1 text-xs uppercase tracking-[2px] text-boda-texto/60 sm:grid-cols-3">
                          <p>Familia: {getGuestFirstSurname(guest.name)}</p>
                          <p>Familia: {guestFamilyMap.get(guest.id)?.label || getGuestFirstSurname(guest.name)}</p>
                          <p>Solicitud: {formatGuestDate(guest.requestedAt)}</p>
                          <p>Confirmación: {guest.confirmedAt ? formatGuestDate(guest.confirmedAt) : 'Pendiente'}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 lg:justify-end">
                        {guest.status === 'confirmed' ? (
                          <button
                            type="button"
                            onClick={() => onRevertGuest(guest.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[2px] text-amber-700 transition hover:bg-amber-50"
                          >
                            <RotateCcw size={16} strokeWidth={1.8} />
                            Regresar a espera
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onConfirmGuest(guest.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[2px] text-emerald-700 transition hover:bg-emerald-50"
                          >
                            <Check size={16} strokeWidth={1.8} />
                            Confirmar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteGuest(guest.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[2px] text-red-700 transition hover:bg-red-50"
                        >
                          <Trash2 size={16} strokeWidth={1.8} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminPanelPage;
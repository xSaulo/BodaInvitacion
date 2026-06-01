import { ShieldCheck } from 'lucide-react';

const AdminAccessButton = ({ isAdminView, onOpen }) => {
  if (isAdminView) {
    return (
      <a
        href="#"
        className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-5 py-3 text-xs font-semibold uppercase tracking-[3px] text-boda-oliva-oscuro shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-boda-crema md:right-8 md:top-6"
      >
        <ShieldCheck size={18} strokeWidth={1.8} />
        Volver al sitio
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Abrir panel admin"
      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-boda-oliva-oscuro/5 bg-white/8 text-boda-oliva-oscuro/18 shadow-sm transition hover:bg-white/20 hover:text-boda-oliva-oscuro/28 focus:bg-white/20 focus:text-boda-oliva-oscuro/28 active:scale-95 md:h-11 md:w-11"
    >
      <ShieldCheck size={16} strokeWidth={1.8} />
    </button>
  );
};

export default AdminAccessButton;
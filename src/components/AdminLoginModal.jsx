import { useState } from 'react';
import { LockKeyhole, X } from 'lucide-react';

const ADMIN_PASSWORD = 'marideca28';

const AdminLoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setPassword('');
      setError('');
      onSuccess();
      return;
    }

    setError('La contrasena no es correcta.');
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-boda-texto/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[32px] border border-white/70 bg-white/95 p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 text-boda-oliva-oscuro">
            <div className="rounded-full bg-boda-crema p-3 shadow-sm">
              <LockKeyhole size={22} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[3px]">Acceso privado</p>
              <h2 className="font-serif text-3xl">Panel admin</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-boda-verde/15 text-boda-oliva-oscuro transition hover:bg-boda-crema"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-boda-texto/75">
          Ingresa la contrasena para abrir la vista administrativa de invitados.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-left">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[3px] text-boda-oliva-oscuro">
              Contrasena
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresa la contrasena"
              className="w-full rounded-[18px] border border-boda-verde/20 bg-white px-4 py-3 text-boda-texto outline-none transition focus:border-boda-verde focus:ring-2 focus:ring-boda-verde/20"
              autoFocus
            />
          </label>

          {error ? (
            <p className="text-sm font-medium text-red-700">{error}</p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center justify-center rounded-full border border-boda-verde/20 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[2px] text-boda-oliva-oscuro transition hover:bg-boda-crema"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-boda-verde px-6 py-3 text-sm font-semibold uppercase tracking-[2px] text-white transition hover:bg-boda-texto"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;
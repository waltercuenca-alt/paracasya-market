import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import { grantInternalAccess, hasInternalAccess, isInternalPinValid } from "../utils/internalAccess";

function ProtectedInternalRoute({ children }) {
  const [isAllowed, setIsAllowed] = useState(hasInternalAccess);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!isInternalPinValid(pin)) {
      setError("PIN incorrecto. Intentá nuevamente.");
      setPin("");
      return;
    }

    grantInternalAccess();
    setIsAllowed(true);
  }

  if (isAllowed) {
    return children;
  }

  return (
    <div className="page-container flex min-h-[calc(100vh-88px)] items-center justify-center py-12">
      <form
        className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-ocean-950/10"
        onSubmit={handleSubmit}
      >
        <div className="bg-ocean-950 px-6 py-7 text-white">
          <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white/10 text-delivery ring-1 ring-white/10">
            <LockKeyhole size={24} />
          </span>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-delivery">
            ParacasYa Market
          </p>
          <h1 className="mt-2 font-display text-3xl font-black">Acceso interno</h1>
          <p className="mt-2 text-sm text-blue-100">Ingresá el PIN para continuar.</p>
        </div>

        <div className="space-y-4 p-6">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-ocean-950">PIN</span>
            <input
              autoComplete="off"
              autoFocus
              className="input-field text-center text-lg font-black tracking-[0.35em]"
              inputMode="numeric"
              onChange={(event) => setPin(event.target.value)}
              placeholder="••••"
              type="password"
              value={pin}
            />
          </label>

          {error && (
            <p
              aria-live="polite"
              className="rounded-2xl bg-rose-50 p-3 text-center text-sm font-semibold text-rose-700"
            >
              {error}
            </p>
          )}

          <button className="button-primary w-full rounded-2xl py-4" type="submit">
            Entrar
          </button>
          <p className="text-center text-xs leading-relaxed text-slate-400">
            Protección temporal para operación interna. Luego se reemplazará por login real.
          </p>
        </div>
      </form>
    </div>
  );
}

export default ProtectedInternalRoute;

import { Menu, ShoppingBasket, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const mainNavigation = [
  { label: "Inicio", to: "/" },
  { label: "Tienda", to: "/cliente" },
];

const internalNavigation = [
  { label: "Caja", to: "/caja" },
  { label: "Admin", to: "/admin" },
];

function NavigationLink({ item, onClick }) {
  return (
    <NavLink
      onClick={onClick}
      to={item.to}
      className={({ isActive }) =>
        `rounded-full px-4 py-2 text-sm font-semibold transition ${
          isActive
            ? "bg-ocean-900 text-white shadow-sm"
            : "text-slate-600 hover:bg-ocean-50 hover:text-ocean-900"
        }`
      }
    >
      {item.label}
    </NavLink>
  );
}

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ocean-900/5 bg-white/90 backdrop-blur-xl">
      <div className="page-container flex h-18 items-center justify-between">
        <Link className="flex items-center gap-3" to="/" onClick={() => setIsOpen(false)}>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean-900 text-delivery shadow-brand">
            <ShoppingBasket size={22} strokeWidth={2.4} />
          </span>
          <span>
            <span className="block font-display text-lg font-extrabold leading-none text-ocean-900">
              ParacasYa
            </span>
            <span className="block text-xs font-bold uppercase tracking-[0.18em] text-ocean-500">
              Market Online
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {mainNavigation.map((item) => (
            <NavigationLink key={item.to} item={item} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 ring-1 ring-slate-100">
            <span className="px-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Interno
            </span>
            {internalNavigation.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    isActive
                      ? "bg-ocean-900 text-white"
                      : "text-slate-500 hover:bg-white hover:text-ocean-900"
                  }`
                }
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <Link className="button-primary py-3" to="/cliente">
            Pedir ahora
          </Link>
        </div>

        <button
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          className="rounded-xl border border-slate-200 p-2.5 text-ocean-900 md:hidden"
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <nav className="page-container flex flex-col gap-2 border-t border-slate-100 pb-5 pt-4 md:hidden">
          {mainNavigation.map((item) => (
            <NavigationLink key={item.to} item={item} onClick={() => setIsOpen(false)} />
          ))}
          <div className="mt-2 rounded-2xl bg-slate-50 p-3">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Acceso interno
            </p>
            <div className="flex gap-2">
              {internalNavigation.map((item) => (
                <NavigationLink key={item.to} item={item} onClick={() => setIsOpen(false)} />
              ))}
            </div>
          </div>
          <Link className="button-primary mt-2" onClick={() => setIsOpen(false)} to="/cliente">
            Pedir ahora
          </Link>
        </nav>
      )}
    </header>
  );
}

export default Header;

import { Outlet } from "react-router-dom";
import Header from "./Header";

function Layout() {
  return (
    <div className="min-h-screen bg-sand-50 text-ink">
      <Header />
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-ocean-900/5 bg-white">
        <div className="page-container flex flex-col gap-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-base font-bold text-ocean-900">ParacasYa Market</p>
            <p>El kiosco online de Paracas</p>
          </div>
          <p>Pedidos rápidos para hoteles, Airbnb y hogares de Paracas.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;

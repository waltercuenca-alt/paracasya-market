import {
  ArrowRight,
  Bike,
  CheckCircle2,
  Clock3,
  MapPinned,
  MessageCircleMore,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "../data/categories";

const steps = [
  {
    icon: ShoppingBag,
    title: "Elige lo que necesitas",
    copy: "Bebidas frías, snacks, playa y esenciales en un solo lugar.",
  },
  {
    icon: Smartphone,
    title: "Confirma tu entrega",
    copy: "Indica hotel, Airbnb o dirección y elige Yape o efectivo.",
  },
  {
    icon: Bike,
    title: "Recíbelo rápido",
    copy: "Preparamos y enviamos tu pedido dentro de Paracas.",
  },
];

const benefits = [
  { icon: Clock3, title: "Entrega ágil", copy: "Pensado para antojos y urgencias del viaje." },
  { icon: ShieldCheck, title: "Compra confiable", copy: "Precios claros y seguimiento del pedido." },
  { icon: MapPinned, title: "100% local", copy: "Servicio especializado en la zona de Paracas." },
  { icon: MessageCircleMore, title: "Atención directa", copy: "Confirmación sencilla por WhatsApp." },
];

function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute -right-24 top-8 h-72 w-72 rounded-full bg-delivery/15 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="page-container grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:py-20">
          <div className="relative z-10">
            <p className="eyebrow bg-white/10 text-cyan-100 ring-white/15">
              Delivery local rápido y confiable
            </p>
            <h1 className="mt-6 font-display text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              ParacasYa
              <span className="block text-delivery">Market</span>
            </h1>
            <p className="mt-5 font-display text-xl font-semibold text-white sm:text-2xl">
              El kiosco online de Paracas
            </p>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-blue-100 sm:text-lg">
              Pedí lo que necesites sin salir de casa. También entregamos en hoteles y Airbnb,
              para que disfrutes cada minuto de tu estadía.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="button-primary" to="/cliente">
                Pedir ahora <ArrowRight size={18} />
              </Link>
              <a className="button-ghost" href="#como-funciona">
                Ver cómo funciona
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-5 text-sm font-medium text-blue-100">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="text-delivery" size={18} /> Pago con Yape
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="text-delivery" size={18} /> Delivery en Paracas
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-sm sm:p-6">
              <div className="rounded-[1.6rem] bg-white p-4 shadow-xl sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ocean-500">
                      Entrega rápida
                    </p>
                    <p className="mt-1 font-display text-lg font-bold text-ocean-950">
                      Tu pedido de playa
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    Abierto
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    ["HI", "Bolsa de hielo", "S/ 8"],
                    ["SP", "Bloqueador SPF 50", "S/ 39"],
                    ["AG", "Agua mineral x2", "S/ 7"],
                  ].map(([label, name, price]) => (
                    <div
                      className="flex items-center gap-3 rounded-2xl bg-sand-50 p-3"
                      key={name}
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-xs font-extrabold text-ocean-900">
                        {label}
                      </span>
                      <span className="flex-1 text-sm font-semibold text-ocean-950">{name}</span>
                      <span className="text-sm font-bold text-ocean-900">{price}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-ocean-950 p-4 text-white">
                  <div>
                    <p className="text-xs text-blue-200">Total con delivery</p>
                    <p className="font-display text-xl font-extrabold">S/ 59</p>
                  </div>
                  <span className="rounded-xl bg-delivery px-4 py-3 text-sm font-bold text-ocean-950">
                    Confirmar
                  </span>
                </div>
              </div>
            </div>
            <div className="float-card absolute -bottom-5 -left-1 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-xl sm:-left-8">
              <PackageCheck className="text-emerald-600" size={25} />
              <div>
                <p className="text-xs text-slate-400">Pedido en camino</p>
                <p className="text-sm font-bold text-ocean-950">Llega pronto</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container py-14 sm:py-18">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Compra fácil</p>
            <h2 className="section-title">Categorías destacadas</h2>
          </div>
          <Link className="hidden font-semibold text-ocean-700 sm:flex sm:items-center sm:gap-2" to="/cliente">
            Ver tienda <ArrowRight size={17} />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((category) => (
            <Link
              className="card group flex flex-col items-center gap-3 px-2 py-5 text-center transition hover:-translate-y-1 hover:border-ocean-100"
              key={category.id}
              to="/cliente"
            >
              <span
                className={`flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br text-xs font-extrabold text-ocean-950 ${category.tone}`}
              >
                {category.short}
              </span>
              <span className="text-xs font-bold text-slate-700">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-14 sm:py-18" id="como-funciona">
        <div className="page-container">
          <div className="mx-auto max-w-xl text-center">
            <p className="eyebrow">Sin complicaciones</p>
            <h2 className="section-title">Cómo funciona</h2>
            <p className="mt-3 text-slate-500">
              Todo lo necesario para tu día en Paracas, en tres pasos simples.
            </p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, copy }, index) => (
              <div className="rounded-3xl border border-slate-100 bg-sand-50 p-6" key={title}>
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-900 text-delivery">
                    <Icon size={23} />
                  </span>
                  <span className="font-display text-3xl font-black text-ocean-100">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-ocean-950">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container py-14 sm:py-18">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow">Hecho para Paracas</p>
            <h2 className="section-title">Lo que hace mejor tu pedido</h2>
            <p className="mt-4 text-slate-500">
              Un servicio local premium que acompaña a turistas y residentes, desde el desayuno
              hasta ese último pedido antes del atardecer.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {benefits.map(({ icon: Icon, title, copy }) => (
              <div className="card flex gap-4 p-5" key={title}>
                <Icon className="mt-1 shrink-0 text-ocean-600" size={23} />
                <div>
                  <h3 className="font-display font-bold text-ocean-950">{title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container pb-14 sm:pb-18">
        <div className="relative overflow-hidden rounded-[2rem] bg-ocean-950 px-6 py-10 text-center text-white sm:px-10">
          <div className="absolute left-1/2 top-0 h-52 w-80 -translate-x-1/2 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="relative">
            <p className="eyebrow bg-white/10 text-delivery ring-white/10">ParacasYa Market</p>
            <h2 className="mx-auto mt-5 max-w-xl font-display text-3xl font-extrabold">
              Tu próximo pedido está a pocos toques
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-blue-100">
              Bebidas frías, hielo, comida y todo lo útil donde estés hospedado.
            </p>
            <Link className="button-primary mt-8" to="/cliente">
              Ir a la tienda <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default LandingPage;

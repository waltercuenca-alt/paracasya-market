import { Copy, Printer, QrCode } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  buildPartnerCommercialMessage,
  buildPartnerQrLink,
} from "../utils/partnerQrData";

async function copyToClipboard(text) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  window.prompt("Copiá este texto:", text);
}

function createPrintMarkup({ partner, link, qrDataUrl }) {
  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>QR ${partner.label}</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #f8f3e7;
            font-family: Inter, Arial, sans-serif;
            color: #0f2a44;
          }
          .card {
            width: min(420px, calc(100vw - 32px));
            border-radius: 32px;
            padding: 32px;
            background: white;
            box-shadow: 0 24px 80px rgba(15, 42, 68, 0.18);
            text-align: center;
          }
          .eyebrow {
            margin: 0 0 8px;
            color: #0b7894;
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 0.18em;
            text-transform: uppercase;
          }
          h1 {
            margin: 0;
            font-size: 30px;
            line-height: 1.05;
          }
          p {
            color: #516173;
            line-height: 1.5;
          }
          img {
            width: 240px;
            height: 240px;
            margin: 18px auto;
            display: block;
            border: 12px solid #f8f3e7;
            border-radius: 24px;
          }
          .cta {
            color: #0f2a44;
            font-size: 20px;
            font-weight: 900;
          }
          .link {
            margin-top: 16px;
            overflow-wrap: anywhere;
            font-size: 12px;
            color: #64748b;
          }
          @media print {
            body { background: white; }
            .card { box-shadow: none; border: 1px solid #e2e8f0; }
          }
        </style>
      </head>
      <body>
        <main class="card">
          <p class="eyebrow">ParacasYa Market</p>
          <h1>${partner.label}</h1>
          <p class="cta">Pedi agua, snacks y comida rapida sin salir de tu hotel.</p>
          <img src="${qrDataUrl}" alt="QR ${partner.label}" />
          <p>Escanea y hace tu pedido en ParacasYa Market.</p>
          <p class="link">${link}</p>
        </main>
        <script>
          window.onload = () => {
            window.focus();
            window.print();
          };
        </script>
      </body>
    </html>
  `;
}

function PartnerQrCard({ partner }) {
  const [baseUrl, setBaseUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const link = useMemo(() => buildPartnerQrLink(baseUrl, partner.slug), [baseUrl, partner.slug]);
  const message = useMemo(
    () => buildPartnerCommercialMessage(partner, link),
    [partner, link],
  );

  useEffect(() => {
    let isMounted = true;

    async function generateQr() {
      try {
        const QRCode = await import("qrcode");
        const dataUrl = await QRCode.toDataURL(link, {
          color: {
            dark: "#0f2a44",
            light: "#ffffff",
          },
          errorCorrectionLevel: "M",
          margin: 1,
          width: 260,
        });

        if (isMounted) {
          setQrDataUrl(dataUrl);
        }
      } catch (error) {
        console.error("No se pudo generar el QR:", error);
        if (isMounted) {
          setFeedback("No se pudo generar el QR.");
        }
      }
    }

    generateQr();

    return () => {
      isMounted = false;
    };
  }, [link]);

  async function handleCopyLink() {
    await copyToClipboard(link);
    setFeedback("Link copiado.");
  }

  async function handleCopyMessage() {
    await copyToClipboard(message);
    setFeedback("Mensaje copiado.");
  }

  function handlePrint() {
    if (!qrDataUrl) {
      setFeedback("Esperá a que cargue el QR.");
      return;
    }

    const printWindow = window.open("", "_blank", "noopener,noreferrer");

    if (!printWindow) {
      setFeedback("No se pudo abrir la ventana de impresión.");
      return;
    }

    printWindow.document.write(createPrintMarkup({ partner, link, qrDataUrl }));
    printWindow.document.close();
    setFeedback("Tarjeta lista para imprimir.");
  }

  return (
    <article className="card overflow-hidden p-4">
      <div className="rounded-[1.6rem] bg-gradient-to-br from-ocean-950 via-ocean-800 to-ocean-600 p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-delivery">
              Material QR
            </p>
            <h3 className="mt-2 font-display text-xl font-black">{partner.label}</h3>
            <p className="mt-1 text-xs font-semibold text-white/70">{partner.slug}</p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-delivery">
            <QrCode size={22} />
          </span>
        </div>

        <p className="mt-4 text-sm font-bold leading-relaxed">
          Pedí agua, snacks y comida rápida sin salir de tu hotel.
        </p>
        <p className="mt-1 text-xs leading-relaxed text-white/70">
          Escaneá y hacé tu pedido en ParacasYa Market.
        </p>
      </div>

      <div className="mt-4 flex justify-center rounded-[1.6rem] border border-slate-100 bg-white p-4">
        {qrDataUrl ? (
          <img
            alt={`QR para ${partner.label}`}
            className="h-48 w-48 rounded-2xl"
            src={qrDataUrl}
          />
        ) : (
          <div className="flex h-48 w-48 items-center justify-center rounded-2xl bg-slate-50 text-sm font-bold text-slate-400">
            Generando QR...
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
          Link de pedido
        </p>
        <p className="mt-1 break-words text-xs font-semibold leading-relaxed text-ocean-900">
          {link}
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <button className="button-secondary justify-center px-3 py-3 text-xs" onClick={handleCopyLink} type="button">
          <Copy size={15} />
          Copiar link
        </button>
        <button className="button-secondary justify-center px-3 py-3 text-xs" onClick={handleCopyMessage} type="button">
          <Copy size={15} />
          Copiar mensaje
        </button>
        <button className="button-primary justify-center rounded-2xl px-3 py-3 text-xs" onClick={handlePrint} type="button">
          <Printer size={15} />
          Imprimir
        </button>
      </div>

      {feedback && <p className="mt-3 text-center text-xs font-bold text-ocean-700">{feedback}</p>}
    </article>
  );
}

export default PartnerQrCard;

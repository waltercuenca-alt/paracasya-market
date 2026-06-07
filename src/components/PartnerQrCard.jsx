import { Copy, Download, Pencil, Printer, QrCode, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  buildPartnerCommercialMessage,
  buildPartnerQrFilename,
  buildPartnerQrLink,
} from "../utils/partnerQrData";

async function copyToClipboard(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  window.prompt("Copia este texto:", text);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createPrintMarkup({ partner, link, message, qrDataUrl }) {
  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>QR ${escapeHtml(partner.label)}</title>
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
          <h1>${escapeHtml(partner.label)}</h1>
          <p class="cta">${escapeHtml(message)}</p>
          <img src="${qrDataUrl}" alt="QR ${escapeHtml(partner.label)}" />
          <p>Escanea y hace tu pedido en ParacasYa Market.</p>
          <p class="link">${escapeHtml(link)}</p>
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

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = String(text || "").split(" ");
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    const metrics = context.measureText(testLine);

    if (metrics.width > maxWidth && line) {
      lines.push(line);
      line = word;
      return;
    }

    line = testLine;
  });

  if (line) {
    lines.push(line);
  }

  lines.slice(0, maxLines).forEach((currentLine, index) => {
    context.fillText(currentLine, x, y + index * lineHeight);
  });
}

async function createQrCardPng({ partner, link, message, qrDataUrl }) {
  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 1500;
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  const qrImage = await loadImage(qrDataUrl);

  context.fillStyle = "#f8f3e7";
  context.fillRect(0, 0, width, height);

  const gradient = context.createLinearGradient(120, 90, 960, 520);
  gradient.addColorStop(0, "#0f2a44");
  gradient.addColorStop(0.55, "#0b7894");
  gradient.addColorStop(1, "#facc15");
  context.fillStyle = gradient;
  context.roundRect(80, 80, 920, 520, 58);
  context.fill();

  context.fillStyle = "#ffffff";
  context.font = "900 34px Arial";
  context.letterSpacing = "3px";
  context.fillText("PARACASYA MARKET", 130, 170);

  context.font = "900 82px Arial";
  wrapCanvasText(context, partner.label, 130, 285, 820, 92, 2);

  context.font = "700 42px Arial";
  wrapCanvasText(context, message, 130, 470, 820, 52, 2);

  context.fillStyle = "#ffffff";
  context.roundRect(210, 650, 660, 660, 48);
  context.fill();
  context.drawImage(qrImage, 270, 710, 540, 540);

  context.fillStyle = "#0f2a44";
  context.font = "900 46px Arial";
  context.fillText("Pedi sin salir de tu hotel.", 165, 1395);

  context.fillStyle = "#64748b";
  context.font = "600 28px Arial";
  wrapCanvasText(context, link, 140, 1450, 800, 34, 2);

  return canvas.toDataURL("image/png");
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function PartnerQrCard({ onDelete, onEdit, partner }) {
  const [baseUrl, setBaseUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const link = useMemo(() => buildPartnerQrLink(baseUrl, partner.slug), [baseUrl, partner.slug]);
  const message = partner.message || "Pedi agua, snacks y comida rapida sin salir del hotel.";
  const commercialMessage = useMemo(
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
    await copyToClipboard(commercialMessage);
    setFeedback("Mensaje copiado.");
  }

  async function handleDownloadPng() {
    if (!qrDataUrl) {
      setFeedback("Espera a que cargue el QR.");
      return;
    }

    try {
      const dataUrl = await createQrCardPng({ partner, link, message, qrDataUrl });
      downloadDataUrl(dataUrl, buildPartnerQrFilename(partner));
      setFeedback("PNG descargado.");
    } catch (error) {
      console.error("No se pudo descargar el PNG:", error);
      setFeedback("No se pudo generar el PNG.");
    }
  }

  function handlePrint() {
    if (!qrDataUrl) {
      setFeedback("Espera a que cargue el QR.");
      return;
    }

    const printWindow = window.open("", "_blank", "noopener,noreferrer");

    if (!printWindow) {
      setFeedback("No se pudo abrir la ventana de impresion.");
      return;
    }

    printWindow.document.write(createPrintMarkup({ partner, link, message, qrDataUrl }));
    printWindow.document.close();
    setFeedback("Tarjeta lista para imprimir.");
  }

  function handleDelete() {
    if (!onDelete) {
      return;
    }

    const confirmed = window.confirm(`Eliminar el material QR de ${partner.label}?`);

    if (confirmed) {
      onDelete(partner.id);
    }
  }

  return (
    <article className="card overflow-hidden p-4">
      <div className="rounded-[1.6rem] bg-gradient-to-br from-ocean-950 via-ocean-800 to-ocean-600 p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-delivery">
              {partner.isBase ? "Material base" : "Material personalizado"}
            </p>
            <h3 className="mt-2 font-display text-xl font-black">{partner.label}</h3>
            <p className="mt-1 text-xs font-semibold text-white/70">{partner.slug}</p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-delivery">
            <QrCode size={22} />
          </span>
        </div>

        <p className="mt-4 text-sm font-bold leading-relaxed">{message}</p>
        <p className="mt-1 text-xs leading-relaxed text-white/70">
          Escanea y hace tu pedido en ParacasYa Market.
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

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button className="button-secondary justify-center px-3 py-3 text-xs" onClick={handleCopyLink} type="button">
          <Copy size={15} />
          Copiar link
        </button>
        <button className="button-secondary justify-center px-3 py-3 text-xs" onClick={handleCopyMessage} type="button">
          <Copy size={15} />
          Copiar mensaje
        </button>
        <button className="button-secondary justify-center px-3 py-3 text-xs" onClick={handleDownloadPng} type="button">
          <Download size={15} />
          Descargar PNG
        </button>
        <button className="button-primary justify-center rounded-2xl px-3 py-3 text-xs" onClick={handlePrint} type="button">
          <Printer size={15} />
          Imprimir
        </button>
      </div>

      {!partner.isBase && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button className="button-secondary justify-center px-3 py-3 text-xs" onClick={() => onEdit?.(partner)} type="button">
            <Pencil size={15} />
            Editar
          </button>
          <button
            className="justify-center rounded-2xl border border-rose-100 bg-rose-50 px-3 py-3 text-xs font-black text-rose-700 transition hover:bg-rose-100"
            onClick={handleDelete}
            type="button"
          >
            <Trash2 size={15} />
            Eliminar
          </button>
        </div>
      )}

      {feedback && <p className="mt-3 text-center text-xs font-bold text-ocean-700">{feedback}</p>}
    </article>
  );
}

export default PartnerQrCard;

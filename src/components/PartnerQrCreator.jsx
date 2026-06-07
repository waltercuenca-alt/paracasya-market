import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DEFAULT_PARTNER_QR_MESSAGE,
  createPartnerSlug,
  normalizePartnerQrMaterial,
} from "../utils/partnerQrData";

const emptyForm = {
  id: "",
  message: DEFAULT_PARTNER_QR_MESSAGE,
  name: "",
  slug: "",
};

function PartnerQrCreator({ editingMaterial, onCancelEdit, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [slugWasEdited, setSlugWasEdited] = useState(false);

  const isEditing = Boolean(editingMaterial);

  useEffect(() => {
    if (editingMaterial) {
      setForm({
        id: editingMaterial.id,
        message: editingMaterial.message || DEFAULT_PARTNER_QR_MESSAGE,
        name: editingMaterial.name || editingMaterial.label || "",
        slug: editingMaterial.slug || "",
      });
      setSlugWasEdited(true);
      return;
    }

    setForm(emptyForm);
    setSlugWasEdited(false);
  }, [editingMaterial]);

  function updateName(value) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: slugWasEdited ? current.slug : createPartnerSlug(value),
    }));
  }

  function updateSlug(value) {
    setSlugWasEdited(true);
    setForm((current) => ({
      ...current,
      slug: createPartnerSlug(value),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const material = normalizePartnerQrMaterial({
      ...form,
      id: form.id || `partner-${Date.now()}`,
      slug: form.slug || createPartnerSlug(form.name),
    });

    if (!material.slug) {
      return;
    }

    onSave(material);

    if (!isEditing) {
      setForm(emptyForm);
      setSlugWasEdited(false);
    }
  }

  return (
    <form className="card space-y-4 p-5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">{isEditing ? "Editar material" : "Crear material QR"}</p>
          <h3 className="mt-2 font-display text-xl font-black text-ocean-950">
            {isEditing ? "Actualizar aliado" : "Nuevo QR para aliado"}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Genera un origen para hoteles, Airbnbs o recepciones. Se guarda solo en este navegador.
          </p>
        </div>
        {isEditing && (
          <button className="button-secondary px-3 py-2 text-xs" onClick={onCancelEdit} type="button">
            <X size={15} />
            Cancelar
          </button>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-ocean-950">Nombre del aliado</span>
          <input
            className="input-field"
            onChange={(event) => updateName(event.target.value)}
            placeholder="Hotel Sol de Paracas"
            required
            value={form.name}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-ocean-950">Slug / origen</span>
          <input
            className="input-field"
            onChange={(event) => updateSlug(event.target.value)}
            placeholder="hotel-sol-de-paracas"
            required
            value={form.slug}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-ocean-950">
          Mensaje corto opcional
        </span>
        <textarea
          className="input-field min-h-24 resize-none"
          onChange={(event) =>
            setForm((current) => ({ ...current, message: event.target.value }))
          }
          placeholder={DEFAULT_PARTNER_QR_MESSAGE}
          value={form.message}
        />
      </label>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-slate-400">
          Vista previa: <span className="text-ocean-700">/cliente?origen={form.slug || "..."}</span>
        </p>
        <button className="button-primary rounded-2xl px-5 py-3" type="submit">
          <Save size={17} />
          {isEditing ? "Guardar cambios" : "Generar material"}
        </button>
      </div>
    </form>
  );
}

export default PartnerQrCreator;

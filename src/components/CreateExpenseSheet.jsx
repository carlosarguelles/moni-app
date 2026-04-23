import { useState } from "react";
import { X, Check } from 'lucide-react';

export default function CreateExpenseSheet({ onSave, onClose }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [person, setPerson] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("pending");
  const [note, setNote] = useState("");
  const [closing, setClosing] = useState(false);

  function handleClose() {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setDescription("");
      setAmount("");
      setPerson("");
      setDate(new Date().toISOString().split("T")[0]);
      setStatus("pending");
      setNote("");
      onClose();
    }, 270);
  }

  function handleSave() {
    if (!description.trim() || !amount || !person.trim()) return;
    onSave({
      description: description.trim(),
      amount: Math.max(1, Number(amount) || 0),
      person: person.trim(),
      date,
      status,
      note: note.trim(),
    });
    handleClose();
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 ${closing ? "animate-overlay-out" : "animate-overlay-in"}`}
        onClick={handleClose}
      />
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg)] rounded-t-[24px] p-5 pb-[calc(28px+env(safe-area-inset-bottom))] animate-slide-up`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-extrabold text-[var(--color-title)]">Nuevo Gasto</h2>
          <button onClick={handleClose} className="p-2 rounded-full bg-[var(--cancel-bg)] border border-[var(--cancel-border)] text-[var(--cancel-color)]">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[13px] font-semibold text-[var(--color-text-muted)] mb-1 block">Descripción</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ej: Cena restaurant"
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-[15px] text-[var(--color-text)] placeholder:text-[var(--color-text-ghost)]"
            />
          </div>

          <div>
            <label className="text-[13px] font-semibold text-[var(--color-text-muted)] mb-1 block">Monto</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="50000"
              min="1"
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-[15px] text-[var(--color-text)] placeholder:text-[var(--color-text-ghost)]"
            />
          </div>

          <div>
            <label className="text-[13px] font-semibold text-[var(--color-text-muted)] mb-1 block">Persona</label>
            <input
              type="text"
              value={person}
              onChange={e => setPerson(e.target.value)}
              placeholder="Ej: Carlos"
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-[15px] text-[var(--color-text)] placeholder:text-[var(--color-text-ghost)]"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[13px] font-semibold text-[var(--color-text-muted)] mb-1 block">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-[15px] text-[var(--color-text)]"
              />
            </div>
            <div className="flex-1">
              <label className="text-[13px] font-semibold text-[var(--color-text-muted)] mb-1 block">Estado</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-[15px] text-[var(--color-text)]"
              >
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[13px] font-semibold text-[var(--color-text-muted)] mb-1 block">Nota (opcional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Algo adicional..."
              rows="2"
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-[15px] text-[var(--color-text)] placeholder:text-[var(--color-text-ghost)] resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!description.trim() || !amount || !person.trim()}
          className="w-full mt-5 bg-[var(--color-teal)] text-white font-bold text-[15px] py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check size={18} /> Guardar Gasto
        </button>
      </div>
    </>
  );
}
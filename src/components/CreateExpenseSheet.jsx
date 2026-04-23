import { useState } from "react";
import { X, Check, Plus, Trash2, Square, Layers } from 'lucide-react';
import Tabs from './Tabs.jsx';
import { getExpenseTotal, formatCOP } from '../utils.js';

export default function CreateExpenseSheet({ onSave, onClose, expense }) {
  const isEdit = !!expense;
  const [description, setDescription] = useState(expense?.description ?? "");
  const [person, setPerson] = useState(expense?.person ?? "");
  const [date, setDate] = useState(expense?.date ?? new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState(expense?.status ?? "pending");
  const [note, setNote] = useState(expense?.note ?? "");
  const [closing, setClosing] = useState(false);
  const [isStacked, setIsStacked] = useState(() => {
    if (expense?.items && expense.items.length > 1) return true;
    if (expense?.items && expense.items.length === 1) return false;
    return false;
  });
  const [singleAmount, setSingleAmount] = useState(
    expense?.items?.length === 1 ? expense.items[0].amount?.toString() ?? "" : expense?.amount?.toString() ?? ""
  );
  const [items, setItems] = useState(() => {
    if (expense?.items && expense.items.length > 0) {
      return expense.items.map(i => ({ ...i }));
    }
    return [{ id: crypto.randomUUID(), description: "", amount: "" }];
  });

  const total = isStacked
    ? items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
    : (Number(singleAmount) || 0);

  function handleClose() {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setDescription("");
      setPerson("");
      setSingleAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setStatus("pending");
      setNote("");
      setIsStacked(false);
      setItems([{ id: crypto.randomUUID(), description: "", amount: "" }]);
      onClose();
    }, 270);
  }

  function handleSave() {
    if (!description.trim() || !person.trim()) return;

    let saveData;
    if (isStacked) {
      const validItems = items.filter(i => i.description.trim() && i.amount);
      if (validItems.length === 0) return;
      saveData = {
        description: description.trim(),
        person: person.trim(),
        date,
        status,
        note: note.trim(),
        items: validItems.map(i => ({
          id: i.id === "legacy" ? crypto.randomUUID() : i.id,
          description: i.description.trim(),
          amount: Math.max(1, Number(i.amount) || 0),
        })),
      };
    } else {
      const amount = Math.max(1, Number(singleAmount) || 0);
      if (!singleAmount || amount < 1) return;
      saveData = {
        description: description.trim(),
        person: person.trim(),
        date,
        status,
        note: note.trim(),
        items: [{
          id: crypto.randomUUID(),
          description: description.trim(),
          amount,
        }],
      };
    }

    onSave(saveData, isEdit ? expense : undefined);
    handleClose();
  }

  function addItem() {
    setItems(prev => [...prev, { id: crypto.randomUUID(), description: "", amount: "" }]);
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function updateItem(id, field, value) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 ${closing ? "animate-overlay-out" : "animate-overlay-in"}`}
        onClick={handleClose}
      />
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg)] rounded-t-[24px] p-5 pb-[calc(28px+env(safe-area-inset-bottom))] animate-slide-up`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-extrabold text-[var(--color-title)]">{isEdit ? "Editar Gasto" : "Nuevo Gasto"}</h2>
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-semibold text-[var(--color-text-muted)]">Tipo de gasto</label>
              <Tabs value={isStacked ? 'apilado' : 'simple'} onChange={v => setIsStacked(v === 'apilado')}>
                <Tabs.Tab value="simple" label="Simple" icon={<Square size={14} />} />
                <Tabs.Tab value="apilado" label="Apilado" icon={<Layers size={14} />} />
              </Tabs>
            </div>

            {!isStacked ? (
              <div>
                <label className="text-[13px] font-semibold text-[var(--color-text-muted)] mb-1 block">Monto</label>
                <input
                  type="number"
                  value={singleAmount}
                  onChange={e => setSingleAmount(e.target.value)}
                  placeholder="50000"
                  min="1"
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-[15px] text-[var(--color-text)] placeholder:text-[var(--color-text-ghost)]"
                />
                {total > 0 && (
                  <div className="mt-2 text-right">
                    <span className="text-[13px] text-[var(--color-text-muted)]">Total: </span>
                    <span className="text-[15px] font-bold text-[var(--color-teal-dark)]">{formatCOP(total)}</span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[13px] font-semibold text-[var(--color-text-muted)]">Ítems</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-[12px] text-[var(--color-teal-dark)] font-semibold flex items-center gap-1"
                  >
                    <Plus size={14} /> Agregar ítem
                  </button>
                </div>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={item.id} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => updateItem(item.id, "description", e.target.value)}
                        placeholder={`Ítem ${idx + 1} (ej: Fish)`}
                        className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2.5 text-[14px] text-[var(--color-text)] placeholder:text-[var(--color-text-ghost)]"
                      />
                      <input
                        type="number"
                        value={item.amount}
                        onChange={e => updateItem(item.id, "amount", e.target.value)}
                        placeholder="0"
                        min="1"
                        className="w-28 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2.5 text-[14px] text-[var(--color-text)] placeholder:text-[var(--color-text-ghost)]"
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[#DC2626] p-2"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {total > 0 && (
                  <div className="mt-2 text-right">
                    <span className="text-[13px] text-[var(--color-text-muted)]">Total: </span>
                    <span className="text-[15px] font-bold text-[var(--color-teal-dark)]">{formatCOP(total)}</span>
                  </div>
                )}
              </div>
            )}
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
          disabled={
            !description.trim() ||
            !person.trim() ||
            (!isStacked ? !singleAmount || Number(singleAmount) < 1 : items.filter(i => i.description.trim() && i.amount).length === 0)
          }
          className="w-full mt-5 bg-[var(--color-teal)] text-white font-bold text-[15px] py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check size={18} /> {isEdit ? "Actualizar Gasto" : "Guardar Gasto"}
        </button>
      </div>
    </>
  );
}
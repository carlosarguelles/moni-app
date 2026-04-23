import { formatCOP } from '../utils.js';

export default function PersonSummary({ expenses }) {
  const people = [...new Set(expenses.map(e => e.person))];
  
  if (people.length === 0) return null;

  const summaries = people.map(person => {
    const personExpenses = expenses.filter(e => e.person === person);
    const total = personExpenses.reduce((sum, e) => sum + e.amount, 0);
    const paid = personExpenses.filter(e => e.status === "paid").reduce((sum, e) => sum + e.amount, 0);
    const pending = personExpenses.filter(e => e.status === "pending").reduce((sum, e) => sum + e.amount, 0);
    return { name: person, total, paid, pending, count: personExpenses.length };
  });

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[16px] p-5 mb-4">
      <h3 className="font-bold text-[16px] text-[var(--color-title)] mb-4">Resumen por Persona</h3>
      
      <div className="space-y-4">
        {summaries.map(s => (
          <div key={s.name} className="bg-[var(--stat-bg)] border border-[var(--stat-border)] rounded-[12px] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-[15px] text-[var(--color-text)]">{s.name}</span>
              <span className="text-[12px] text-[var(--color-text-muted)] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-full px-2 py-0.5">
                {s.count} gasto{s.count !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-[11px] text-[var(--color-text-faint)] mb-1">Total</p>
                <p className="text-[14px] font-bold text-[var(--color-teal-dark)]">{formatCOP(s.total)}</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-[var(--color-text-faint)] mb-1">Pagado</p>
                <p className="text-[14px] font-bold text-[#059669]">{formatCOP(s.paid)}</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-[var(--color-text-faint)] mb-1">Pendiente</p>
                <p className="text-[14px] font-bold text-[#D97706]">{formatCOP(s.pending)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
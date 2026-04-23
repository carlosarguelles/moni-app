import { formatCOP, getExpenseTotal } from '../utils.js';

function getAvatarColor(name) {
  const colors = [
    'from-[#0D9488] to-[#14B8A6]',
    'from-[#059669] to-[#10B981]',
    'from-[#0284C7] to-[#38BDF8]',
    'from-[#7C3AED] to-[#A78BFA]',
    'from-[#DB2777] to-[#F472B6]',
    'from-[#D97706] to-[#FBBF24]',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function PersonSummary({ expenses }) {
  const people = [...new Set(expenses.map(e => e.person))];

  if (people.length === 0) return null;

  const summaries = people.map(person => {
    const personExpenses = expenses.filter(e => e.person === person);
    const total = personExpenses.reduce((sum, e) => sum + getExpenseTotal(e), 0);
    const paid = personExpenses.filter(e => e.status === "paid").reduce((sum, e) => sum + getExpenseTotal(e), 0);
    const pending = personExpenses.filter(e => e.status === "pending").reduce((sum, e) => sum + getExpenseTotal(e), 0);
    return { name: person, total, paid, pending, count: personExpenses.length };
  });

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[16px] p-5 mb-4">
      <h3 className="font-bold text-[16px] text-[var(--color-title)] mb-4">Resumen por Persona</h3>

      <div className="space-y-3">
        {summaries.map(s => (
          <div key={s.name} className="flex items-center gap-4 py-3 border-b border-[var(--stat-border)] last:border-b-0">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(s.name)} flex items-center justify-center shadow-sm ring-2 ring-white/50`}>
              <span className="text-sm font-bold text-white">{getInitials(s.name)}</span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-[15px] text-[var(--color-text)] truncate">{s.name}</p>
              <p className="text-[12px] text-[var(--color-text-faint)]">{s.count} gasto{s.count !== 1 ? "s" : ""}</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] text-[var(--color-text-faint)] uppercase tracking-wide">Total</p>
                <p className="text-[14px] font-semibold text-[var(--color-teal-dark)]">{formatCOP(s.total)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[var(--color-text-faint)] uppercase tracking-wide">Pagado</p>
                <p className="text-[14px] font-semibold text-[#059669]">{formatCOP(s.paid)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[var(--color-text-faint)] uppercase tracking-wide">Pendiente</p>
                <p className="text-[14px] font-semibold text-[#D97706]">{formatCOP(s.pending)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

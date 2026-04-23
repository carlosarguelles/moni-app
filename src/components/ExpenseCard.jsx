import { useState } from 'react';
import { Trash2, CheckCircle, Clock, Pencil, ChevronDown, ChevronRight } from 'lucide-react';
import { formatCOP, getExpenseTotal } from '../utils.js';

export default function ExpenseCard({ expense, onToggle, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const isPaid = expense.status === "paid";
  const hasItems = expense.items && expense.items.length > 1;

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[16px] p-4 mb-3 transition-all">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[15px] text-[var(--color-text)] leading-[1.3]">{expense.description}</p>
          <p className="text-[13px] text-[var(--color-text-faint)] mt-0.5">{expense.person}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span className="font-extrabold text-[16px] text-[var(--color-teal-dark)]">{formatCOP(getExpenseTotal(expense))}</span>
          {hasItems && (
            <button
              onClick={() => setExpanded(prev => !prev)}
              className="text-[var(--color-text-muted)] p-1"
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          <button
            onClick={() => onEdit(expense)}
            className="bg-[rgba(20,184,166,0.08)] border border-[rgba(20,184,166,0.25)] text-[var(--color-teal-dark)] rounded-lg p-[6px_8px] flex items-center"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(expense.id)}
            className="bg-[rgba(220,38,38,0.08)] border border-[rgba(220,38,38,0.2)] text-[#DC2626] rounded-lg p-[6px_8px] flex items-center"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {hasItems && expanded && (
        <div className="mt-3 mb-2 pl-2 border-l-2 border-[var(--color-teal-dark)] space-y-1.5">
          {expense.items.map((item, idx) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[var(--color-text-muted)]">{idx + 1}.</span>
                <span className="text-[13px] text-[var(--color-text)]">{item.description}</span>
              </div>
              <span className="text-[13px] font-semibold text-[var(--color-text)]">{formatCOP(item.amount)}</span>
            </div>
          ))}
        </div>
      )}

      {expense.note && (
        <p className="text-[13px] text-[var(--color-text-muted)] mb-2 pl-0.5">{expense.note}</p>
      )}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--card-border)]">
        <span className="text-[12px] text-[var(--color-text-faint)]">{expense.date}</span>
        <button
          onClick={() => onToggle(expense.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
            isPaid
              ? "bg-[rgba(5,150,105,0.12)] border border-[rgba(5,150,105,0.25)] text-[#059669]"
              : "bg-[rgba(251,191,36,0.12)] border border-[rgba(251,191,36,0.25)] text-[#D97706]"
          }`}
        >
          {isPaid ? <CheckCircle size={14} /> : <Clock size={14} />}
          {isPaid ? "Pagado" : "Pendiente"}
        </button>
      </div>
    </div>
  );
}
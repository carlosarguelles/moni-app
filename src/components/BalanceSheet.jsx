import { formatCOP } from '../utils.js';

export default function BalanceSheet({ expenses }) {
  const people = [...new Set(expenses.map(e => e.person))];
  
  if (people.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[16px] p-5 text-center">
        <p className="text-[14px] text-[var(--color-text-faint)]">No hay gastos para calcular balances</p>
      </div>
    );
  }

  const totalPaid = expenses
    .filter(e => e.status === "paid")
    .reduce((sum, e) => sum + e.amount, 0);

  const perPerson = people.length > 0 ? totalPaid / people.length : 0;

  const balances = {};
  for (const person of people) {
    const paid = expenses
      .filter(e => e.person === person && e.status === "paid")
      .reduce((sum, e) => sum + e.amount, 0);
    balances[person] = paid - perPerson;
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[16px] p-5 mb-5">
      <h3 className="font-bold text-[16px] text-[var(--color-title)] mb-4">Balance por Persona</h3>
      
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--card-border)]">
        <span className="text-[13px] text-[var(--color-text-muted)]">Total gastado</span>
        <span className="font-bold text-[15px] text-[var(--color-teal-dark)]">{formatCOP(totalPaid)}</span>
      </div>

      <div className="space-y-3">
        {people.map(person => {
          const balance = balances[person];
          const isPositive = balance >= 0;
          return (
            <div key={person} className="flex items-center justify-between">
              <span className="text-[14px] font-semibold text-[var(--color-text)]">{person}</span>
              <span className={`text-[14px] font-bold ${
                isPositive ? "text-[#059669]" : "text-[#DC2626]"
              }`}>
                {isPositive ? "+" : ""}{formatCOP(balance)}
              </span>
            </div>
          );
        })}
      </div>

      {people.length > 1 && (
        <div className="mt-4 pt-4 border-t border-[var(--card-border)] text-center">
          <p className="text-[12px] text-[var(--color-text-faint)]">
            Por persona: <span className="font-semibold text-[var(--color-teal)]">{formatCOP(perPerson)}</span>
          </p>
        </div>
      )}
    </div>
  );
}
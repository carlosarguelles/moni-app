import { useState } from "react";
import { formatCOP } from '../utils.js';

export default function BalanceSheet({ expenses }) {
  const [strategy, setStrategy] = useState("equal");
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
    if (strategy === "equal") {
      const paid = expenses
        .filter(e => e.person === person && e.status === "paid")
        .reduce((sum, e) => sum + e.amount, 0);
      balances[person] = paid - perPerson;
    } else {
      const owed = expenses
        .filter(e => e.person === person)
        .reduce((sum, e) => sum + e.amount, 0);
      const paidOwn = expenses
        .filter(e => e.person === person && e.status === "paid")
        .reduce((sum, e) => sum + e.amount, 0);
      balances[person] = paidOwn - owed;
    }
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[16px] p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[16px] text-[var(--color-title)]">Balance por Persona</h3>
        <div className="flex bg-[var(--input-bg)] border border-[var(--input-border)] rounded-full p-1">
          <button
            onClick={() => setStrategy("equal")}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
              strategy === "equal"
                ? "bg-[var(--color-teal)] text-white"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            Igual
          </button>
          <button
            onClick={() => setStrategy("individual")}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
              strategy === "individual"
                ? "bg-[var(--color-teal)] text-white"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            Individual
          </button>
        </div>
      </div>
      
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

      {people.length > 1 && strategy === "equal" && (
        <div className="mt-4 pt-4 border-t border-[var(--card-border)] text-center">
          <p className="text-[12px] text-[var(--color-text-faint)]">
            Por persona: <span className="font-semibold text-[var(--color-teal)]">{formatCOP(perPerson)}</span>
          </p>
        </div>
      )}

      {people.length > 1 && strategy === "individual" && (
        <div className="mt-4 pt-4 border-t border-[var(--card-border)] text-center">
          <p className="text-[12px] text-[var(--color-text-faint)]">
            Cada persona debe lo que gastó en sus propios gastos
          </p>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { formatCOP, getExpenseTotal } from '../utils.js';
import Tabs from './Tabs.jsx';

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
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function Avatar({ name, className = '' }) {
  return (
    <div
      className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(name)} flex items-center justify-center shadow-sm ring-2 ring-white/50 ${className}`}
    >
      <span className="text-sm font-bold text-white">{getInitials(name)}</span>
    </div>
  );
}

export default function PersonSummary({ expenses }) {
  const [activeTab, setActiveTab] = useState('resumen');
  const [strategy, setStrategy] = useState('equal');
  const people = [...new Set(expenses.map((e) => e.person))];

  if (people.length === 0) return null;

  const summaries = people.map((person) => {
    const personExpenses = expenses.filter((e) => e.person === person);
    const total = personExpenses.reduce((sum, e) => sum + getExpenseTotal(e), 0);
    const paid = personExpenses
      .filter((e) => e.status === 'paid')
      .reduce((sum, e) => sum + getExpenseTotal(e), 0);
    const pending = personExpenses
      .filter((e) => e.status === 'pending')
      .reduce((sum, e) => sum + getExpenseTotal(e), 0);
    return { name: person, total, paid, pending, count: personExpenses.length };
  });

  const totalPaid = expenses
    .filter((e) => e.status === 'paid')
    .reduce((sum, e) => sum + getExpenseTotal(e), 0);

  const perPerson = people.length > 0 ? totalPaid / people.length : 0;

  const equalBalances = {};
  for (const person of people) {
    const paid = expenses
      .filter((e) => e.person === person && e.status === 'paid')
      .reduce((sum, e) => sum + getExpenseTotal(e), 0);
    equalBalances[person] = paid - perPerson;
  }

  const individualBalances = {};
  for (const person of people) {
    const owed = expenses
      .filter((e) => e.person === person)
      .reduce((sum, e) => sum + getExpenseTotal(e), 0);
    const paidOwn = expenses
      .filter((e) => e.person === person && e.status === 'paid')
      .reduce((sum, e) => sum + getExpenseTotal(e), 0);
    individualBalances[person] = paidOwn - owed;
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[16px] p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.Tab value="resumen" label="Resumen" />
          <Tabs.Tab value="balance" label="Balance" />
        </Tabs>
        {activeTab === 'balance' && (
          <Tabs value={strategy} onChange={setStrategy}>
            <Tabs.Tab value="equal" label="Igual" />
            <Tabs.Tab value="individual" label="Individual" />
          </Tabs>
        )}
      </div>

      {activeTab === 'resumen' && (
        <>
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--card-border)]">
            <span className="text-[13px] text-[var(--color-text-muted)]">Total gastado</span>
            <span className="font-bold text-[15px] text-[var(--color-teal-dark)]">
              {formatCOP(totalPaid)}
            </span>
          </div>

          <div className="space-y-3">
            {summaries.map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-4 py-3 border-b border-[var(--stat-border)] last:border-b-0"
              >
                <Avatar name={s.name} />

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[15px] text-[var(--color-text)] truncate">
                    {s.name}
                  </p>
                  <p className="text-[12px] text-[var(--color-text-faint)]">
                    {s.count} gasto{s.count !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-[var(--color-text-faint)] uppercase tracking-wide">
                      Total
                    </p>
                    <p className="text-[14px] font-semibold text-[var(--color-teal-dark)]">
                      {formatCOP(s.total)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[var(--color-text-faint)] uppercase tracking-wide">
                      Pagado
                    </p>
                    <p className="text-[14px] font-semibold text-[#059669]">{formatCOP(s.paid)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[var(--color-text-faint)] uppercase tracking-wide">
                      Pendiente
                    </p>
                    <p className="text-[14px] font-semibold text-[#D97706]">
                      {formatCOP(s.pending)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'balance' && (
        <>
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--card-border)]">
            <span className="text-[13px] text-[var(--color-text-muted)]">Total gastado</span>
            <span className="font-bold text-[15px] text-[var(--color-teal-dark)]">
              {formatCOP(totalPaid)}
            </span>
          </div>

          <div className="space-y-3">
            {people.map((person) => {
              const balance =
                strategy === 'equal' ? equalBalances[person] : individualBalances[person];
              const isPositive = balance >= 0;
              return (
                <div
                  key={person}
                  className="flex items-center gap-4 py-3 border-b border-[var(--stat-border)] last:border-b-0"
                >
                  <Avatar name={person} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[15px] text-[var(--color-text)] truncate">
                      {person}
                    </p>
                  </div>
                  <span
                    className={`text-[14px] font-bold ${
                      isPositive ? 'text-[#059669]' : 'text-[#DC2626]'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {formatCOP(balance)}
                  </span>
                </div>
              );
            })}
          </div>

          {people.length > 1 && strategy === 'equal' && (
            <div className="mt-4 pt-4 border-t border-[var(--card-border)] text-center">
              <p className="text-[12px] text-[var(--color-text-faint)]">
                Por persona:{' '}
                <span className="font-semibold text-[var(--color-teal)]">
                  {formatCOP(perPerson)}
                </span>
              </p>
            </div>
          )}

          {people.length > 1 && strategy === 'individual' && (
            <div className="mt-4 pt-4 border-t border-[var(--card-border)] text-center">
              <p className="text-[12px] text-[var(--color-text-faint)]">
                Cada persona debe lo que gastó en sus propios gastos
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

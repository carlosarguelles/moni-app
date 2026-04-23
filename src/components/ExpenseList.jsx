import { useState, useEffect } from 'react';
import ExpenseCard from './ExpenseCard.jsx';
import ExpenseTable from './ExpenseTable.jsx';

export default function ExpenseList({ expenses, onToggle, onDelete, onEdit }) {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 640
  );

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const sorted = expenses.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

  if (isDesktop) {
    return <ExpenseTable expenses={sorted} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />;
  }

  return (
    <div>
      {sorted.map(expense => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
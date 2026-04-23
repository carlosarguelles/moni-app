export const STORAGE_KEY = "shared_expenses_v1";

export const formatCOP = (n) => "$" + n.toLocaleString("es-CO");

export function haptic(ms = 15) { if (navigator.vibrate) navigator.vibrate(ms); }

export function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.projects) return parsed.projects;
    }
  } catch {}
  return [];
}

export function saveProjects(projects) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects }));
  } catch {}
}

export function calculateBalances(expenses) {
  const balances = {};
  for (const exp of expenses) {
    if (!balances[exp.person]) balances[exp.person] = 0;
    balances[exp.person] += exp.status === "paid" ? exp.amount : 0;
  }
  return balances;
}

export function calculateDebts(expenses) {
  const totalExpense = expenses
    .filter(e => e.status === "paid")
    .reduce((sum, e) => sum + e.amount, 0);
  
  const people = [...new Set(expenses.map(e => e.person))];
  const perPerson = people.length > 0 ? totalExpense / people.length : 0;

  const debts = {};
  for (const exp of expenses) {
    if (!debts[exp.person]) debts[exp.person] = 0;
    if (exp.status === "paid") {
      debts[exp.person] += exp.amount;
    } else {
      debts[exp.person] += exp.amount * 0.5;
    }
  }

  const netBalances = {};
  for (const person of people) {
    const paid = debts[person] || 0;
    netBalances[person] = paid - perPerson;
  }

  return { totalExpense, perPerson, netBalances, people };
}
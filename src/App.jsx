import { useState, useEffect } from "react";
import { Plus, ArrowLeft, Trash2, Wallet, Receipt } from 'lucide-react';
import { loadProjects, saveProjects, formatCOP, haptic, getExpenseTotal } from './utils.js';
import ExpenseList from './components/ExpenseList.jsx';
import PersonSummary from './components/PersonSummary.jsx';
import CreateExpenseSheet from './components/CreateExpenseSheet.jsx';
import ActivityLog from './components/ActivityLog.jsx';

export default function App() {
  const [projects, setProjects] = useState(() => loadProjects());
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [showCreateExpense, setShowCreateExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [viewState, setViewState] = useState("idle");

  useEffect(() => { saveProjects(projects); }, [projects]);

  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;

  function updateProject(id, updater) {
    setProjects(ps => ps.map(p => p.id === id ? updater(p) : p));
  }

  function addLog(projectId, log) {
    updateProject(projectId, p => ({
      ...p,
      logs: [...(p.logs || []), { id: crypto.randomUUID(), timestamp: new Date().toISOString(), ...log }],
    }));
  }

  function navigateTo(projectId) {
    if (projectId) {
      setViewState("entering");
      setActiveProjectId(projectId);
      requestAnimationFrame(() => requestAnimationFrame(() => setViewState("active")));
    } else {
      setViewState("entering");
      setTimeout(() => { setActiveProjectId(null); setViewState("idle"); }, 280);
    }
  }

  function createProject() {
    const name = newProjectName.trim();
    if (!name) return;
    haptic(30);
    const project = {
      id: crypto.randomUUID(),
      name,
      expenses: [],
      logs: [],
      createdAt: new Date().toISOString(),
    };
    setProjects(ps => [...ps, project]);
    setNewProjectName("");
    setShowCreateProject(false);
    navigateTo(project.id);
  }

  function deleteProject(id) {
    const project = projects.find(p => p.id === id);
    if (window.confirm(`¿Eliminar el proyecto "${project.name}"?`)) {
      haptic(30);
      setProjects(ps => ps.filter(p => p.id !== id));
      if (activeProjectId === id) navigateTo(null);
    }
  }

  function addExpense(expense) {
    haptic(20);
    const total = getExpenseTotal(expense);
    updateProject(activeProjectId, p => ({
      ...p,
      expenses: [...p.expenses, { id: crypto.randomUUID(), ...expense }]
    }));
    addLog(activeProjectId, {
      type: "created",
      message: `Gasto creado: ${expense.description} (${formatCOP(total)})`,
      expenseId: null,
    });
  }

  function updateExpense(data, original) {
    haptic(20);
    const oldTotal = getExpenseTotal(original);
    const newTotal = getExpenseTotal(data);
    updateProject(activeProjectId, p => ({
      ...p,
      expenses: p.expenses.map(e => e.id === original.id ? { ...e, ...data } : e)
    }));
    addLog(activeProjectId, {
      type: "updated",
      message: `Gasto actualizado: ${data.description} (antes: ${formatCOP(oldTotal)} → ahora: ${formatCOP(newTotal)})`,
      expenseId: original.id,
    });
    setEditingExpense(null);
  }

  function toggleExpenseStatus(expenseId) {
    haptic(10);
    const expense = activeProject?.expenses.find(e => e.id === expenseId);
    const newStatus = expense?.status === "paid" ? "pending" : "paid";
    updateProject(activeProjectId, p => ({
      ...p,
      expenses: p.expenses.map(e =>
        e.id === expenseId
          ? { ...e, status: e.status === "paid" ? "pending" : "paid" }
          : e
      )
    }));
    addLog(activeProjectId, {
      type: "status_changed",
      message: `${expense?.description}: marcado como ${newStatus === "paid" ? "Pagado" : "Pendiente"}`,
      expenseId,
    });
  }

  function deleteExpense(expenseId) {
    haptic(15);
    const expense = activeProject?.expenses.find(e => e.id === expenseId);
    updateProject(activeProjectId, p => ({
      ...p,
      expenses: p.expenses.filter(e => e.id !== expenseId)
    }));
    if (expense) {
      addLog(activeProjectId, {
        type: "deleted",
        message: `Gasto eliminado: ${expense.description}`,
        expenseId,
      });
    }
  }

  const listContent = (
    <>
      {projects.length === 0 && !showCreateProject && (
        <div className="text-center py-[60px] px-5 flex flex-col items-center gap-2">
          <Wallet size={56} className="opacity-30 mb-4" />
          <p className="text-[18px] font-bold text-[var(--color-text-dim)]">Aún no tienes proyectos.</p>
          <p className="text-[14px] text-[var(--color-text-faint)] mb-3">Crea tu primer proyecto para empezar a rastrear gastos.</p>
          <button
            onClick={() => setShowCreateProject(true)}
            className="bg-[rgba(20,184,166,0.12)] border border-[rgba(20,184,166,0.35)] text-[var(--color-teal-dark)] rounded-2xl px-7 py-3.5 text-[16px] font-bold flex items-center gap-2 mt-2"
          >
            <Plus size={18} /> Nuevo Proyecto
          </button>
        </div>
      )}

      {showCreateProject && (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[16px] p-5 mb-5">
          <h3 className="font-bold text-[16px] text-[var(--color-title)] mb-4">Nuevo Proyecto</h3>
          <input
            type="text"
            value={newProjectName}
            onChange={e => setNewProjectName(e.target.value)}
            placeholder="Ej: Viaje, Casa, Oficina"
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-[15px] text-[var(--color-text)] placeholder:text-[var(--color-text-ghost)] mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setShowCreateProject(false); setNewProjectName(""); }}
              className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold bg-[var(--cancel-bg)] border border-[var(--cancel-border)] text-[var(--cancel-color)]"
            >
              Cancelar
            </button>
            <button
              onClick={createProject}
              disabled={!newProjectName.trim()}
              className="flex-1 py-2.5 rounded-xl text-[14px] font-bold bg-[var(--color-teal)] text-white disabled:opacity-40"
            >
              Crear
            </button>
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="space-y-3">
          {projects.map(project => {
              const total = project.expenses
                .filter(e => e.status === "paid")
                .reduce((sum, e) => sum + getExpenseTotal(e), 0);
            return (
              <div
                key={project.id}
                onClick={() => navigateTo(project.id)}
                className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[16px] p-4 cursor-pointer transition-transform active:scale-[0.98]"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[16px] text-[var(--color-text)]">{project.name}</h3>
                    <p className="text-[13px] text-[var(--color-text-faint)] mt-1">
                      {project.expenses.length} gasto{project.expenses.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[15px] text-[var(--color-teal-dark)]">{formatCOP(total)}</span>
                    <button
                      onClick={e => { e.stopPropagation(); deleteProject(project.id); }}
                      className="p-2 rounded-lg bg-[rgba(220,38,38,0.08)] border border-[rgba(220,38,38,0.2)] text-[#DC2626]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] font-nunito text-[var(--color-text)] relative overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-[100] h-safe-header pt-safe-header px-4 flex items-center backdrop-blur-[14px] bg-[var(--header-bg)] border-b border-[var(--card-border)]">
        {activeProject ? (
          <>
            <button
              onClick={() => navigateTo(null)}
              className="bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--color-text-dim)] rounded-xl p-[10px_12px] flex items-center shrink-0 mr-3"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-[clamp(16px,4vw,24px)] font-black text-[var(--color-title)] leading-[1.15] whitespace-nowrap overflow-hidden text-ellipsis">{activeProject.name}</h1>
              <span className="text-[13px] text-[var(--color-text-muted)] font-semibold">
                {activeProject.expenses.length} gasto{activeProject.expenses.length !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={() => deleteProject(activeProject.id)}
              className="bg-[rgba(220,38,38,0.08)] border border-[rgba(220,38,38,0.2)] text-[#DC2626] rounded-xl p-[10px_12px] flex items-center shrink-0"
            >
              <Trash2 size={18} />
            </button>
          </>
        ) : (
          <>
            <Receipt size={26} className="text-[var(--color-title)] shrink-0" />
            <h1 className="text-[20px] ml-[10px] flex-1 font-black text-[var(--color-title)] tracking-[-0.02em] leading-[1.1]">Gastos Compartidos</h1>
          </>
        )}
      </header>

      <div data-view-state={viewState} className="w-full overflow-hidden">
        <div className="max-w-[640px] mx-auto pt-safe-top px-4 pb-safe-fab">
          {activeProject ? (
            <>
              <PersonSummary expenses={activeProject.expenses} />

              {activeProject.expenses.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt size={40} className="opacity-20 mx-auto mb-3" />
                  <p className="text-[14px] text-[var(--color-text-faint)]">No hay gastos en este proyecto</p>
                </div>
              ) : (
                <ExpenseList
                  expenses={activeProject.expenses}
                  onToggle={toggleExpenseStatus}
                  onDelete={deleteExpense}
                  onEdit={setEditingExpense}
                />
              )}

              {activeProject.logs?.length > 0 && (
                <ActivityLog logs={activeProject.logs} />
              )}
            </>
          ) : listContent}
        </div>
      </div>

      {activeProject && !showCreateExpense && (
        <div className="fixed bottom-safe-fab left-0 right-0 z-50 flex justify-center pointer-events-none">
          <button
            onClick={() => setShowCreateExpense(true)}
            className="bg-[var(--color-teal)] text-white rounded-full px-7 py-3.5 text-[15px] font-bold flex items-center gap-2 pointer-events-auto shadow-lg"
          >
            <Plus size={22} /> Agregar Gasto
          </button>
        </div>
      )}

      {!activeProject && projects.length > 0 && !showCreateProject && (
        <div className="fixed bottom-safe-fab left-0 right-0 z-50 flex justify-center pointer-events-none">
          <button
            onClick={() => setShowCreateProject(true)}
            className="bg-[var(--color-teal)] text-white rounded-full px-7 py-3.5 text-[15px] font-bold flex items-center gap-2 pointer-events-auto shadow-lg"
          >
            <Plus size={22} /> Nuevo Proyecto
          </button>
        </div>
      )}

      {activeProject && (showCreateExpense || editingExpense) && (
        <CreateExpenseSheet
          onSave={editingExpense ? updateExpense : addExpense}
          onClose={() => { setShowCreateExpense(false); setEditingExpense(null); }}
          expense={editingExpense}
          people={[...new Set(activeProject.expenses.map(e => e.person).filter(Boolean))]}
        />
      )}
    </div>
  );
}
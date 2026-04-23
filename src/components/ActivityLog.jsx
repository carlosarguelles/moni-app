import { CheckCircle, ChevronDown, ChevronUp, History, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const typeConfig = {
  created: { icon: Plus, color: 'text-[#059669]', bg: 'bg-[rgba(5,150,105,0.1)]' },
  updated: { icon: Pencil, color: 'text-[#2563EB]', bg: 'bg-[rgba(37,99,235,0.1)]' },
  deleted: { icon: Trash2, color: 'text-[#DC2626]', bg: 'bg-[rgba(220,38,38,0.1)]' },
  status_changed: { icon: CheckCircle, color: 'text-[#D97706]', bg: 'bg-[rgba(217,119,6,0.1)]' },
};

function formatRelativeTime(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'ahora mismo';
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  return then.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

export default function ActivityLog({ logs }) {
  const [expanded, setExpanded] = useState(false);
  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const displayLogs = expanded ? sortedLogs : sortedLogs.slice(0, 3);

  return (
    <div className="mt-6 mb-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 mb-3 text-[14px] font-semibold text-[var(--color-text-muted)]"
      >
        <History size={16} />
        <span>Registro de cambios</span>
        <span className="text-[12px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-full px-2 py-0.5">
          {logs.length}
        </span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <div className="space-y-2">
        {displayLogs.map((log) => {
          const config = typeConfig[log.type] || typeConfig.created;
          const Icon = config.icon;
          return (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[12px]"
            >
              <div
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${config.bg}`}
              >
                <Icon size={14} className={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[var(--color-text)] leading-[1.4]">{log.message}</p>
                <p className="text-[11px] text-[var(--color-text-faint)] mt-1">
                  {formatRelativeTime(log.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {logs.length > 3 && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full mt-2 py-2 text-[13px] text-[var(--color-text-muted)] font-medium"
        >
          Ver {logs.length - 3} más...
        </button>
      )}
    </div>
  );
}

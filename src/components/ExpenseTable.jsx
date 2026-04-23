import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ArrowUpDown, Trash2, CheckCircle, Clock, Pencil, ChevronDown, ChevronRight } from 'lucide-react';
import { formatCOP, getExpenseTotal } from '../utils.js';

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.display({
    id: 'expand',
    header: () => null,
    cell: ({ row, table }) => {
      const { expanded, onToggleExpand } = table.options.meta;
      const hasItems = row.original.items && row.original.items.length > 1;
      if (!hasItems) return <div className="w-6" />;
      const isExpanded = !!expanded[row.original.id];
      return (
        <button
          onClick={() => onToggleExpand(row.original.id)}
          className="p-1 rounded hover:bg-[var(--card-bg)] transition-colors"
        >
          {isExpanded ? (
            <ChevronDown size={16} className="text-[var(--color-text-muted)]" />
          ) : (
            <ChevronRight size={16} className="text-[var(--color-text-muted)]" />
          )}
        </button>
      );
    },
  }),
  columnHelper.accessor('description', {
    header: 'Descripción',
    cell: info => <span className="font-bold text-[15px]">{info.getValue()}</span>,
  }),
  columnHelper.accessor('person', {
    header: 'Persona',
    cell: info => <span className="text-[13px] text-[var(--color-text-faint)]">{info.getValue()}</span>,
  }),
  columnHelper.accessor(row => getExpenseTotal(row), {
    id: 'amount',
    header: 'Monto',
    cell: info => (
      <div className="flex items-center gap-2">
        <span className="font-extrabold text-[16px] text-[var(--color-teal-dark)]">
          {formatCOP(info.getValue())}
        </span>
        {info.row.original.items && info.row.original.items.length > 1 && (
          <span className="text-[11px] text-[var(--color-text-muted)]">
            ({info.row.original.items.length} ítems)
          </span>
        )}
      </div>
    ),
  }),
  columnHelper.accessor('date', {
    header: 'Fecha',
    cell: info => <span className="text-[12px] text-[var(--color-text-faint)]">{info.getValue()}</span>,
  }),
  columnHelper.accessor('status', {
    header: 'Estado',
    cell: ({ row, table }) => {
      const { onToggle } = table.options.meta;
      const isPaid = row.original.status === 'paid';
      return (
        <button
          onClick={() => onToggle(row.original.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
            isPaid
              ? 'bg-[rgba(5,150,105,0.12)] border border-[rgba(5,150,105,0.25)] text-[#059669]'
              : 'bg-[rgba(251,191,36,0.12)] border border-[rgba(251,191,36,0.25)] text-[#D97706]'
          }`}
        >
          {isPaid ? <CheckCircle size={14} /> : <Clock size={14} />}
          {isPaid ? 'Pagado' : 'Pendiente'}
        </button>
      );
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row, table }) => {
      const { onDelete, onEdit } = table.options.meta;
      return (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(row.original)}
            className="bg-[rgba(20,184,166,0.08)] border border-[rgba(20,184,166,0.25)] text-[var(--color-teal-dark)] rounded-lg p-[6px_8px] flex items-center"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(row.original.id)}
            className="bg-[rgba(220,38,38,0.08)] border border-[rgba(220,38,38,0.2)] text-[#DC2626] rounded-lg p-[6px_8px] flex items-center"
          >
            <Trash2 size={14} />
          </button>
        </div>
      );
    },
  }),
];

export default function ExpenseTable({ expenses, onToggle, onDelete, onEdit }) {
  const [sorting, setSorting] = useState([]);
  const [expanded, setExpanded] = useState({});

  function toggleExpand(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const table = useReactTable({
    data: expenses,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: { onToggle, onDelete, onEdit, expanded, onToggleExpand: toggleExpand },
  });

  return (
    <div className="overflow-x-auto hidden md:block">
      <table className="w-full text-left">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="border-b border-[var(--card-border)]">
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className={`pb-3 pt-2 px-2 text-[12px] font-semibold text-[var(--color-text-faint)] uppercase tracking-wide${header.id === 'expand' ? '' : ' cursor-pointer select-none'}`}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.id === 'expand' ? null : <ArrowUpDown size={12} className="opacity-40" />}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => {
            const isExpanded = !!expanded[row.original.id];
            const items = row.original.items || [];
            const hasItems = items.length > 1;

            return (
              <>
                <tr
                  key={row.id}
                  className="border-b border-[var(--card-border)] hover:bg-[var(--card-bg)] transition-colors"
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="py-3 px-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
                {isExpanded && hasItems && (
                  <tr key={`${row.id}-items`} className="bg-[var(--bg)]">
                    <td colSpan={columns.length} className="py-1 px-2">
                      <table className="w-full">
                        <tbody>
                          {items.map((item, idx) => (
                            <tr key={item.id} className="border-b border-[var(--card-border)] last:border-b-0">
                              <td className="py-2 px-2 w-6" />
                              <td className="py-2 px-2 text-[14px] text-[var(--color-text)] pl-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-[var(--color-text-muted)] text-[12px]">{idx + 1}.</span>
                                  <span>{item.description}</span>
                                </div>
                              </td>
                              <td className="py-2 px-2 text-[14px] font-semibold text-[var(--color-text)] text-right pr-4">
                                {formatCOP(item.amount)}
                              </td>
                              <td className="py-2 px-2" />
                              <td className="py-2 px-2" />
                              <td className="py-2 px-2" />
                              <td className="py-2 px-2" />
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ArrowUpDown, Trash2, CheckCircle, Clock, Pencil } from 'lucide-react';
import { formatCOP } from '../utils.js';

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor('description', {
    header: 'Descripción',
    cell: info => <span className="font-bold text-[15px]">{info.getValue()}</span>,
  }),
  columnHelper.accessor('person', {
    header: 'Persona',
    cell: info => <span className="text-[13px] text-[var(--color-text-faint)]">{info.getValue()}</span>,
  }),
  columnHelper.accessor('amount', {
    header: 'Monto',
    cell: info => (
      <span className="font-extrabold text-[16px] text-[var(--color-teal-dark)]">
        {formatCOP(info.getValue())}
      </span>
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

  const table = useReactTable({
    data: expenses,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: { onToggle, onDelete, onEdit },
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
                  className="pb-3 pt-2 px-2 text-[12px] font-semibold text-[var(--color-text-faint)] uppercase tracking-wide cursor-pointer select-none"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <ArrowUpDown size={12} className="opacity-40" />
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
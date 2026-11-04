import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  loading = false,
  emptyMessage = 'No records found',
  emptyDescription = 'There are no items to display matching the criteria.',
  pageSize = 10,
  onRowClick,
  className = ''
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(String(valB));
        return sortOrder === 'asc' ? cmp : -cmp;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key, sortable = true) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className={`border-2 border-slate-900 rounded-sm bg-white overflow-hidden shadow-[3px_3px_0px_#0f172a] ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-800 border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-900">
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  onClick={() => handleSort(col.key, col.sortable !== false)}
                  className={`px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-900 font-mono ${
                    col.sortable !== false ? 'cursor-pointer hover:bg-slate-200/80 select-none' : ''
                  } ${col.headerClassName || ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <span className="text-slate-500">
                        {sortKey === col.key ? (
                          sortOrder === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-900 stroke-[3]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-900 stroke-[3]" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <LoadingState message="Scanning manga archives..." />
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-10">
                  <EmptyState title={emptyMessage} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={row[keyField] || index}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-blue-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key || col.header} className={`px-4 py-3.5 font-medium ${col.className || ''}`}>
                      {col.render ? col.render(row[col.key], row, index) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && data.length > pageSize && (
        <div className="px-4 py-3 border-t-2 border-slate-900 bg-slate-50 flex items-center justify-between text-xs text-slate-600 font-mono">
          <div>
            Panel records <span className="font-bold text-slate-900">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, data.length)}</span> of{' '}
            <span className="font-bold text-slate-900">{data.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-sm border-2 border-slate-900 bg-white text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none shadow-[1.5px_1.5px_0px_#0f172a]"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 py-1 font-bold text-slate-900 bg-white border-2 border-slate-900 rounded-sm shadow-[1.5px_1.5px_0px_#0f172a]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-sm border-2 border-slate-900 bg-white text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none shadow-[1.5px_1.5px_0px_#0f172a]"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

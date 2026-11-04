import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowRight, Search, PlusCircle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import SearchBar from '../components/common/SearchBar';
import Filters from '../components/common/Filters';
import DataTable from '../components/common/DataTable';
import StatusBadge, { PriorityBadge } from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { SEED_COMPLAINTS, CATEGORIES } from '../data/demoData';

export default function TrackGrievance() {
  const { grievanceList, loading } = useApp();
  const navigate = useNavigate();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'All',
    category: 'All',
    priority: 'All'
  });

  const allGrievances = useMemo(() => {
    if (grievanceList && grievanceList.length > 0) {
      return grievanceList;
    }
    return SEED_COMPLAINTS;
  }, [grievanceList]);

  // Filtered grievances
  const filteredGrievances = useMemo(() => {
    return allGrievances.filter((g) => {
      const code = (g.ticketId || g.grievance_code || g.ticket_number || g.id || '').toLowerCase();
      const title = (g.title || '').toLowerCase();
      const desc = (g.description || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch = !query || code.includes(query) || title.includes(query) || desc.includes(query);
      const matchesStatus = filters.status === 'All' || (g.status || '').toLowerCase() === filters.status.toLowerCase();
      const matchesCategory = filters.category === 'All' || (g.category || g.category_name || '').toLowerCase() === filters.category.toLowerCase();
      const matchesPriority = filters.priority === 'All' || (g.priority || '').toLowerCase() === filters.priority.toLowerCase();

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [allGrievances, searchQuery, filters]);

  const columns = [
    {
      header: 'Ticket ID',
      key: 'ticketId',
      render: (_, row) => (
        <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-slate-900 text-xs shadow-[1px_1px_0px_#000]">
          #{row.ticketId || row.grievance_code || row.ticket_number || row.id}
        </span>
      )
    },
    {
      header: 'Subject & Jurisdiction',
      key: 'title',
      render: (_, row) => (
        <div className="max-w-md">
          <p className="font-black text-slate-950 truncate tracking-tight">{row.title}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
            <span className="font-bold text-slate-700">{row.category || row.category_name}</span>
            <span>//</span>
            <span>{row.department}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Severity',
      key: 'priority',
      render: (_, row) => <PriorityBadge priority={row.priority} />
    },
    {
      header: 'FSM Status',
      key: 'status',
      render: (_, row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Date Lodged',
      key: 'createdAt',
      render: (_, row) => {
        const rawDate = row.createdAt || row.created_at;
        return (
          <span className="text-xs font-mono font-medium text-slate-600">
            {rawDate ? new Date(rawDate).toLocaleDateString() : 'N/A'}
          </span>
        );
      }
    },
    {
      header: 'Action',
      key: 'actions',
      sortable: false,
      render: (_, row) => {
        const id = row.ticketId || row.grievance_code || row.id;
        return (
          <Link
            to={`/grievance/${id}`}
            className="inline-flex items-center gap-1 text-xs font-black font-mono bg-slate-900 hover:bg-blue-600 text-white px-2.5 py-1 rounded-xs transition-colors"
          >
            <span>Dossier</span>
            <ArrowRight className="w-3 h-3 stroke-[3]" />
          </Link>
        );
      }
    }
  ];

  return (
    <DashboardLayout
      title="TRACK STATUS REGISTRY"
      subtitle="Public & institutional audit registry of active complaints across MITS departments"
      chapter="REGISTRY.03"
      breadcrumbs={[
        { label: 'Dashboard', href: '/student/dashboard' },
        { label: 'Track Grievances' }
      ]}
      actions={
        <Link to="/submit">
          <Button variant="primary" size="sm" icon={PlusCircle} className="font-mono text-xs">
            Lodge New Grievance
          </Button>
        </Link>
      }
    >
      {/* Search & Filter Bar in Manga Panel */}
      <Card bodyClassName="p-4" tag="SEARCH">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-6">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Filter by Ticket Code (e.g. GMS-2026-101) or keyword..."
            />
          </div>
          <div className="md:col-span-6 flex justify-start md:justify-end">
            <Filters
              filters={filters}
              onChange={setFilters}
              onReset={() => {
                setSearchQuery('');
                setFilters({ status: 'All', category: 'All', priority: 'All' });
              }}
              categories={CATEGORIES}
            />
          </div>
        </div>
      </Card>

      {/* Grievances Data Table */}
      <DataTable
        columns={columns}
        data={filteredGrievances}
        loading={loading}
        pageSize={8}
        keyField="id"
        emptyMessage="No matching claims found in the ledger!"
        emptyDescription="Try clearing your filters or checking your ticket code."
        onRowClick={(row) => {
          const id = row.ticketId || row.grievance_code || row.id;
          navigate(`/grievance/${id}`);
        }}
      />
    </DashboardLayout>
  );
}

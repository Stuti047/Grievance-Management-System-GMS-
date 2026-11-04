import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../api';
import {
  Compass,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Building,
  Edit2,
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Info
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingState from '../components/common/LoadingState';

export default function ResponsibilityMappingPage() {
  const { addToast } = useApp();

  const [categories, setCategories] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE' | 'WARNINGS'
  const [sectionFilter, setSectionFilter] = useState('ALL');

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formAuthorityId, setFormAuthorityId] = useState('');
  const [formEscalationId, setFormEscalationId] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formSlaHours, setFormSlaHours] = useState(48);
  const [formIsActive, setFormIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch Categories & Authorities
  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, authRes] = await Promise.all([
        api.lookup.fetchCategories(),
        api.admin.listAuthorities({ all: true })
      ]);

      if (catRes) setCategories(catRes);
      if (authRes.authorities) setAuthorities(authRes.authorities);
    } catch (err) {
      console.error('Failed to load routing data:', err);
      addToast('Data Error', 'Failed to retrieve responsibility mappings from backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Authorities list (only active authorities for assignment)
  const activeAuthorities = useMemo(() => {
    return authorities.filter(a => a.status === 'active');
  }, [authorities]);

  // Compute Warnings for Missing or Conflicting Mappings
  const enrichedCategories = useMemo(() => {
    return categories.map(cat => {
      const warnings = [];
      const primaryAuth = authorities.find(a => a.id === (cat.authority_id || cat.sub_authority_id));
      const escalationAuth = authorities.find(a => a.id === cat.escalation_authority_id);

      if (!cat.authority_id && !cat.sub_authority_id) {
        warnings.push('NO_PRIMARY_FACULTY');
      } else if (primaryAuth && primaryAuth.status !== 'active') {
        warnings.push('INACTIVE_PRIMARY_FACULTY');
      }

      if (!cat.escalation_authority_id) {
        warnings.push('NO_ESCALATION_AUTHORITY');
      } else if (escalationAuth && escalationAuth.status !== 'active') {
        warnings.push('INACTIVE_ESCALATION_FACULTY');
      }

      if (cat.authority_id && cat.escalation_authority_id && cat.authority_id === cat.escalation_authority_id) {
        warnings.push('CONFLICTING_SELF_ESCALATION');
      }

      return {
        ...cat,
        primaryAuth,
        escalationAuth,
        warnings,
        hasWarnings: warnings.length > 0
      };
    });
  }, [categories, authorities]);

  // Filtered List
  const filteredCategories = useMemo(() => {
    return enrichedCategories.filter(cat => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || (
        cat.name.toLowerCase().includes(q) ||
        (cat.department || '').toLowerCase().includes(q) ||
        (cat.responsible_designation || '').toLowerCase().includes(q) ||
        (cat.primaryAuth?.name || '').toLowerCase().includes(q) ||
        (cat.escalationAuth?.name || '').toLowerCase().includes(q)
      );

      let matchStatus = true;
      if (statusFilter === 'ACTIVE') matchStatus = cat.is_active !== false;
      if (statusFilter === 'INACTIVE') matchStatus = cat.is_active === false;
      if (statusFilter === 'WARNINGS') matchStatus = cat.hasWarnings;

      const matchSection = sectionFilter === 'ALL' || (cat.section || '').toLowerCase() === sectionFilter.toLowerCase();

      return matchSearch && matchStatus && matchSection;
    });
  }, [enrichedCategories, searchQuery, statusFilter, sectionFilter]);

  // Open Edit Modal
  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormAuthorityId(cat.authority_id || cat.sub_authority_id || '');
    setFormEscalationId(cat.escalation_authority_id || '');
    setFormDepartment(cat.department || cat.primaryAuth?.department || '');
    setFormDesignation(cat.responsible_designation || cat.primaryAuth?.designation || '');
    setFormSlaHours(cat.sla_hours || 48);
    setFormIsActive(cat.is_active !== false);
    setFormError('');
    setEditModalOpen(true);
  };

  // Quick Toggle Active State
  const handleToggleActive = async (cat, e) => {
    e.stopPropagation();
    try {
      const targetState = !cat.is_active;
      const res = await api.admin.updateCategoryRouting(cat.id, {
        is_active: targetState
      });

      if (res.error) {
        addToast('Toggle Failed', res.error, 'error');
        return;
      }

      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: targetState } : c));
      addToast(
        targetState ? 'Mapping Activated' : 'Mapping Suspended',
        `Category "${cat.name}" is now ${targetState ? 'actively routed' : 'suspended'}.`,
        'success'
      );
    } catch (err) {
      addToast('Error', 'Failed to toggle category active status', 'error');
    }
  };

  // Submit Edit Form
  const handleSaveMapping = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    setSaving(true);
    setFormError('');

    try {
      const res = await api.admin.updateCategoryRouting(editingCategory.id, {
        authority_id: formAuthorityId || null,
        escalation_authority_id: formEscalationId || null,
        department: formDepartment.trim(),
        responsible_designation: formDesignation.trim(),
        sla_hours: parseInt(formSlaHours, 10),
        is_active: formIsActive
      });

      if (res.error) {
        setFormError(res.error);
        setSaving(false);
        return;
      }

      setCategories(prev => prev.map(c => {
        if (c.id === editingCategory.id) {
          return {
            ...c,
            authority_id: formAuthorityId,
            sub_authority_id: formAuthorityId,
            escalation_authority_id: formEscalationId,
            department: formDepartment.trim(),
            responsible_designation: formDesignation.trim(),
            sla_hours: parseInt(formSlaHours, 10),
            is_active: formIsActive
          };
        }
        return c;
      }));

      setEditModalOpen(false);
      addToast(
        'Mapping Configured',
        `Responsibility routing updated for "${editingCategory.name}".`,
        'success'
      );
    } catch (err) {
      setFormError(err.message || 'Failed to save mapping');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Grievance Category',
      key: 'name',
      render: (_, r) => (
        <div className="max-w-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-slate-950 text-xs font-mono">{r.name}</span>
            {r.is_active === false && (
              <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 rounded-xs">
                SUSPENDED
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            Section: <span className="uppercase font-bold text-slate-700">{r.section || 'College'}</span>
          </p>
        </div>
      )
    },
    {
      header: 'Assigned Department',
      key: 'department',
      render: (_, r) => (
        <span className="text-xs font-mono font-bold text-slate-800">
          {r.department || r.primaryAuth?.department || 'General Administration'}
        </span>
      )
    },
    {
      header: 'Primary Faculty Member',
      key: 'primaryAuth',
      render: (_, r) => {
        if (!r.primaryAuth) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-400">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              NO FACULTY ALLOTTED
            </span>
          );
        }

        return (
          <div className="text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900">{r.primaryAuth.name}</span>
              {r.primaryAuth.status !== 'active' && (
                <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1 rounded-xs">INACTIVE</span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">{r.responsible_designation || r.primaryAuth.designation}</p>
          </div>
        );
      }
    },
    {
      header: 'Escalation Authority',
      key: 'escalationAuth',
      render: (_, r) => {
        if (!r.escalationAuth) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-400">
              <Info className="w-3 h-3 text-amber-600" />
              NO ESCALATION PATH
            </span>
          );
        }

        return (
          <div className="text-xs font-mono">
            <p className="font-bold text-blue-950">{r.escalationAuth.name}</p>
            <p className="text-[10px] text-slate-500">{r.escalationAuth.designation}</p>
          </div>
        );
      }
    },
    {
      header: 'SLA Target',
      key: 'sla_hours',
      render: (_, r) => (
        <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-slate-900 bg-blue-50 px-2 py-0.5 rounded border border-slate-900 shadow-[1px_1px_0px_#000]">
          <Clock className="w-3 h-3 text-blue-600" />
          {r.sla_hours || 48}h
        </span>
      )
    },
    {
      header: 'Mapping Status',
      key: 'status',
      render: (_, r) => (
        <div className="flex flex-col gap-1">
          {r.warnings.map(w => (
            <span key={w} className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-300">
              <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
              {w === 'NO_PRIMARY_FACULTY' && 'Missing Primary'}
              {w === 'NO_ESCALATION_AUTHORITY' && 'Missing Escalation'}
              {w === 'INACTIVE_PRIMARY_FACULTY' && 'Faculty Inactive'}
              {w === 'INACTIVE_ESCALATION_FACULTY' && 'Escalation Inactive'}
              {w === 'CONFLICTING_SELF_ESCALATION' && 'Self-Escalation Loop'}
            </span>
          ))}
          {!r.hasWarnings && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300 w-fit">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
              HEALTHY MAPPING
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      sortable: false,
      render: (_, r) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(r);
            }}
            className="inline-flex items-center gap-1 text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-slate-900 px-2 py-1 rounded-sm shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
            <span>Configure</span>
          </button>
          <button
            type="button"
            onClick={(e) => handleToggleActive(r, e)}
            title={r.is_active !== false ? 'Suspend mapping' : 'Activate mapping'}
            className="text-slate-700 hover:text-slate-950 cursor-pointer p-1"
          >
            {r.is_active !== false ? (
              <ToggleRight className="w-6 h-6 text-emerald-600" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-400" />
            )}
          </button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout
      title="RESPONSIBILITY MAPPING & ESCALATION ENGINE"
      subtitle="Configure grievance routing matrices, responsible designations, and institutional escalation authorities"
      chapter="GOVERNANCE.02"
      breadcrumbs={[
        { label: 'Admin Headquarters', href: '/admin/dashboard' },
        { label: 'Responsibility Mappings' }
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            icon={RefreshCw}
            className="font-mono text-xs"
          >
            Refresh Data
          </Button>
          <Link to="/admin/dashboard">
            <Button variant="manga" size="sm" className="font-mono text-xs">
              Return to Headquarters
            </Button>
          </Link>
        </div>
      }
    >
      {/* Editorial Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border-2 border-slate-900 rounded-sm shadow-[3px_3px_0px_#000] space-y-1">
          <div className="flex justify-between items-center text-xs font-mono font-black text-slate-500 uppercase">
            <span>Total Categories Mapped</span>
            <Compass className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black font-mono text-slate-900">{categories.length}</p>
          <p className="text-[11px] text-slate-500 font-mono">Institutional domains covered</p>
        </div>

        <div className="p-4 bg-white border-2 border-slate-900 rounded-sm shadow-[3px_3px_0px_#000] space-y-1">
          <div className="flex justify-between items-center text-xs font-mono font-black text-slate-500 uppercase">
            <span>Healthy SLA Routes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black font-mono text-emerald-700">
            {enrichedCategories.filter(c => !c.hasWarnings && c.is_active !== false).length}
          </p>
          <p className="text-[11px] text-slate-500 font-mono">Fully validated routing paths</p>
        </div>

        <div className="p-4 bg-white border-2 border-slate-900 rounded-sm shadow-[3px_3px_0px_#000] space-y-1">
          <div className="flex justify-between items-center text-xs font-mono font-black text-slate-500 uppercase">
            <span>Action Required / Warnings</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-3xl font-black font-mono text-rose-700">
            {enrichedCategories.filter(c => c.hasWarnings).length}
          </p>
          <p className="text-[11px] text-slate-500 font-mono">Missing faculty or escalation paths</p>
        </div>
      </div>

      {/* Main Table Panel */}
      <Card
        title="CATEGORY RESPONSIBILITY MATRIX"
        subtitle="Manage end-to-end dispatch paths from student submission to faculty redressal and escalation"
        tag="ROUTING.TABLE"
        bodyClassName="p-0"
      >
        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-50 border-b-2 border-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search category, department, or faculty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-white border-2 border-slate-900 rounded-sm font-mono text-slate-900 shadow-[2px_2px_0px_#000] w-72 focus:outline-none"
              />
            </div>

            {/* Status Pills */}
            <div className="inline-flex items-center rounded-sm border-2 border-slate-900 bg-white p-0.5 shadow-[2px_2px_0px_#000]">
              {[
                { id: 'ALL', label: 'All Mappings' },
                { id: 'ACTIVE', label: 'Active Only' },
                { id: 'INACTIVE', label: 'Suspended' },
                { id: 'WARNINGS', label: 'Needs Review' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-xs cursor-pointer transition-colors ${
                    statusFilter === tab.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="text-xs bg-white border-2 border-slate-900 rounded-sm px-2.5 py-1.5 font-mono text-slate-900 shadow-[2px_2px_0px_#000]"
            >
              <option value="ALL">All Sections</option>
              <option value="college">College Campus</option>
              <option value="hostel">Hostel Section</option>
              <option value="mess">Mess & Dining</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <LoadingState message="Loading responsibility mapping records..." />
        ) : (
          <DataTable
            columns={columns}
            data={filteredCategories}
            pageSize={10}
            onRowClick={(cat) => openEditModal(cat)}
          />
        )}
      </Card>

      {/* ─────────────────────────────────────────────────────────────────────────────
          EDIT RESPONSIBILITY MAPPING MODAL
          ───────────────────────────────────────────────────────────────────────────── */}
      {editModalOpen && editingCategory && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`CONFIGURE ROUTING: ${editingCategory.name}`}
          subtitle="Configure responsible department, designation, faculty member, and escalation authority"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSaveMapping} className="space-y-4">
            {formError && (
              <ErrorMessage variant="error" message={formError} />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Department */}
              <div>
                <label className="block text-xs font-mono font-black uppercase text-slate-900 mb-1">
                  Assigned Department / Cell
                </label>
                <input
                  type="text"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  placeholder="e.g. Examination Cell, Hostel Administration..."
                  required
                  className="w-full text-xs bg-white border-2 border-slate-900 rounded-sm p-2 text-slate-900 font-mono shadow-[2px_2px_0px_#000]"
                />
              </div>

              {/* Responsible Designation */}
              <div>
                <label className="block text-xs font-mono font-black uppercase text-slate-900 mb-1">
                  Responsible Designation
                </label>
                <input
                  type="text"
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  placeholder="e.g. Controller of Examination, Chief Warden..."
                  required
                  className="w-full text-xs bg-white border-2 border-slate-900 rounded-sm p-2 text-slate-900 font-mono shadow-[2px_2px_0px_#000]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Active Faculty Member */}
              <div>
                <label className="block text-xs font-mono font-black uppercase text-slate-900 mb-1">
                  Primary Faculty Member (Nodal Officer)
                </label>
                <select
                  value={formAuthorityId}
                  onChange={(e) => setFormAuthorityId(e.target.value)}
                  className="w-full text-xs bg-white border-2 border-slate-900 rounded-sm p-2 text-slate-900 font-mono shadow-[2px_2px_0px_#000]"
                >
                  <option value="">-- Select Active Faculty Authority --</option>
                  {authorities.map(auth => (
                    <option key={auth.id} value={auth.id}>
                      {auth.name} ({auth.designation || auth.department}) {auth.status !== 'active' ? '[INACTIVE]' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  Incoming grievances in this category route directly to this officer.
                </p>
              </div>

              {/* Escalation Authority */}
              <div>
                <label className="block text-xs font-mono font-black uppercase text-slate-900 mb-1">
                  Escalation Authority (Higher Directorate)
                </label>
                <select
                  value={formEscalationId}
                  onChange={(e) => setFormEscalationId(e.target.value)}
                  className="w-full text-xs bg-white border-2 border-slate-900 rounded-sm p-2 text-slate-900 font-mono shadow-[2px_2px_0px_#000]"
                >
                  <option value="">-- Select Escalation Authority --</option>
                  {authorities.map(auth => (
                    <option key={auth.id} value={auth.id}>
                      {auth.name} ({auth.designation || auth.department})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  Triggered upon manual escalation or SLA breach.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Resolution Target (SLA Hours) */}
              <div>
                <label className="block text-xs font-mono font-black uppercase text-slate-900 mb-1">
                  Resolution Target SLA (Hours)
                </label>
                <input
                  type="number"
                  min="6"
                  max="168"
                  value={formSlaHours}
                  onChange={(e) => setFormSlaHours(e.target.value)}
                  className="w-full text-xs bg-white border-2 border-slate-900 rounded-sm p-2 text-slate-900 font-mono shadow-[2px_2px_0px_#000]"
                />
              </div>

              {/* Active Toggle */}
              <div className="pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded-xs border-2 border-slate-900 text-blue-600 focus:ring-0"
                  />
                  <span className="text-xs font-mono font-black text-slate-900">
                    Active Mapping (Available for Student Filing)
                  </span>
                </label>
              </div>
            </div>

            {/* Warnings Alert if conflict detected */}
            {formAuthorityId && formEscalationId && formAuthorityId === formEscalationId && (
              <div className="p-3 bg-amber-50 border-2 border-amber-500 text-amber-950 font-mono text-xs rounded-sm">
                ⚠️ Warning: Primary authority and escalation authority cannot be the exact same person. Please choose a different higher authority for escalation.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t-2 border-slate-900">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditModalOpen(false)}
                className="font-mono text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={saving}
                className="font-mono text-xs"
              >
                Save Responsibility Mapping
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}


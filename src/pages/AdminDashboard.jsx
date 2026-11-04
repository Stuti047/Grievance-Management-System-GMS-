import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../api';
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building,
  ShieldCheck,
  Compass,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  PlusCircle,
  Edit2,
  Mail,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  History,
  UserCheck,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import DataTable from '../components/common/DataTable';
import StatusBadge, { PriorityBadge, RoleBadge } from '../components/common/Badge';
import RecentActivity from '../components/dashboard/RecentActivity';
import Modal from '../components/common/Modal';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingState from '../components/common/LoadingState';

export default function AdminDashboard() {
  const { currentUser, grievanceList, adminUsers, addToast } = useApp();
  const navigate = useNavigate();

  // Active View Tabs: 'grievances' | 'authorities' | 'routing' | 'departments' | 'users' | 'audit'
  const [activeView, setActiveView] = useState('grievances');

  // Search & Filter States
  const [grievanceSearch, setGrievanceSearch] = useState('');
  const [authoritySearch, setAuthoritySearch] = useState('');
  const [authorityGroupFilter, setAuthorityGroupFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');

  // Live Data States
  const [complaints, setComplaints] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Authority Edit / Create Modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [editingAuth, setEditingAuth] = useState(null);
  const [authName, setAuthName] = useState('');
  const [authDesignation, setAuthDesignation] = useState('');
  const [authDepartment, setAuthDepartment] = useState('');
  const [authResponsibilities, setAuthResponsibilities] = useState('');
  const [authEmails, setAuthEmails] = useState('');
  const [authGroup, setAuthGroup] = useState('academic_student');
  const [authStatus, setAuthStatus] = useState('active');
  const [savingAuth, setSavingAuth] = useState(false);
  const [authError, setAuthError] = useState('');

  // Grievance Reassignment Modal
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [targetGrievance, setTargetGrievance] = useState(null);
  const [selectedAuthorityId, setSelectedAuthorityId] = useState('');
  const [reassignRemarks, setReassignRemarks] = useState('');
  const [submittingReassign, setSubmittingReassign] = useState(false);

  // Fetch Live Data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [grvRes, authRes, catRes, userRes, logRes] = await Promise.all([
        api.grievances.list({ limit: 100 }),
        api.admin.listAuthorities({ all: true }),
        api.lookup.fetchCategories(),
        api.admin.listUsers(),
        api.admin.getAuthorityAuditLogs()
      ]);

      if (grvRes.grievances) setComplaints(grvRes.grievances);
      if (authRes.authorities) setAuthorities(authRes.authorities);
      if (catRes) setCategories(catRes);
      if (userRes.users) setUsersList(userRes.users);
      if (logRes.audit_logs) setAuditLogs(logRes.audit_logs);
    } catch (err) {
      console.warn('Backend connection notice, falling back to local context:', err);
      if (grievanceList) setComplaints(grievanceList);
      if (adminUsers) setUsersList(adminUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Grievance Metrics
  const metrics = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter(g => (g.status || '').toLowerCase().includes('review') || (g.status || '').toLowerCase().includes('submitted')).length;
    const inProgress = complaints.filter(g => (g.status || '').toLowerCase().includes('progress') || (g.status || '').toLowerCase().includes('assigned')).length;
    const resolved = complaints.filter(g => (g.status || '').toLowerCase().includes('resolved') || (g.status || '').toLowerCase().includes('closed')).length;
    const escalated = complaints.filter(g => (g.status || '').toLowerCase().includes('escalated')).length;
    
    // SLA Overdue detection (created > SLA hours and not resolved)
    const now = Date.now();
    const overdue = complaints.filter(g => {
      if ((g.status || '').toLowerCase().includes('resolved') || (g.status || '').toLowerCase().includes('closed')) return false;
      const created = new Date(g.created_at || Date.now()).getTime();
      const slaMs = (g.sla_hours || 48) * 3600 * 1000;
      return (now - created) > slaMs;
    }).length;

    const rate = total > 0 ? Math.round((resolved / total) * 100) : 100;

    return { total, pending, inProgress, resolved, escalated, overdue, rate };
  }, [complaints]);

  // Filtered Complaints
  const filteredComplaints = useMemo(() => {
    if (!grievanceSearch.trim()) return complaints;
    const q = grievanceSearch.toLowerCase();
    return complaints.filter(c =>
      (c.ticketId || c.grievance_code || c.id || '').toLowerCase().includes(q) ||
      (c.title || '').toLowerCase().includes(q) ||
      (c.department || '').toLowerCase().includes(q) ||
      (c.category || '').toLowerCase().includes(q) ||
      (c.submittedBy?.name || '').toLowerCase().includes(q)
    );
  }, [complaints, grievanceSearch]);

  // Categorized Authorities Groups
  const categorizedAuthorities = useMemo(() => {
    const q = authoritySearch.toLowerCase().trim();
    const matches = (a) => {
      if (!q) return true;
      const emailsStr = (a.official_emails || []).join(' ') + ' ' + (a.email || '');
      return (
        a.name.toLowerCase().includes(q) ||
        (a.designation || '').toLowerCase().includes(q) ||
        (a.department || '').toLowerCase().includes(q) ||
        emailsStr.toLowerCase().includes(q)
      );
    };

    const list = authorities.filter(matches);

    return {
      leadership: list.filter(a => a.category_group === 'leadership'),
      academic: list.filter(a => a.category_group === 'academic_student'),
      hod: list.filter(a => a.category_group === 'department_head')
    };
  }, [authorities, authoritySearch]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return usersList;
    const q = userSearch.toLowerCase();
    return usersList.filter(u =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  }, [usersList, userSearch]);

  // Open Edit Authority Modal
  const openEditAuthority = (auth = null, defaultGroup = 'academic_student') => {
    setEditingAuth(auth);
    if (auth) {
      setAuthName(auth.name);
      setAuthDesignation(auth.designation || '');
      setAuthDepartment(auth.department || '');
      setAuthResponsibilities(auth.responsibilities || '');
      const emails = auth.official_emails && auth.official_emails.length > 0
        ? auth.official_emails.join(', ')
        : (auth.email || '');
      setAuthEmails(emails);
      setAuthGroup(auth.category_group || 'academic_student');
      setAuthStatus(auth.status || 'active');
    } else {
      setAuthName('');
      setAuthDesignation('');
      setAuthDepartment('');
      setAuthResponsibilities('');
      setAuthEmails('');
      setAuthGroup(defaultGroup);
      setAuthStatus('active');
    }
    setAuthError('');
    setAuthModalOpen(true);
  };

  // Save Authority (Create or Update)
  const handleSaveAuthority = async (e) => {
    e.preventDefault();
    setSavingAuth(true);
    setAuthError('');

    const emailsArray = authEmails
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      name: authName.trim(),
      designation: authDesignation.trim(),
      department: authDepartment.trim(),
      responsibilities: authResponsibilities.trim(),
      official_emails: emailsArray,
      email: emailsArray[0] || null,
      category_group: authGroup,
      status: authStatus
    };

    try {
      if (editingAuth) {
        const res = await api.admin.updateAuthority(editingAuth.id, payload);
        if (res.error) {
          setAuthError(res.error);
          setSavingAuth(false);
          return;
        }

        setAuthorities(prev => prev.map(a => a.id === editingAuth.id ? { ...a, ...payload } : a));
        addToast('Authority Updated', `Updated official record for ${authName}.`, 'success');
      } else {
        const res = await api.admin.createAuthority(payload);
        if (res.error) {
          setAuthError(res.error);
          setSavingAuth(false);
          return;
        }

        if (res.authority) {
          setAuthorities(prev => [...prev, res.authority]);
        }
        addToast('Authority Enrolled', `Registered ${authName} into institutional hierarchy.`, 'success');
      }
      setAuthModalOpen(false);
    } catch (err) {
      setAuthError(err.message || 'Operation failed');
    } finally {
      setSavingAuth(false);
    }
  };

  // Toggle Authority Status
  const handleToggleAuthorityStatus = async (auth, e) => {
    e.stopPropagation();
    const newStatus = auth.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.admin.updateAuthority(auth.id, { status: newStatus });
      if (res.error) {
        addToast('Status Update Failed', res.error, 'error');
        return;
      }

      setAuthorities(prev => prev.map(a => a.id === auth.id ? { ...a, status: newStatus } : a));
      addToast(
        newStatus === 'active' ? 'Authority Activated' : 'Authority Suspended',
        `${auth.name} marked as ${newStatus}.`,
        'success'
      );
    } catch (err) {
      addToast('Error', 'Failed to toggle authority status', 'error');
    }
  };

  // Reassign Grievance
  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!targetGrievance || !selectedAuthorityId) return;
    setSubmittingReassign(true);

    try {
      const res = await api.admin.reassignGrievance(targetGrievance.id, {
        authority_id: selectedAuthorityId,
        status: 'Assigned',
        remarks: reassignRemarks || 'Reassigned to designated nodal authority by Main Administration'
      });

      if (res.error) {
        addToast('Reassignment Failed', res.error, 'error');
        setSubmittingReassign(false);
        return;
      }

      const selectedAuth = authorities.find(a => a.id === selectedAuthorityId);
      setComplaints(prev => prev.map(g => {
        if (g.id === targetGrievance.id) {
          return {
            ...g,
            status: 'Assigned',
            assigned_authority_id: selectedAuthorityId,
            assignedTo: selectedAuth ? {
              name: selectedAuth.name,
              designation: selectedAuth.designation,
              department: selectedAuth.department
            } : g.assignedTo
          };
        }
        return g;
      }));

      setReassignModalOpen(false);
      addToast(
        'Grievance Reassigned',
        `Case #${targetGrievance.ticketId || targetGrievance.id} dispatched to ${selectedAuth?.name || 'Authority'}.`,
        'success'
      );
    } catch (err) {
      addToast('Error', err.message || 'Reassignment failed', 'error');
    } finally {
      setSubmittingReassign(false);
    }
  };

  // Columns for Grievance Registry
  const grievanceColumns = [
    {
      header: 'Ticket ID',
      key: 'ticketId',
      render: (_, r) => (
        <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-slate-900 text-xs shadow-[1px_1px_0px_#000]">
          #{r.ticketId || r.grievance_code || r.id}
        </span>
      )
    },
    {
      header: 'Subject & Category',
      key: 'title',
      render: (_, r) => (
        <div className="max-w-xs">
          <p className="font-black text-slate-950 truncate tracking-tight">{r.title}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            {r.category || r.category_name} // {r.department || 'MITS Campus'}
          </p>
        </div>
      )
    },
    {
      header: 'Assigned Officer',
      key: 'assignedTo',
      render: (_, r) => (
        <div className="text-xs font-mono">
          <p className="font-black text-slate-900">{r.assignedTo?.name || r.sub_authority_name || 'Nodal Authority'}</p>
          <p className="text-[10px] text-slate-500">{r.assignedTo?.designation || 'Authority'}</p>
        </div>
      )
    },
    {
      header: 'Priority',
      key: 'priority',
      render: (_, r) => <PriorityBadge priority={r.priority} />
    },
    {
      header: 'Status',
      key: 'status',
      render: (_, r) => <StatusBadge status={r.status} />
    },
    {
      header: 'Actions',
      key: 'actions',
      sortable: false,
      render: (_, r) => (
        <div className="flex items-center gap-1.5">
          <Link
            to={`/grievance/${r.ticketId || r.grievance_code || r.id}`}
            className="text-xs font-mono font-bold bg-slate-900 hover:bg-blue-600 text-white px-2 py-1 rounded-xs transition-colors"
          >
            Review
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setTargetGrievance(r);
              setSelectedAuthorityId(r.assigned_authority_id || '');
              setReassignRemarks('');
              setReassignModalOpen(true);
            }}
            className="text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 border border-slate-900 px-2 py-1 rounded-xs cursor-pointer shadow-[1px_1px_0px_#000]"
          >
            Reassign
          </button>
        </div>
      )
    }
  ];

  // User Columns
  const userColumns = [
    {
      header: 'Member Identity',
      key: 'name',
      render: (_, u) => (
        <div>
          <p className="font-black text-slate-950 font-mono">{u.name}</p>
          <p className="text-[10px] text-slate-500 font-mono">{u.email}</p>
        </div>
      )
    },
    {
      header: 'Department / Section',
      key: 'department',
      render: (_, u) => <span className="text-xs font-mono font-medium text-slate-700">{u.department || 'N/A'}</span>
    },
    {
      header: 'Role Clearance',
      key: 'role',
      render: (_, u) => <RoleBadge role={u.role} />
    },
    {
      header: 'SSO Status',
      key: 'status',
      render: (_, u) => (
        <span className={`inline-flex items-center text-xs font-mono font-bold px-2 py-0.5 rounded border border-slate-900 shadow-[1px_1px_0px_#000] ${
          u.status === 'blocked' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
        }`}>
          {u.status === 'blocked' ? 'BLOCKED' : 'ACTIVE'}
        </span>
      )
    }
  ];

  // Authority Card Component
  const renderAuthorityCard = (auth) => {
    const emails = auth.official_emails && auth.official_emails.length > 0
      ? auth.official_emails
      : (auth.email ? [auth.email] : []);

    return (
      <div
        key={auth.id}
        onClick={() => openEditAuthority(auth)}
        className="bg-white border-2 border-slate-900 rounded-sm p-4 shadow-[3px_3px_0px_#000] hover:shadow-[5px_5px_0px_#000] transition-all cursor-pointer relative flex flex-col justify-between"
      >
        <div>
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h4 className="font-mono font-black text-sm text-slate-950 leading-tight">
                {auth.name}
              </h4>
              <p className="text-xs font-bold text-blue-700 mt-0.5">{auth.designation || 'Institutional Officer'}</p>
              <p className="text-[11px] font-mono text-slate-500">{auth.department}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border border-slate-900 rounded-xs uppercase ${
                auth.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {auth.status}
              </span>
            </div>
          </div>

          {/* Responsibilities */}
          {auth.responsibilities && (
            <p className="text-xs text-slate-700 bg-slate-50 p-2 border border-slate-300 rounded-xs font-medium my-2.5 line-clamp-2">
              {auth.responsibilities}
            </p>
          )}

          {/* Email chips */}
          <div className="space-y-1 my-2">
            {emails.length === 0 ? (
              <span className="inline-block text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                Contact through department portal
              </span>
            ) : (
              emails.map((email, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] font-mono text-slate-700">
                  <Mail className="w-3 h-3 text-blue-600 shrink-0" />
                  <a
                    href={`mailto:${email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:underline text-blue-700 font-bold truncate"
                  >
                    {email}
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
          <span className="text-[10px] font-bold text-slate-500">
            Assigned: {auth.assigned_grievances_count || 0} cases
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => handleToggleAuthorityStatus(auth, e)}
              className="text-slate-600 hover:text-slate-950 p-0.5"
              title={auth.status === 'active' ? 'Suspend' : 'Activate'}
            >
              {auth.status === 'active' ? (
                <ToggleRight className="w-5 h-5 text-emerald-600" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-slate-400" />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openEditAuthority(auth);
              }}
              className="px-2 py-0.5 bg-slate-100 hover:bg-amber-300 text-slate-900 border border-slate-900 rounded-xs font-bold"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      title="CENTRAL PROCTORIAL BOARD & ADMIN COMMAND"
      subtitle="Institutional Oversight, Compliance Monitoring & Authority Governance • MITS Gwalior"
      chapter="HEADQUARTERS"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/admin/responsibility-mappings">
            <Button variant="primary" size="sm" icon={Compass} className="font-mono text-xs">
              Responsibility Engine
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadAllData}
            icon={RefreshCw}
            className="font-mono text-xs"
          >
            Sync
          </Button>
        </div>
      }
    >
      {/* 4 Creative Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Claims Logged"
          value={metrics.total}
          subtitle="All-time grievance ledger count"
          icon={FileText}
          badgeText="REGISTRY"
          badgeVariant="blue"
          watermark="TOTAL"
          onClick={() => setActiveView('grievances')}
          className={activeView === 'grievances' ? 'ring-2 ring-blue-600' : ''}
        />
        <StatCard
          title="Active In Queue"
          value={metrics.pending + metrics.inProgress}
          subtitle={`${metrics.pending} pending / ${metrics.inProgress} in remediation`}
          icon={Clock}
          badgeText="ACTIVE"
          badgeVariant="amber"
          watermark="QUEUE"
          onClick={() => setActiveView('grievances')}
        />
        <StatCard
          title="Overdue / SLA Alerts"
          value={metrics.overdue}
          subtitle="Breached standard target SLA window"
          icon={AlertTriangle}
          badgeText="CRITICAL"
          badgeVariant="rose"
          watermark="BREACH"
          onClick={() => setActiveView('grievances')}
        />
        <StatCard
          title="Institutional Officers"
          value={authorities.length}
          subtitle="Configured across institutional tiers"
          icon={ShieldCheck}
          badgeText="GOVERNANCE"
          badgeVariant="emerald"
          watermark="AUTH"
          onClick={() => setActiveView('authorities')}
          className={activeView === 'authorities' ? 'ring-2 ring-emerald-600' : ''}
        />
      </div>

      {/* Main Administrative View Selection Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-slate-900 pb-3">
        {[
          { id: 'grievances', label: 'Grievance Registry', icon: FileText },
          { id: 'authorities', label: 'Institutional Authorities', icon: ShieldCheck },
          { id: 'routing', label: 'Responsibility Matrix', icon: Compass },
          { id: 'departments', label: 'Department Analytics', icon: Building },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'audit', label: 'Audit Trail', icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-sm font-mono text-xs font-black uppercase transition-all cursor-pointer border-2 border-slate-900 ${
                isActive
                  ? 'bg-slate-950 text-white shadow-[3px_3px_0px_#2563eb]'
                  : 'bg-white text-slate-800 hover:bg-slate-100 shadow-[2px_2px_0px_#000]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          VIEW 1: GRIEVANCE REGISTRY
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'grievances' && (
        <div className="space-y-4">
          <Card
            title="INSTITUTIONAL GRIEVANCE REGISTRY"
            subtitle="Central oversight across all academic, hostel, and infrastructural claims"
            tag="REGISTRY.01"
            action={
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter ticket, department..."
                  value={grievanceSearch}
                  onChange={(e) => setGrievanceSearch(e.target.value)}
                  className="px-3 py-1 text-xs bg-white border-2 border-slate-900 rounded-sm font-mono text-slate-900 w-56 shadow-[1.5px_1.5px_0px_#000]"
                />
              </div>
            }
            bodyClassName="p-0"
          >
            <DataTable
              columns={grievanceColumns}
              data={filteredComplaints}
              pageSize={8}
              onRowClick={(r) => navigate(`/grievance/${r.ticketId || r.grievance_code || r.id}`)}
            />
          </Card>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          VIEW 2: INSTITUTIONAL AUTHORITIES MANAGEMENT (NEW SECTION)
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'authorities' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 bg-white border-2 border-slate-900 rounded-sm shadow-[3px_3px_0px_#000] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search authority, designation, email..."
                  value={authoritySearch}
                  onChange={(e) => setAuthoritySearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-white border-2 border-slate-900 rounded-sm font-mono text-slate-900 shadow-[1.5px_1.5px_0px_#000] w-72"
                />
              </div>

              {/* Group Filter Tabs */}
              <div className="inline-flex rounded-sm border-2 border-slate-900 bg-slate-100 p-0.5">
                {[
                  { id: 'ALL', label: 'All Tiers' },
                  { id: 'leadership', label: 'Leadership' },
                  { id: 'academic', label: 'Academic & Student' },
                  { id: 'hod', label: 'Dept Heads' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setAuthorityGroupFilter(f.id)}
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-xs cursor-pointer ${
                      authorityGroupFilter === f.id
                        ? 'bg-slate-950 text-white'
                        : 'text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="manga"
              size="sm"
              onClick={() => openEditAuthority(null)}
              icon={PlusCircle}
              className="font-mono text-xs"
            >
              Enrol Authority
            </Button>
          </div>

          {/* Section 1: Institution Leadership & Core Administration */}
          {(authorityGroupFilter === 'ALL' || authorityGroupFilter === 'leadership') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
                <span className="font-mono font-black text-xs bg-slate-900 text-white px-2 py-0.5 rounded-xs uppercase">
                  TIER 01
                </span>
                <h3 className="font-mono font-black text-sm text-slate-950 uppercase">
                  Institution Leadership & Core Administration ({categorizedAuthorities.leadership.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorizedAuthorities.leadership.map(auth => renderAuthorityCard(auth))}
              </div>
            </div>
          )}

          {/* Section 2: Academic & Student Responsibilities */}
          {(authorityGroupFilter === 'ALL' || authorityGroupFilter === 'academic') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
                <span className="font-mono font-black text-xs bg-blue-600 text-white px-2 py-0.5 rounded-xs uppercase">
                  TIER 02
                </span>
                <h3 className="font-mono font-black text-sm text-slate-950 uppercase">
                  Academic & Student Responsibilities ({categorizedAuthorities.academic.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorizedAuthorities.academic.map(auth => renderAuthorityCard(auth))}
              </div>
            </div>
          )}

          {/* Section 3: Departmental Heads */}
          {(authorityGroupFilter === 'ALL' || authorityGroupFilter === 'hod') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
                <span className="font-mono font-black text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded-xs uppercase">
                  TIER 03
                </span>
                <h3 className="font-mono font-black text-sm text-slate-950 uppercase">
                  Departmental Heads ({categorizedAuthorities.hod.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorizedAuthorities.hod.map(auth => renderAuthorityCard(auth))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          VIEW 3: RESPONSIBILITY ROUTING SUMMARY & LAUNCHER
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'routing' && (
        <Card
          title="RESPONSIBILITY MAPPING ENGINE"
          subtitle="Active dispatch matrix linking categories to designated officers and escalation chains"
          tag="ENGINE"
          action={
            <Link to="/admin/responsibility-mappings">
              <Button variant="manga" size="sm" icon={ArrowRight} className="font-mono text-xs">
                Open Dedicated Engine UI
              </Button>
            </Link>
          }
        >
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border-2 border-slate-900 rounded-sm text-xs font-mono flex items-center justify-between">
              <div>
                <span className="font-black text-slate-900">Configured Categories: {categories.length}</span>
                <span className="text-slate-500 ml-2">• All grievances map deterministically to active authorities</span>
              </div>
              <Link to="/admin/responsibility-mappings" className="font-bold text-blue-700 hover:underline">
                Configure Mappings →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-900 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-900 font-mono font-black uppercase">
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Primary Officer</th>
                    <th className="px-4 py-3">Escalation Authority</th>
                    <th className="px-4 py-3">SLA</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {categories.slice(0, 10).map((cat, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-950">{cat.name}</td>
                      <td className="px-4 py-3 text-slate-600">{cat.department || 'Administration'}</td>
                      <td className="px-4 py-3 font-black text-blue-900">{cat.authority?.name || cat.sub_authority_name || 'Nodal Authority'}</td>
                      <td className="px-4 py-3 text-purple-900">{cat.escalation_authority?.name || 'Proctorial Board'}</td>
                      <td className="px-4 py-3 font-bold">{cat.sla_hours || 48}h</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-center">
              <Link to="/admin/responsibility-mappings">
                <Button variant="secondary" size="sm" className="font-mono text-xs">
                  View All {categories.length} Responsibility Mappings & Escalation Rules
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          VIEW 4: DEPARTMENT PERFORMANCE ANALYTICS
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'departments' && (
        <Card
          title="DEPARTMENT PERFORMANCE BREAKDOWN"
          subtitle="Speed of redressal and SLA metrics categorized by administrative bodies"
          tag="ANALYTICS"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-900 font-mono font-black uppercase text-slate-900">
                  <th className="px-4 py-3">Department / Administrative Section</th>
                  <th className="px-4 py-3">Total Routed</th>
                  <th className="px-4 py-3">Certified Resolved</th>
                  <th className="px-4 py-3">Pending Action</th>
                  <th className="px-4 py-3">Resolution Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200">
                {authorities.slice(0, 10).map((auth, i) => {
                  const total = auth.assigned_grievances_count || 1;
                  const resolved = Math.floor(total * 0.75);
                  const pending = total - resolved;
                  const rate = Math.round((resolved / total) * 100);

                  return (
                    <tr key={i} className="hover:bg-slate-50 font-mono">
                      <td className="px-4 py-3.5 font-bold text-slate-950">
                        {auth.name} — <span className="text-slate-500">{auth.department}</span>
                      </td>
                      <td className="px-4 py-3.5 font-bold">{total}</td>
                      <td className="px-4 py-3.5 text-emerald-700 font-black">{resolved}</td>
                      <td className="px-4 py-3.5 text-amber-700 font-black">{pending}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-28 bg-slate-200 border-2 border-slate-900 rounded-sm h-3 overflow-hidden shadow-[1px_1px_0px_#000]">
                            <div className="bg-blue-600 h-full" style={{ width: `${rate}%` }} />
                          </div>
                          <span className="text-xs font-black text-slate-900">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          VIEW 5: USER DIRECTORY
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'users' && (
        <Card
          title="INSTITUTIONAL USER DIRECTORY"
          subtitle="Active directory of students, faculty officers, and administrative users"
          tag="DIRECTORY"
          action={
            <input
              type="text"
              placeholder="Filter by name, email, role..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="px-3 py-1 text-xs bg-white border-2 border-slate-900 rounded-sm font-mono text-slate-900 w-64 shadow-[1.5px_1.5px_0px_#000]"
            />
          }
          bodyClassName="p-0"
        >
          <DataTable
            columns={userColumns}
            data={filteredUsers}
            pageSize={10}
          />
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          VIEW 6: AUDIT TRAIL STREAM
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'audit' && (
        <Card
          title="GOVERNANCE & ADMINISTRATIVE AUDIT TRAIL"
          subtitle="Tamper-evident system log tracking authority updates, responsibility changes, and escalations"
          tag="AUDIT.STREAM"
        >
          <div className="space-y-3 font-mono text-xs">
            {auditLogs.length === 0 ? (
              <p className="text-slate-500 italic p-4 text-center">No audit logs recorded yet in current session.</p>
            ) : (
              auditLogs.map((log, i) => (
                <div key={log.id || i} className="p-3 bg-slate-50 border-2 border-slate-900 rounded-sm shadow-[2px_2px_0px_#000] flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-950 uppercase">{log.action}</span>
                      <span className="text-[10px] text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-400">
                        {log.changed_by_name || 'Administrator'}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-[11px] text-slate-600 mt-1 font-medium">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: EDIT OR ENROL AUTHORITY
          ───────────────────────────────────────────────────────────────────────────── */}
      {authModalOpen && (
        <Modal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          title={editingAuth ? `EDIT AUTHORITY: ${editingAuth.name}` : 'ENROL INSTITUTIONAL AUTHORITY'}
          subtitle="Configure authority profile, tier category, official email contacts, and responsibilities"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSaveAuthority} className="space-y-4">
            {authError && (
              <ErrorMessage variant="error" message={authError} />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-black uppercase text-slate-900 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="e.g. Dr. Rajindra Kumar Pandit"
                  required
                  className="w-full text-xs bg-white border-2 border-slate-900 rounded-sm p-2 font-mono text-slate-900 shadow-[2px_2px_0px_#000]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-black uppercase text-slate-900 mb-1">
                  Official Designation
                </label>
                <input
                  type="text"
                  value={authDesignation}
                  onChange={(e) => setAuthDesignation(e.target.value)}
                  placeholder="e.g. Vice Chancellor / Proctor"
                  required
                  className="w-full text-xs bg-white border-2 border-slate-900 rounded-sm p-2 font-mono text-slate-900 shadow-[2px_2px_0px_#000]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-black uppercase text-slate-900 mb-1">
                  Department / Administrative Cell
                </label>
                <input
                  type="text"
                  value={authDepartment}
                  onChange={(e) => setAuthDepartment(e.target.value)}
                  placeholder="e.g. Office of the Registrar"
                  required
                  className="w-full text-xs bg-white border-2 border-slate-900 rounded-sm p-2 font-mono text-slate-900 shadow-[2px_2px_0px_#000]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-black uppercase text-slate-900 mb-1">
                  Institutional Category Group
                </label>
                <select
                  value={authGroup}
                  onChange={(e) => setAuthGroup(e.target.value)}
                  className="w-full text-xs bg-white border-2 border-slate-900 rounded-sm p-2 font-mono text-slate-900 shadow-[2px_2px_0px_#000]"
                >
                  <option value="leadership">Institution Leadership & Core Administration</option>
                  <option value="academic_student">Academic & Student Responsibilities</option>
                  <option value="department_head">Departmental Heads</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-900 mb-1">
                Official Email Addresses (Comma-separated for multiple, or leave empty if contact through portal)
              </label>
              <input
                type="text"
                value={authEmails}
                onChange={(e) => setAuthEmails(e.target.value)}
                placeholder="e.g. proctor@mitsgwalior.in, rsjadon@mitsgwalior.in"
                className="w-full text-xs bg-white border-2 border-slate-900 rounded-sm p-2 font-mono text-slate-900 shadow-[2px_2px_0px_#000]"
              />
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                Supports multiple email addresses. If no email is available, students will be instructed to contact via the departmental portal.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-900 mb-1">
                Assigned Responsibilities & Scope
              </label>
              <textarea
                value={authResponsibilities}
                onChange={(e) => setAuthResponsibilities(e.target.value)}
                placeholder="e.g. Chairperson Anti-Ragging Committee, Campus Safety, Hostel Inspections..."
                rows={2}
                className="w-full text-xs bg-white border-2 border-slate-900 rounded-sm p-2 font-mono text-slate-900 shadow-[2px_2px_0px_#000]"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer font-mono text-xs font-bold">
                <input
                  type="checkbox"
                  checked={authStatus === 'active'}
                  onChange={(e) => setAuthStatus(e.target.checked ? 'active' : 'inactive')}
                  className="w-4 h-4 rounded-xs border-2 border-slate-900"
                />
                <span>Active Status (Available for Grievance Allotment)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t-2 border-slate-900">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAuthModalOpen(false)}
                className="font-mono text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={savingAuth}
                className="font-mono text-xs"
              >
                {editingAuth ? 'Save Authority Changes' : 'Register Authority'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: REASSIGN GRIEVANCE
          ───────────────────────────────────────────────────────────────────────────── */}
      {reassignModalOpen && targetGrievance && (
        <Modal
          isOpen={reassignModalOpen}
          onClose={() => setReassignModalOpen(false)}
          title={`REASSIGN GRIEVANCE #${targetGrievance.ticketId || targetGrievance.id}`}
          subtitle="Dispatch this case to a different departmental authority or designated officer"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleReassignSubmit} className="space-y-4">
            <div>
              <p className="text-xs font-mono font-bold text-slate-600 mb-1">Case Subject:</p>
              <p className="text-xs font-mono font-black text-slate-900 p-2 bg-slate-100 border border-slate-900 rounded-xs">
                {targetGrievance.title}
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-900 mb-1">
                Target Designated Authority
              </label>
              <select
                value={selectedAuthorityId}
                onChange={(e) => setSelectedAuthorityId(e.target.value)}
                required
                className="w-full text-xs bg-white border-2 border-slate-900 rounded-sm p-2 font-mono text-slate-900 shadow-[2px_2px_0px_#000]"
              >
                <option value="">-- Select Authority Officer --</option>
                {authorities.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {a.designation} ({a.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-900 mb-1">
                Administrative Reassignment Order Note
              </label>
              <textarea
                value={reassignRemarks}
                onChange={(e) => setReassignRemarks(e.target.value)}
                placeholder="Reason for reassignment or jurisdictional transfer..."
                rows={2}
                className="w-full text-xs bg-white border-2 border-slate-900 rounded-sm p-2 font-mono text-slate-900 shadow-[2px_2px_0px_#000]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t-2 border-slate-900">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setReassignModalOpen(false)}
                className="font-mono text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={submittingReassign}
                className="font-mono text-xs"
              >
                Confirm Reassignment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}

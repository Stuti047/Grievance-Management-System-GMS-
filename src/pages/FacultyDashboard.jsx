import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../api';
import {
  Inbox,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  ArrowUpRight,
  Send,
  FileText,
  Paperclip,
  ShieldCheck,
  RefreshCw,
  Building,
  UserCheck,
  Calendar,
  Layers
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import DataTable from '../components/common/DataTable';
import StatusBadge, { PriorityBadge } from '../components/common/Badge';
import Modal from '../components/common/Modal';
import StatusTimeline from '../components/dashboard/StatusTimeline';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';

export default function FacultyDashboard() {
  const { currentUser, grievanceList, fetchGrievances, addToast } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [localGrievances, setLocalGrievances] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Inspection drawer / modal for grievance review
  const [inspectGrievance, setInspectGrievance] = useState(null);

  // Status transition state
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionStatus, setActionStatus] = useState('In progress');
  const [actionNote, setActionNote] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState('');

  // Comment state inside drawer
  const [drawerComment, setDrawerComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Load grievances for this authority
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.grievances.list({
        sub_authority_id: currentUser?.authority_profile?.id,
        limit: 100
      });
      if (res.grievances && res.grievances.length > 0) {
        setLocalGrievances(res.grievances);
      } else if (grievanceList && grievanceList.length > 0) {
        setLocalGrievances(grievanceList);
      }
    } catch (err) {
      console.warn('Using cached context grievances:', err);
      if (grievanceList) setLocalGrievances(grievanceList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Unique categories for filter dropdown
  const categoryOptions = useMemo(() => {
    const set = new Set();
    localGrievances.forEach(g => {
      const c = g.category_name || g.category;
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [localGrievances]);

  // Filtered grievances list
  const filteredGrievances = useMemo(() => {
    return localGrievances.filter(g => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || (
        (g.ticketId || g.grievance_code || g.id || '').toLowerCase().includes(q) ||
        (g.title || '').toLowerCase().includes(q) ||
        (g.department || '').toLowerCase().includes(q) ||
        (g.category || g.category_name || '').toLowerCase().includes(q) ||
        (g.submittedBy?.name || '').toLowerCase().includes(q)
      );

      // Status
      const status = (g.status || '').toLowerCase();
      let matchStatus = true;
      if (statusFilter === 'PENDING') {
        matchStatus = status.includes('review') || status.includes('submitted');
      } else if (statusFilter === 'IN_PROGRESS') {
        matchStatus = status.includes('progress') || status.includes('assigned');
      } else if (statusFilter === 'RESOLVED') {
        matchStatus = status.includes('resolved') || status.includes('closed');
      } else if (statusFilter === 'ESCALATED') {
        matchStatus = status.includes('escalated');
      }

      // Priority
      const p = (g.priority || '').toUpperCase();
      const matchPriority = priorityFilter === 'ALL' || p === priorityFilter;

      // Category
      const c = g.category_name || g.category;
      const matchCategory = categoryFilter === 'ALL' || c === categoryFilter;

      return matchSearch && matchStatus && matchPriority && matchCategory;
    });
  }, [localGrievances, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = localGrievances.length;
    const pending = localGrievances.filter(g => {
      const s = (g.status || '').toLowerCase();
      return s.includes('review') || s.includes('submitted');
    }).length;
    const inProgress = localGrievances.filter(g => {
      const s = (g.status || '').toLowerCase();
      return s.includes('progress') || s.includes('assigned');
    }).length;
    const resolved = localGrievances.filter(g => {
      const s = (g.status || '').toLowerCase();
      return s.includes('resolved') || s.includes('closed');
    }).length;
    const escalated = localGrievances.filter(g => {
      const s = (g.status || '').toLowerCase();
      return s.includes('escalated');
    }).length;

    return { total, pending, inProgress, resolved, escalated };
  }, [localGrievances]);

  // Open action update modal
  const openActionModal = (grievance, escalate = false) => {
    setInspectGrievance(grievance);
    setIsEscalating(escalate);
    setActionStatus(escalate ? 'Escalated' : (grievance.status === 'Submitted' ? 'Under review' : 'In progress'));
    setActionNote('');
    setActionError('');
    setActionModalOpen(true);
  };

  // Submit status update / escalation
  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!inspectGrievance) return;
    setSubmittingAction(true);
    setActionError('');

    try {
      const res = await api.grievances.updateStatus(inspectGrievance.id, actionStatus, actionNote);
      if (res.error) {
        setActionError(res.error);
        setSubmittingAction(false);
        return;
      }

      // Update local state
      setLocalGrievances(prev => prev.map(g => {
        if (g.id === inspectGrievance.id) {
          const updated = {
            ...g,
            status: actionStatus,
            history: [
              ...(g.history || []),
              {
                id: `hist_${Date.now()}`,
                new_status: actionStatus,
                remarks: actionNote || `Updated status to ${actionStatus}`,
                created_at: new Date().toISOString(),
                updater: { name: currentUser?.name || 'Authority', role: 'authority' }
              }
            ]
          };
          setInspectGrievance(updated);
          return updated;
        }
        return g;
      }));

      setActionModalOpen(false);
      addToast(
        isEscalating ? 'Grievance Escalated' : 'Status Updated',
        `Case #${inspectGrievance.ticketId || inspectGrievance.id} transitioned to "${actionStatus}".`,
        'success'
      );
    } catch (err) {
      setActionError(err.message || 'Action update failed');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Add clarification comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!drawerComment.trim() || !inspectGrievance) return;
    setSubmittingComment(true);

    try {
      const res = await api.grievances.addComment(inspectGrievance.id, drawerComment.trim(), false);
      if (res.comment) {
        setInspectGrievance(prev => ({
          ...prev,
          comments: [...(prev.comments || []), res.comment]
        }));
        setDrawerComment('');
        addToast('Clarification Posted', 'Note appended to official case communications log.', 'success');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const columns = [
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
      header: 'Subject & Jurisdiction',
      key: 'title',
      render: (_, r) => (
        <div className="max-w-md">
          <p className="font-black text-slate-950 truncate tracking-tight">{r.title}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
            <span className="font-bold text-slate-800">{r.category || r.category_name}</span>
            <span>•</span>
            <span>{r.department || 'MITS Campus'}</span>
          </div>
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
      header: 'Complainant',
      key: 'submittedBy',
      render: (_, r) => (
        <div className="text-xs font-mono">
          {r.isAnonymous ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-300">
              <ShieldCheck className="w-3 h-3 text-purple-700" />
              ANONYMOUS
            </span>
          ) : (
            <div>
              <p className="font-black text-slate-900">{r.submittedBy?.name || 'Student'}</p>
              <p className="text-[10px] text-slate-500">{r.submittedBy?.department || 'Department'}</p>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      sortable: false,
      render: (_, r) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setInspectGrievance(r);
            }}
            className="inline-flex items-center gap-1 text-xs font-mono font-bold bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 px-2.5 py-1 rounded-sm shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
          >
            <Eye className="w-3 h-3" />
            <span>Dossier</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openActionModal(r, false);
            }}
            className="inline-flex items-center gap-1 text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-slate-900 px-2.5 py-1 rounded-sm shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
          >
            <span>Update</span>
          </button>
          {r.status !== 'Escalated' && r.status !== 'Resolved' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openActionModal(r, true);
              }}
              title="Escalate to Proctorial Board or Oversight Committee"
              className="inline-flex items-center gap-1 text-xs font-mono font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-slate-900 px-2 py-1 rounded-sm shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
            >
              <ArrowUpRight className="w-3 h-3 text-rose-700" />
              <span>Escalate</span>
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <DashboardLayout
      title="FACULTY & WARDEN REDRESSAL DESK"
      subtitle={`Welcome, ${currentUser?.name || 'Faculty Member'} • ${currentUser?.department || 'Department Administration'}`}
      chapter="AUTHORITY CONSOLE"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            icon={RefreshCw}
            className="font-mono text-xs"
          >
            Refresh
          </Button>
          <Link to="/track">
            <Button variant="manga" size="sm" className="font-mono text-xs">
              Search All Tickets
            </Button>
          </Link>
        </div>
      }
    >
      {/* Editorial Banner */}
      <div className="manga-bubble p-3.5 bg-blue-50 text-xs font-bold text-slate-900 flex flex-wrap items-center justify-between gap-3 shadow-[3px_3px_0px_#000] border-2 border-slate-900">
        <div className="flex items-center gap-2.5">
          <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Designated Nodal Authority: Grievances routed based on MITS Institutional Category & Responsibility Mapping.
          </span>
        </div>
        <span className="text-[10px] font-mono font-black bg-blue-200 text-blue-950 px-2 py-0.5 border border-slate-900 uppercase">
          OFFICIAL MANDATE: 24–48 HR SLA
        </span>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Queue"
          value={stats.total}
          subtitle="Grievances alloted to your jurisdiction"
          icon={Inbox}
          badgeText="ALLOTTED"
          watermark="QUEUE"
          onClick={() => setStatusFilter('ALL')}
          className={statusFilter === 'ALL' ? 'ring-2 ring-blue-600' : ''}
        />
        <StatCard
          title="Under Review"
          value={stats.pending}
          subtitle="Requiring immediate initial inspection"
          icon={Clock}
          badgeText="INSPECT"
          badgeVariant="amber"
          watermark="REVIEW"
          onClick={() => setStatusFilter('PENDING')}
          className={statusFilter === 'PENDING' ? 'ring-2 ring-amber-500' : ''}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          subtitle="Active remediation & field repair"
          icon={TrendingUp}
          badgeText="ACTIVE"
          badgeVariant="blue"
          watermark="ACTIVE"
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={statusFilter === 'IN_PROGRESS' ? 'ring-2 ring-blue-500' : ''}
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          subtitle="Formally redressed & certified"
          icon={CheckCircle2}
          badgeText="CERTIFIED"
          badgeVariant="emerald"
          watermark="SOLVED"
          onClick={() => setStatusFilter('RESOLVED')}
          className={statusFilter === 'RESOLVED' ? 'ring-2 ring-emerald-500' : ''}
        />
      </div>

      {/* Main Table Card */}
      <Card
        title="JURISDICTION GRIEVANCE REGISTRY"
        subtitle="Live roster of complaints mapped to your designated faculty office"
        tag="REGISTRY"
        bodyClassName="p-0"
      >
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b-2 border-slate-900 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search ticket, student, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-white border-2 border-slate-900 rounded-sm font-mono text-slate-900 shadow-[2px_2px_0px_#000] w-64 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Status Quick Filter Tabs */}
            <div className="inline-flex items-center rounded-sm border-2 border-slate-900 bg-white p-0.5 shadow-[2px_2px_0px_#000]">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'PENDING', label: 'Review' },
                { id: 'IN_PROGRESS', label: 'Active' },
                { id: 'RESOLVED', label: 'Resolved' },
                { id: 'ESCALATED', label: 'Escalated' }
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

          <div className="flex flex-wrap items-center gap-2">
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs bg-white border-2 border-slate-900 rounded-sm px-2 py-1.5 font-mono text-slate-900 shadow-[2px_2px_0px_#000]"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-white border-2 border-slate-900 rounded-sm px-2 py-1.5 font-mono text-slate-900 shadow-[2px_2px_0px_#000] max-w-[200px]"
            >
              <option value="ALL">All Categories</option>
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <LoadingState message="Connecting to grievance registry..." />
        ) : filteredGrievances.length === 0 ? (
          <EmptyState
            title="No matching grievances found"
            description="Your assigned queue has no pending items matching the current filter criteria."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setPriorityFilter('ALL');
              setCategoryFilter('ALL');
            }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredGrievances}
            pageSize={8}
            onRowClick={(row) => setInspectGrievance(row)}
          />
        )}
      </Card>

      {/* ─────────────────────────────────────────────────────────────────────────────
          FULL GRIEVANCE DOSSIER MODAL / INSPECTION DRAWER
          ───────────────────────────────────────────────────────────────────────────── */}
      {inspectGrievance && (
        <Modal
          isOpen={Boolean(inspectGrievance)}
          onClose={() => setInspectGrievance(null)}
          title={`CASE DOSSIER #${inspectGrievance.ticketId || inspectGrievance.id}`}
          subtitle={`${inspectGrievance.category || 'General Grievance'} • Submitted ${new Date(inspectGrievance.created_at || Date.now()).toLocaleDateString()}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6">
            {/* Key Dossier Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border-2 border-slate-900 rounded-sm">
              <div className="flex items-center gap-3">
                <StatusBadge status={inspectGrievance.status} />
                <PriorityBadge priority={inspectGrievance.priority} />
                <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 border border-slate-900 rounded-xs">
                  SLA: {inspectGrievance.sla_hours || 48} Hours
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="manga"
                  size="sm"
                  onClick={() => openActionModal(inspectGrievance, false)}
                  className="font-mono text-xs"
                >
                  Update Stage
                </Button>
                {inspectGrievance.status !== 'Escalated' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => openActionModal(inspectGrievance, true)}
                    className="font-mono text-xs"
                  >
                    Escalate Case
                  </Button>
                )}
                <Link to={`/grievance/${inspectGrievance.ticketId || inspectGrievance.id}`}>
                  <Button variant="secondary" size="sm" icon={Eye} className="font-mono text-xs">
                    Full Page View
                  </Button>
                </Link>
              </div>
            </div>

            {/* Case Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-white border-2 border-slate-900 rounded-sm shadow-[2px_2px_0px_#000]">
                <p className="text-[10px] uppercase font-bold text-slate-400">Complainant Information</p>
                {inspectGrievance.isAnonymous ? (
                  <p className="font-bold text-purple-700 mt-1">Protected under Anonymous Mode (Identity Masked)</p>
                ) : (
                  <div className="mt-1 space-y-0.5">
                    <p className="font-black text-slate-900 text-sm">{inspectGrievance.submittedBy?.name || 'Student'}</p>
                    <p className="text-slate-600">Email: {inspectGrievance.submittedBy?.email || 'N/A'}</p>
                    <p className="text-slate-600">Department: {inspectGrievance.submittedBy?.department || 'N/A'}</p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-white border-2 border-slate-900 rounded-sm shadow-[2px_2px_0px_#000]">
                <p className="text-[10px] uppercase font-bold text-slate-400">Jurisdiction & Location</p>
                <div className="mt-1 space-y-0.5">
                  <p className="font-black text-slate-900 text-sm">{inspectGrievance.department || 'MITS Campus'}</p>
                  <p className="text-slate-600">Site: {inspectGrievance.location || 'MITS Campus'}</p>
                  <p className="text-slate-600">Category: {inspectGrievance.category || 'General'}</p>
                </div>
              </div>
            </div>

            {/* Grievance Statement */}
            <div className="p-4 bg-slate-50 border-2 border-slate-900 rounded-sm shadow-[2px_2px_0px_#000]">
              <p className="text-xs uppercase font-mono font-black text-slate-900 mb-2">// Statement of Grievance</p>
              <h4 className="text-sm font-black text-slate-950 mb-2">{inspectGrievance.title}</h4>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                {inspectGrievance.description}
              </p>
            </div>

            {/* Attachments / Evidence Section */}
            {inspectGrievance.evidence_urls && inspectGrievance.evidence_urls.length > 0 && (
              <div className="p-4 bg-white border-2 border-slate-900 rounded-sm shadow-[2px_2px_0px_#000]">
                <p className="text-xs uppercase font-mono font-black text-slate-900 mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                  <span>Student Evidence & Verification Attachments ({inspectGrievance.evidence_urls.length})</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {inspectGrievance.evidence_urls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-900 border border-slate-900 rounded-xs text-xs font-mono font-bold"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Attachment #{i + 1}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* FSM Progression Timeline */}
            <div className="p-4 bg-white border-2 border-slate-900 rounded-sm shadow-[2px_2px_0px_#000]">
              <p className="text-xs uppercase font-mono font-black text-slate-900 mb-3">// Progression Audit Timeline</p>
              <StatusTimeline
                currentStatus={inspectGrievance.status}
                history={inspectGrievance.history || []}
              />
            </div>

            {/* Official Communications Log */}
            <div className="p-4 bg-slate-50 border-2 border-slate-900 rounded-sm shadow-[2px_2px_0px_#000] space-y-3">
              <p className="text-xs uppercase font-mono font-black text-slate-900">// Communications Thread</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(!inspectGrievance.comments || inspectGrievance.comments.length === 0) ? (
                  <p className="text-xs text-slate-500 font-mono italic">No comments or notes posted yet on this case.</p>
                ) : (
                  inspectGrievance.comments.map((c, i) => (
                    <div key={c.id || i} className="p-2.5 bg-white border border-slate-900 rounded-xs text-xs">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                        <span className="font-bold text-slate-900">{c.author?.name || c.author_name || 'Authority'}</span>
                        <span>{c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Recent'}</span>
                      </div>
                      <p className="text-slate-800 font-medium">{c.comment || c.text || c.comment_text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-slate-300">
                <input
                  type="text"
                  placeholder="Post an official clarification or inquiry note..."
                  value={drawerComment}
                  onChange={(e) => setDrawerComment(e.target.value)}
                  className="flex-1 text-xs bg-white border border-slate-900 rounded-xs px-3 py-2 font-mono text-slate-900"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={submittingComment}
                  icon={Send}
                  className="font-mono text-xs"
                >
                  Send
                </Button>
              </form>
            </div>
          </div>
        </Modal>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          ACTION / UPDATE MODAL
          ───────────────────────────────────────────────────────────────────────────── */}
      {actionModalOpen && inspectGrievance && (
        <Modal
          isOpen={actionModalOpen}
          onClose={() => setActionModalOpen(false)}
          title={isEscalating ? `ESCALATE GRIEVANCE #${inspectGrievance.ticketId || inspectGrievance.id}` : `TRANSITION STAGE #${inspectGrievance.ticketId || inspectGrievance.id}`}
          subtitle="Record formal progress and append official inspection note into audit trail"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleActionSubmit} className="space-y-4">
            {actionError && (
              <ErrorMessage variant="error" message={actionError} />
            )}

            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-900 mb-1">
                Target Progression State
              </label>
              {isEscalating ? (
                <div className="p-2.5 bg-rose-50 border-2 border-rose-500 text-rose-950 font-mono text-xs font-bold rounded-sm">
                  ⚠️ Escalating will route this case to the Designated Escalation Authority (Proctorial Board / Directorate) and log a high-priority SLA intervention.
                </div>
              ) : (
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value)}
                  className="w-full text-xs bg-white border-2 border-slate-900 rounded-sm p-2 text-slate-900 font-mono shadow-[2px_2px_0px_#000]"
                >
                  <option value="Under review">Under Review (Initial Inspection)</option>
                  <option value="Assigned">Assigned to Field Staff</option>
                  <option value="In progress">In Progress (Active Remediation)</option>
                  <option value="Resolved">Resolved & Certified</option>
                  <option value="Escalated">Escalate to Proctorial Board</option>
                  <option value="Rejected">Reject (Requires detailed justification)</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-900 mb-1">
                Administrative Remarks / Action Certificate
              </label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Document on-site verification, vendor procurement, corrective action, or escalation reason..."
                rows={3}
                required
                className="w-full text-xs bg-white border-2 border-slate-900 rounded-sm p-2 text-slate-900 font-mono shadow-[2px_2px_0px_#000] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t-2 border-slate-900">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActionModalOpen(false)}
                className="font-mono text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={isEscalating ? 'danger' : 'primary'}
                size="sm"
                loading={submittingAction}
                className="font-mono text-xs"
              >
                {isEscalating ? 'Confirm Escalation' : 'Confirm Stage Update'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  FileText,
  Send,
  Paperclip,
  Shield,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge, { PriorityBadge, RoleBadge } from '../components/common/Badge';
import StatusTimeline from '../components/dashboard/StatusTimeline';
import FormTextarea from '../components/forms/FormTextarea';
import ErrorMessage from '../components/common/ErrorMessage';
import { SEED_COMPLAINTS } from '../data/demoData';

export default function GrievanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, grievanceList, addComment, updateStatus } = useApp();

  const grievance = useMemo(() => {
    const list = (grievanceList && grievanceList.length > 0) ? grievanceList : SEED_COMPLAINTS;
    return list.find(g =>
      (g.ticketId && g.ticketId.toLowerCase() === id?.toLowerCase()) ||
      (g.grievance_code && g.grievance_code.toLowerCase() === id?.toLowerCase()) ||
      (g.ticket_number && g.ticket_number.toLowerCase() === id?.toLowerCase()) ||
      g.id === id
    ) || list[0];
  }, [id, grievanceList]);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(grievance?.comments || []);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Status update state for Faculty / Admin
  const [statusActionOpen, setStatusActionOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(grievance?.status || 'In progress');
  const [statusNote, setStatusNote] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  const canUpdateStatus = currentUser?.role === 'admin' || currentUser?.role === 'authority';

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      if (addComment && grievance?.id) {
        await addComment(grievance.id, commentText.trim());
      }
      const newEntry = {
        id: 'cmt_' + Date.now(),
        comment: commentText.trim(),
        author: {
          name: currentUser?.name || 'Authorized Member',
          role: currentUser?.role || 'student'
        },
        author_name: currentUser?.name || 'Authorized Member',
        author_role: currentUser?.role || 'student',
        createdAt: new Date().toISOString()
      };
      setComments(prev => [...prev, newEntry]);
      setCommentText('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setStatusUpdating(true);
    try {
      if (updateStatus && grievance?.id) {
        await updateStatus(grievance.id, newStatus, statusNote);
      }
      grievance.status = newStatus;
      setStatusActionOpen(false);
      setStatusNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setStatusUpdating(false);
    }
  };

  if (!grievance) {
    return (
      <DashboardLayout title="Case File Not Found">
        <div className="text-center py-12">
          <p className="text-slate-600 text-sm font-mono">Grievance record could not be extracted from the ledger.</p>
          <Button variant="secondary" size="sm" onClick={() => navigate('/track')} className="mt-4 font-mono">
            Back to Registry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const code = grievance.ticketId || grievance.grievance_code || grievance.ticket_number || grievance.id;
  const author = grievance.submittedBy || { name: 'Student', department: 'MITS' };
  const assigned = grievance.assignedTo || { name: 'Dean Student Welfare / Proctor Office', department: 'Central Proctorial Board' };

  return (
    <DashboardLayout
      title={`CASE DOSSIER // #${code}`}
      subtitle="Complete case facts, finite-state audit trail, and communications log"
      chapter="DOSSIER.04"
      breadcrumbs={[
        { label: 'Registry', href: '/track' },
        { label: `#${code}` }
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            icon={ArrowLeft}
            className="font-mono text-xs"
          >
            Back
          </Button>
          {canUpdateStatus && (
            <Button
              variant="manga"
              size="sm"
              onClick={() => setStatusActionOpen(!statusActionOpen)}
              className="font-mono text-xs"
            >
              Transition Status
            </Button>
          )}
        </div>
      }
    >
      {/* Top Banner if updating status (Authority View) */}
      {statusActionOpen && (
        <Card
          title="OFFICIAL STATUS TRANSITION"
          subtitle="Record formal progress and append official inspection note"
          tag="AUTH.CONTROL"
          className="border-blue-600 bg-blue-50/40 mb-6"
        >
          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900 font-mono mb-1">
                  Target Progression State:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-sm bg-white border-2 border-slate-900 rounded-sm p-2 text-slate-900 font-mono shadow-[2px_2px_0px_#000]"
                >
                  <option value="Under review">Under Review</option>
                  <option value="Assigned">Assigned to Department</option>
                  <option value="In progress">In Progress / Remediating</option>
                  <option value="Resolved">Resolved & Certified</option>
                  <option value="Escalated">Escalate to Proctorial Board</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900 font-mono mb-1">
                  Administrative Note:
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Field inspection completed, vendor replacement ordered..."
                  className="w-full text-sm bg-white border-2 border-slate-900 rounded-sm p-2 text-slate-900 font-mono shadow-[2px_2px_0px_#000]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t-2 border-slate-900">
              <Button variant="secondary" size="sm" onClick={() => setStatusActionOpen(false)} className="font-mono text-xs">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={statusUpdating} className="font-mono text-xs">
                Confirm Update
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Main Grid: Details (Left - 8 cols) + Timeline & Authority (Right - 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          <Card tag="FACTS.01">
            {/* Header badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-slate-200">
              <div className="flex items-center gap-2">
                <StatusBadge status={grievance.status} />
                <PriorityBadge priority={grievance.priority} />
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                DATE: {new Date(grievance.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>

            {/* Title & Description */}
            <div className="py-4 space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-slate-950 font-mono tracking-tight leading-snug">
                {grievance.title}
              </h2>
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 border-2 border-slate-900 rounded-sm p-4 font-medium shadow-[2px_2px_0px_#000]">
                {grievance.description}
              </div>
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t-2 border-slate-200 text-xs font-mono">
              <div>
                <p className="text-slate-400 font-black uppercase text-[10px]">CATEGORY</p>
                <p className="font-black text-slate-900 mt-0.5">{grievance.category || 'General'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-black uppercase text-[10px]">DEPARTMENT</p>
                <p className="font-black text-slate-900 mt-0.5">{grievance.department}</p>
              </div>
              <div>
                <p className="text-slate-400 font-black uppercase text-[10px]">LOCATION</p>
                <p className="font-black text-slate-900 mt-0.5">{grievance.location || 'MITS Campus'}</p>
              </div>
            </div>

            {/* Attachments Section */}
            <div className="pt-4 border-t-2 border-slate-200 mt-4">
              <p className="text-xs font-black uppercase font-mono text-slate-800 mb-2 flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-blue-600" />
                <span>EXHIBITS & SUPPORTING ARTIFACTS</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 bg-slate-50 border-2 border-slate-900 rounded-sm text-xs font-mono font-bold text-slate-900 flex items-center gap-2 shadow-[1.5px_1.5px_0px_#000]">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>evidence_photo_01.jpg</span>
                  <span className="text-[10px] text-slate-500">(412 KB)</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Comments & Communication Section */}
          <Card
            title="COMMUNICATION DISPATCH"
            subtitle="Official exchanges between student and designated authority"
            tag="LOG.DIALOGUE"
          >
            {/* Comments List */}
            <div className="space-y-4 mb-6">
              {comments.length === 0 ? (
                <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded text-center text-xs text-slate-500 font-mono">
                  No public inquiries posted yet on this case.
                </div>
              ) : (
                comments.map((c, i) => (
                  <div key={c.id || i} className="p-3.5 rounded-sm bg-slate-50 border-2 border-slate-900 text-xs space-y-1.5 shadow-[2px_2px_0px_#000]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-950 font-mono">
                          {c.author?.name || c.author_name || 'Authority'}
                        </span>
                        <RoleBadge role={c.author?.role || c.author_role || 'authority'} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed">{c.comment || c.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Box */}
            <form onSubmit={handleAddComment} className="pt-4 border-t-2 border-slate-900 space-y-3">
              {commentSuccess && (
                <ErrorMessage variant="success" message="Clarification entered into case file." />
              )}
              <FormTextarea
                placeholder="Post an official query, status check, or evidence update..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                required
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={submittingComment}
                  icon={Send}
                  className="font-mono text-xs"
                >
                  Send Clarification
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Timeline & Authority */}
        <div className="lg:col-span-4 space-y-6">
          {/* Progression Timeline Card */}
          <Card
            title="LIFECYCLE PROGRESS"
            subtitle="Finite State Machine Audit Stages"
            tag="TIMELINE"
          >
            <StatusTimeline
              currentStatus={grievance.status}
              history={grievance.history || []}
            />
          </Card>

          {/* Assigned Authority Card */}
          <Card title="HANDLING AUTHORITY" tag="AUTH">
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-sm bg-blue-600 border-2 border-slate-900 text-white font-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000] text-sm font-mono">
                  {assigned.name ? assigned.name.charAt(0) : 'A'}
                </div>
                <div>
                  <p className="font-black text-slate-950 font-mono">{assigned.name}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{assigned.designation || 'Nodal Officer'}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-sm border-2 border-slate-900 text-[11px] space-y-1 font-mono shadow-[1.5px_1.5px_0px_#000]">
                <p className="text-slate-600">Department: <span className="font-bold text-slate-900">{assigned.department || grievance.department}</span></p>
                <p className="text-slate-600">Discipline: <span className="font-bold text-slate-900">MITS Academic Body</span></p>
              </div>
            </div>
          </Card>

          {/* Complainant Identity */}
          <Card title="APPLICANT" tag="APPL">
            {grievance.isAnonymous ? (
              <div className="p-3.5 bg-amber-100 border-2 border-slate-900 rounded-sm text-xs text-amber-950 flex items-center gap-2 font-bold shadow-[2px_2px_0px_#000]">
                <Shield className="w-4 h-4 text-amber-800 shrink-0" />
                <span>Protected under Anonymous Mode. Student identity masked.</span>
              </div>
            ) : (
              <div className="space-y-1 text-xs font-mono">
                <p className="font-black text-slate-950 text-sm">{author.name || 'Student'}</p>
                <p className="text-slate-600">Department: {author.department || 'MITS'}</p>
                {author.enrollmentNo && <p className="text-slate-600">Enrollment: {author.enrollmentNo}</p>}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

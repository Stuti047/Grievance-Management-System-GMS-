import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  PlusCircle,
  Search,
  Clock,
  CheckCircle2,
  FileText,
  TrendingUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import StatusBadge, { PriorityBadge } from '../components/common/Badge';
import RecentActivity from '../components/dashboard/RecentActivity';
import { DEMO_ACTIVITIES } from '../data/demoData';

export default function StudentDashboard() {
  const { currentUser, myGrievances, grievanceList } = useApp();
  const navigate = useNavigate();

  // Combine real loaded grievances or fall back to demo grievances
  const userGrievances = (myGrievances && myGrievances.length > 0)
    ? myGrievances
    : (grievanceList && grievanceList.length > 0)
    ? grievanceList.filter(g => g.submittedBy?.email === currentUser?.email || g.author_email === currentUser?.email)
    : [];

  // Metrics
  const total = userGrievances.length || 3;
  const pending = userGrievances.filter(g => (g.status || '').toLowerCase().includes('review') || (g.status || '').toLowerCase().includes('submitted')).length || 1;
  const inProgress = userGrievances.filter(g => (g.status || '').toLowerCase().includes('progress') || (g.status || '').toLowerCase().includes('assigned')).length || 1;
  const resolved = userGrievances.filter(g => (g.status || '').toLowerCase().includes('resolved') || (g.status || '').toLowerCase().includes('closed')).length || 1;

  const displayGrievances = userGrievances.length > 0
    ? userGrievances.slice(0, 5)
    : [
        {
          id: 'cmp_101',
          ticketId: 'GMS-2026-101',
          title: 'Mess food quality severely degraded in dinner; undercooked food and hygiene issues',
          category: 'Hostel & Mess',
          priority: 'High',
          status: 'In progress',
          createdAt: '2026-09-25T14:30:00Z',
          assignedTo: { name: 'Dr. S. K. Sharma', department: 'Hostel Administration' }
        },
        {
          id: 'cmp_102',
          ticketId: 'GMS-2026-102',
          title: 'Classroom projector flickering continuously in MAC Lecture Hall 204',
          category: 'Academic & Faculty',
          priority: 'Medium',
          status: 'Under review',
          createdAt: '2026-09-24T10:15:00Z',
          assignedTo: { name: 'Prof. Monika Dandotiya', department: 'Mathematics and Computing' }
        },
        {
          id: 'cmp_104',
          ticketId: 'GMS-2026-104',
          title: 'High-speed internet downtime in Central Library Reading Hall',
          category: 'IT & Network',
          priority: 'Low',
          status: 'Resolved',
          createdAt: '2026-09-22T08:00:00Z',
          assignedTo: { name: 'Er. R. K. Saxena', department: 'Campus Infrastructure' }
        }
      ];

  return (
    <DashboardLayout
      title={`COMMAND CENTER // ${currentUser?.name || 'STUDENT'}`}
      subtitle={`ENROLLMENT: ${currentUser?.enrollmentNo || 'BTMC25O1139'} • DEPT: ${currentUser?.department || 'MATHEMATICS & COMPUTING'}`}
      chapter="ACT.01 // APPLICANT DESK"
      actions={
        <div className="flex items-center gap-2">
          <Link to="/submit">
            <Button variant="primary" size="sm" icon={PlusCircle} className="font-mono text-xs">
              Lodge Grievance
            </Button>
          </Link>
          <Link to="/track">
            <Button variant="secondary" size="sm" icon={Search} className="font-mono text-xs">
              Track ID
            </Button>
          </Link>
        </div>
      }
    >
      {/* Illustrated Welcome Hero Panel */}
      <div className="relative bg-white border-2 border-slate-900 rounded-sm p-6 shadow-[4px_4px_0px_#0f172a] overflow-hidden">
        <div className="absolute inset-0 manga-screentone opacity-15 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            {/* Manga speech bubble */}
            <div className="inline-block relative">
              <div className="manga-bubble px-3 py-1.5 bg-amber-300 text-slate-950 font-black text-xs font-mono shadow-[2px_2px_0px_#000]">
                <span>💬 "Welcome back! All submissions receive official proctorial oversight."</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-mono uppercase tracking-tight">
              MITS STUDENT GRIEVANCE DISPATCH PANEL
            </h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Enforcing zero-tolerance for student harassment, hostel negligence, or infrastructural failure. Track your existing cases or submit new claims below.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <span className="text-[10px] font-black font-mono bg-blue-100 border border-slate-900 text-blue-900 px-2 py-0.5 rounded shadow-[1px_1px_0px_#000]">
                ENCRYPTION: VERIFIED
              </span>
              <span className="text-[10px] font-black font-mono bg-emerald-100 border border-slate-900 text-emerald-900 px-2 py-0.5 rounded shadow-[1px_1px_0px_#000]">
                SLA MONITOR: ARMED
              </span>
            </div>
          </div>

          {/* Graphic Emblem */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-sm bg-blue-600 border-4 border-slate-900 shadow-[4px_4px_0px_#000] flex flex-col items-center justify-center text-white relative transform rotate-2 hover:rotate-0 transition-transform">
              <div className="absolute -top-3 -right-3 bg-amber-400 text-slate-950 font-black text-[9px] font-mono px-2 py-0.5 border border-slate-900 shadow-[1px_1px_0px_#000]">
                ACTIVE
              </div>
              <Sparkles className="w-8 h-8 text-amber-300 mb-1" />
              <span className="font-black text-xs font-mono uppercase tracking-wider">
                MITS GMS
              </span>
              <span className="text-[9px] font-mono opacity-80 uppercase">
                STUDENT DESK
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Creative Manga Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Claims"
          value={total}
          subtitle="All filed cases in your dossier"
          icon={FileText}
          badgeText="DOSSIER"
          watermark="TOTAL"
        />
        <StatCard
          title="Under Review"
          value={pending}
          subtitle="Awaiting initial officer inspection"
          icon={Clock}
          badgeText="INSPECTION"
          badgeVariant="amber"
          watermark="REVIEW"
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          subtitle="Under active departmental action"
          icon={TrendingUp}
          badgeText="ACTION"
          badgeVariant="blue"
          watermark="ACTIVE"
        />
        <StatCard
          title="Resolved"
          value={resolved}
          subtitle="Officially closed & certified"
          icon={CheckCircle2}
          badgeText="SOLVED"
          badgeVariant="emerald"
          watermark="CLOSED"
        />
      </div>

      {/* Main Grid: Manga Grievance Table (8 cols) + Updates Stream (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Grievances Table */}
        <div className="lg:col-span-8">
          <Card
            title="MY GRIEVANCE LOG // CASE ARCHIVES"
            subtitle="Active student cases undergoing formal administrative handling"
            tag="LOG.01"
            action={
              <Link to="/track" className="text-xs font-mono font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1">
                <span>View Full Registry</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </Link>
            }
            bodyClassName="p-0 overflow-x-auto"
          >
            <table className="w-full text-left text-xs text-slate-800 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-900 text-slate-900 font-mono font-black uppercase">
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Subject & Category</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200">
                {displayGrievances.map((g) => (
                  <tr key={g.id || g.ticketId} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-800">
                      #{g.ticketId || g.grievance_code || g.id}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-bold text-slate-950 truncate">{g.title}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{g.category}</p>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={g.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={g.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/grievance/${g.ticketId || g.grievance_code || g.id}`}
                        className="inline-block text-xs font-mono font-black bg-slate-900 hover:bg-blue-600 text-white px-2.5 py-1 rounded-xs transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="lg:col-span-4">
          <Card
            title="CAMPUS DISPATCH // ACTIVITY STREAM"
            subtitle="Campus redressal updates and proctorial milestones"
            tag="FEED"
          >
            <RecentActivity activities={DEMO_ACTIVITIES.slice(0, 4)} />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

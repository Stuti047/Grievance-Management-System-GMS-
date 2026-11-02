import React from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Download, 
  Printer, 
  ShieldCheck, 
  Building2, 
  Flame, 
  ArrowUpRight,
  PieChart
} from 'lucide-react';

export default function AnalyticsView() {
  const { complaints = [] } = useApp();

  const activeComplaints = complaints.filter(c => !c.isDeleted);
  const total = activeComplaints.length;
  const resolved = activeComplaints.filter(c => c.status === 'Resolved').length;
  const inProgress = activeComplaints.filter(c => c.status === 'In progress').length;
  const assigned = activeComplaints.filter(c => c.status === 'Assigned').length;
  const submitted = activeComplaints.filter(c => c.status === 'Submitted').length;
  const underReview = activeComplaints.filter(c => c.status === 'Under review').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Category Breakdown
  const categoryStats = CATEGORIES.map(cat => {
    const count = activeComplaints.filter(c => c.category === cat.name).length;
    const catResolved = activeComplaints.filter(c => c.category === cat.name && c.status === 'Resolved').length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      ...cat,
      count,
      catResolved,
      percentage
    };
  });

  // Location Hotspots
  const locationCounts = {};
  activeComplaints.forEach(c => {
    const loc = c.locationDetails?.block || 'Campus';
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });

  const hotspots = Object.entries(locationCounts)
    .map(([loc, count]) => ({ loc, count }))
    .sort((a, b) => b.count - a.count);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* ─── Manga-Inspired Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-widest bg-blue-900/60 text-blue-300 border border-blue-700/60 shadow-xs">
              MITS // METRICS & SLA INTELLIGENCE
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Mathematics & Computing Governance Board
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
            Grievance Analytics & SLA Performance
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Turnaround velocity, residential hotspot clusters, and algorithmic SLA compliance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#0b1424] hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* ─── KPI Cards (Manga Outlined Panels) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0b1424] p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <p className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400">Total Logged Cases</p>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">{total}</h3>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Immutable Ledger</span>
          </div>
        </div>

        <div className="bg-[#0b1424] p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <p className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400">Resolution Rate</p>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{resolutionRate}%</h3>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>{resolved} resolved of {total} total</span>
          </div>
        </div>

        <div className="bg-[#0b1424] p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <p className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400">Average Turnaround</p>
          <h3 className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">18.4 hrs</h3>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-blue-300 font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Target: &lt; 24.0 hrs SLA</span>
          </div>
        </div>

        <div className="bg-[#0b1424] p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <p className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400">Active Hotspots</p>
          <h3 className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{hotspots.length}</h3>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-amber-300 font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Top cluster: BH-1 & Block C</span>
          </div>
        </div>
      </div>

      {/* ─── Middle Grid: Category Breakdown & Location Hotspots ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="bg-[#0b1424] p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-400" />
              Category Volume & SLA Limits
            </h3>
            <span className="text-xs font-mono text-slate-400">{total} Total Tickets</span>
          </div>

          <div className="space-y-4 pt-1">
            {categoryStats.map(cat => (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{cat.name}</span>
                  <div className="space-x-2">
                    <span className="font-mono text-slate-400">{cat.count} cases ({cat.percentage}%)</span>
                    <span className="font-mono font-bold text-blue-400">SLA: {cat.slaHours}h</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-[#080e1a] rounded-full overflow-hidden flex border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(cat.percentage, 5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location Hotspots */}
        <div className="bg-[#0b1424] p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              Campus Hotspot Detection
            </h3>
            <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/80 px-2.5 py-0.5 rounded border border-rose-800">
              CLUSTER DETECTION
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Automated location clustering highlights recurring issues in specific hostel wings and academic labs.
          </p>

          <div className="space-y-2.5 pt-1">
            {hotspots.map((spot, i) => (
              <div 
                key={spot.loc}
                className="p-3 bg-[#080e1a] rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-slate-800 text-blue-300 flex items-center justify-center font-mono font-black text-xs border border-slate-700">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{spot.loc}</h4>
                    <p className="text-[10px] text-slate-500">Repeated grievance cluster</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/80">
                    {spot.count} Active Tickets
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── FSM Status Funnel Breakdown ─── */}
      <div className="bg-[#0b1424] p-6 rounded-2xl border border-slate-800 shadow-lg">
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2 pb-2 border-b border-slate-800">
          <Clock className="w-4 h-4 text-blue-400" />
          FSM Status Funnel Pipeline
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3.5 bg-[#080e1a] rounded-xl border border-blue-900/40">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-blue-400">Submitted</span>
            <p className="text-xl font-black text-white mt-1">{submitted}</p>
            <span className="text-[10px] text-slate-500">Intake queue</span>
          </div>

          <div className="p-3.5 bg-[#080e1a] rounded-xl border border-amber-900/40">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400">Under Review</span>
            <p className="text-xl font-black text-white mt-1">{underReview}</p>
            <span className="text-[10px] text-slate-500">Duplicate triage</span>
          </div>

          <div className="p-3.5 bg-[#080e1a] rounded-xl border border-purple-900/40">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-purple-400">Assigned</span>
            <p className="text-xl font-black text-white mt-1">{assigned}</p>
            <span className="text-[10px] text-slate-500">Officer allocated</span>
          </div>

          <div className="p-3.5 bg-[#080e1a] rounded-xl border border-indigo-900/40">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400">In Progress</span>
            <p className="text-xl font-black text-white mt-1">{inProgress}</p>
            <span className="text-[10px] text-slate-500">Work order open</span>
          </div>

          <div className="p-3.5 bg-[#080e1a] rounded-xl border border-emerald-900/40 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-400">Resolved</span>
            <p className="text-xl font-black text-white mt-1">{resolved}</p>
            <span className="text-[10px] text-emerald-400 font-bold">Closed on Ledger</span>
          </div>
        </div>
      </div>

    </div>
  );
}

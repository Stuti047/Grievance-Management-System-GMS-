import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Search,
  ArrowRight,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';

export default function LandingPage() {
  const { currentUser } = useApp();

  const workflowSteps = [
    {
      step: 'ACT.01',
      title: 'FILE COMPLAINT',
      phase: 'Initial Filing',
      description: 'Lodge academic, hostel, infrastructure or evaluation grievances with attached photo proofs.',
      color: 'bg-amber-300'
    },
    {
      step: 'ACT.02',
      title: 'DISPATCH & SCRUTINY',
      phase: 'Jurisdiction Allotment',
      description: 'System routes directly to concerned HoD, Chief Warden, or Estate Engineer within minutes.',
      color: 'bg-blue-300'
    },
    {
      step: 'ACT.03',
      title: 'TIMELINE TRACKING',
      phase: 'Active Remediation',
      description: 'Transparent FSM lifecycle tracking with tamper-evident audit stamps and SLA timers.',
      color: 'bg-purple-300'
    },
    {
      step: 'ACT.04',
      title: 'CERTIFIED RESOLUTION',
      phase: 'Closure & Feedback',
      description: 'Formal redressal notes published. Complainants verify closure or appeal to Proctorial Board.',
      color: 'bg-emerald-300'
    }
  ];

  const grievanceCategories = [
    { name: 'Hostel & Dining Facilities', code: 'RESIDENTIAL', dept: 'Hostel Administration', sla: '24 Hours' },
    { name: 'Academic & Faculty Matters', code: 'ACADEMIC', dept: 'Concerned Department / DSW', sla: '48 Hours' },
    { name: 'Campus Infrastructure & Labs', code: 'ESTATE', dept: 'Estate Maintenance Section', sla: '48 Hours' },
    { name: 'Examination & Evaluation Cell', code: 'EVALUATION', dept: 'Controller of Examination (COE)', sla: '72 Hours' },
    { name: 'Sanitation & Health Services', code: 'HYGIENE', dept: 'Campus Sanitation Section', sla: '24 Hours' },
    { name: 'High-Speed IT & Network', code: 'NETWORK', dept: 'Central Computing Centre', sla: '24 Hours' }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 selection:bg-amber-400 selection:text-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-[#090d16] text-white py-16 px-4 sm:px-6 lg:px-8 border-b-4 border-slate-900 overflow-hidden">
        {/* Subtle Manga Screentone & Speedlines Background */}
        <div className="absolute inset-0 manga-screentone pointer-events-none opacity-20" />
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Editorial Ribbon */}
          <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 border-2 border-slate-900 rounded-sm px-3 py-1 text-xs font-black uppercase font-mono shadow-[3px_3px_0px_#000] mb-6">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Official UGC Grievance Redressal Portal • MITS Gwalior (Estd. 1957)</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-8 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-mono font-bold text-blue-400 tracking-widest uppercase">
                  // THE OFFICIAL STUDENT CHARTER & PROCTORIAL MECHANISM
                </p>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight font-mono uppercase">
                  GRIEVANCE <span className="text-amber-400 underline decoration-4 decoration-blue-500">MANAGEMENT</span> SYSTEM
                </h1>
              </div>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-medium leading-relaxed">
                Empowering students, faculty, and administrative departments of Madhav Institute of Technology & Science with a transparent, time-bound, and confidential grievance redressal network.
              </p>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                {currentUser ? (
                  <Link to={currentUser.role === 'admin' ? '/admin/dashboard' : currentUser.role === 'authority' ? '/faculty/dashboard' : '/student/dashboard'}>
                    <Button variant="manga" size="lg" className="font-mono text-sm">
                      <span>Launch Dashboard</span>
                      <ArrowRight className="w-4 h-4 ml-1 stroke-[3]" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login">
                    <Button variant="manga" size="lg" className="font-mono text-sm">
                      <span>Enter Portal</span>
                      <ArrowRight className="w-4 h-4 ml-1 stroke-[3]" />
                    </Button>
                  </Link>
                )}

                <Link to="/track">
                  <Button variant="secondary" size="lg" className="font-mono text-sm">
                    <Search className="w-4 h-4 mr-1 stroke-[3] text-blue-600" />
                    <span>Track Grievance By ID</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Manga Panel Summary Card with Official MITS Emblem */}
            <div className="lg:col-span-4 bg-white text-slate-900 border-4 border-slate-900 rounded-sm p-5 shadow-[6px_6px_0px_#2563eb] relative">
              <div className="absolute -top-3.5 right-4 bg-slate-900 text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-xs uppercase">
                CHARTER VOL.01
              </div>

              <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-900">
                <div className="w-12 h-12 rounded-sm bg-white border-2 border-slate-900 p-1 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]">
                  <img
                    src="/images/mits.png"
                    alt="MITS Gwalior Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-900 font-mono">MITS GWALIOR</h3>
                  <p className="text-[10px] text-slate-600 font-bold">Internal Quality Assurance Cell</p>
                </div>
              </div>

              <div className="py-3 space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500 font-bold">First Response:</span>
                  <span className="font-black text-blue-700 bg-blue-50 px-1 border border-slate-900">≤ 24 Hours</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500 font-bold">Target Resolution:</span>
                  <span className="font-black text-emerald-700 bg-emerald-50 px-1 border border-slate-900">7 Working Days</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500 font-bold">Nodal Authority:</span>
                  <span className="font-black text-slate-900">Proctorial Board</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Identity Safety:</span>
                  <span className="font-black text-purple-700">Anonymous Mode OK</span>
                </div>
              </div>

              {/* Speech bubble note */}
              <div className="manga-bubble p-2 bg-amber-50 text-[10px] font-bold text-slate-800 mt-2">
                📢 "Strict UGC non-retaliation policy strictly enforced for all complainants."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manga Chapter Workflow Section */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black text-blue-700 uppercase tracking-widest font-mono bg-blue-100 border border-slate-900 px-2 py-0.5 rounded shadow-[1px_1px_0px_#000]">
            OPERATIONAL PHASES // REDRESSAL STEPS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono uppercase">
            HOW THE REDRESSAL PIPELINE WORKS
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Every registered grievance undergoes a 4-phase finite state machine workflow with strict accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((s) => (
            <div
              key={s.step}
              className="bg-white border-2 border-slate-900 rounded-sm p-5 shadow-[4px_4px_0px_#0f172a] relative hover:-translate-y-1 transition-all overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-sm border-2 border-slate-900 shadow-[1px_1px_0px_#000] ${s.color}`}>
                  {s.step}
                </span>
                <span className="text-[11px] font-black text-slate-400 font-mono uppercase">
                  {s.phase}
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900 font-mono uppercase tracking-tight mb-1.5">
                {s.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Categories & SLAs */}
      <section className="py-12 bg-white border-y-2 border-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-xs font-mono">
                  DIRECTORIES
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-mono uppercase">
                  CLASSIFIED JURISDICTIONS & SLA LIMITS
                </h2>
              </div>
              <p className="text-xs text-slate-600 font-medium">Standard maximum turnaround time for issue resolution</p>
            </div>
            <Link to="/track">
              <Button variant="secondary" size="sm" className="font-mono text-xs">
                <span>View Full Registry</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grievanceCategories.map((cat, i) => (
              <div
                key={i}
                className="bg-slate-50 border-2 border-slate-900 rounded-sm p-4 shadow-[3px_3px_0px_#0f172a] hover:bg-white transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{cat.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">[{cat.code}]</span>
                  </div>
                  <span className="text-[10px] bg-amber-300 text-slate-950 font-black px-2 py-0.5 rounded-xs border-2 border-slate-900 font-mono shadow-[1px_1px_0px_#000] shrink-0">
                    SLA: {cat.sla}
                  </span>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600 font-medium">
                  Jurisdiction: <span className="font-bold text-slate-900">{cat.dept}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comic Callout Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="bg-amber-300 border-4 border-slate-900 rounded-sm p-6 sm:p-8 shadow-[6px_6px_0px_#0f172a] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-block bg-slate-900 text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-xs uppercase">
              EMERGENCY PROTOCOL
            </div>
            <h3 className="text-xl font-black text-slate-950 font-mono uppercase">
              Ragging, Harassment, or Immediate Campus Hazards?
            </h3>
            <p className="text-xs text-slate-900 font-medium max-w-xl">
              Urgent proctorial complaints bypass standard queues. Contact the Central Proctorial Hotline directly or lodge a ticket marked with Critical priority.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/login">
              <Button variant="institutional" size="md" className="font-mono text-xs">
                Sign In to File
              </Button>
            </Link>
            <Link to="/track">
              <Button variant="secondary" size="md" className="font-mono text-xs">
                Status Lookup
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

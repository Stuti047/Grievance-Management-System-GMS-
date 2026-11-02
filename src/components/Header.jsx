import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  PlusCircle, 
  FileText, 
  Users, 
  BarChart3, 
  KeyRound, 
  Sparkles, 
  LogOut, 
  ChevronDown, 
  LayoutDashboard,
  Menu,
  X,
  ShieldCheck,
  Shield,
  HelpCircle,
  Bell
} from 'lucide-react';

export default function Header() {
  const { 
    currentUser, 
    activeTab, 
    setActiveTab, 
    complaints, 
    setIsAnonymousTrackerOpen, 
    setIsChatbotOpen, 
    quickLoginAs, 
    logout 
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Count active complaints for current user
  const userTicketCount = currentUser 
    ? complaints.filter(c => !c.isDeleted && c.submittedBy?.email === currentUser.email).length
    : 0;

  const roleLabels = {
    student: 'Student',
    authority: 'Authority / Warden',
    admin: 'System Admin'
  };

  const roleColors = {
    student: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    authority: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  };

  return (
    <header className="sticky top-0 z-40 bg-[#091120] border-b border-slate-800/90 shadow-md">
      {/* ─────────────────────────────────────────────────────────────
          TOP INSTITUTIONAL RIBBON - MITS Deemed University Identity
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#060c17] border-b border-slate-800/60 text-slate-300 py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/images/mits.png" 
              alt="MITS Gwalior Logo" 
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain bg-slate-900/60 p-1 rounded-lg border border-slate-700/60 shadow-xs"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] text-amber-400 font-semibold tracking-wide">
                  माधव प्रौद्योगिकी एवं विज्ञान संस्थान, ग्वालियर
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.2 text-[9px] uppercase font-bold bg-amber-400/10 text-amber-300 border border-amber-400/25 rounded">
                  Deemed to be University
                </span>
                <span className="hidden lg:inline-block px-1.5 py-0.2 text-[9px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded">
                  NAAC A++
                </span>
              </div>
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white">
                MADHAV INSTITUTE OF TECHNOLOGY & SCIENCE, GWALIOR (M.P.)
              </h1>
            </div>
          </div>

          {/* Quick Info & Assistant Trigger */}
          <div className="flex items-center gap-2 sm:gap-3 text-right">
            <div className="hidden md:block text-[11px] leading-tight text-slate-400">
              <span className="block font-semibold text-slate-200">GMS Cell • Math & Computing</span>
              <span className="text-[10px] text-slate-500">Autonomous Grievance Redressal</span>
            </div>
            
            <button
              onClick={() => setIsChatbotOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-all cursor-pointer hover:border-blue-400/50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Ask GMS</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN NAVIGATION BAR: Clean Links, Brand & User Tools
          ───────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-md border border-blue-400/30 group-hover:from-blue-500 group-hover:to-indigo-600 transition-all">
                GMS
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
                    GMS
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    PORTAL
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block -mt-0.5">
                  Grievance Management System
                </p>
              </div>
            </button>
          </div>

          {/* Center Navigation Links (Clean Bordered Active Indicators) */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600/15 text-blue-400 border-blue-500/40 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>
                {currentUser?.role === 'authority'
                  ? 'Authority Inbox'
                  : currentUser?.role === 'admin'
                  ? 'Admin Overview'
                  : 'Overview'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('submit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                activeTab === 'submit'
                  ? 'bg-blue-600/15 text-blue-400 border-blue-500/40 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Lodge Grievance</span>
            </button>

            <button
              onClick={() => setActiveTab('my_tickets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                activeTab === 'my_tickets'
                  ? 'bg-blue-600/15 text-blue-400 border-blue-500/40 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>My Tickets</span>
              {userTicketCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {userTicketCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                activeTab === 'community'
                  ? 'bg-blue-600/15 text-blue-400 border-blue-500/40 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Community Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                activeTab === 'analytics'
                  ? 'bg-blue-600/15 text-blue-400 border-blue-500/40 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>SLA Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('authorities')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                activeTab === 'authorities'
                  ? 'bg-blue-600/15 text-blue-400 border-blue-500/40 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Authorities</span>
            </button>

            <button
              onClick={() => setIsAnonymousTrackerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 border border-amber-500/20 transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Token Tracker</span>
            </button>
          </nav>

          {/* Right Section: Role Switcher & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Presentation Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  currentUser ? roleColors[currentUser.role] : 'bg-[#0f1b33] text-slate-300 border-slate-700'
                }`}
                title="Switch role for presentation evaluation"
              >
                <span>Role: {currentUser ? roleLabels[currentUser.role] : 'Guest'}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {roleMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-[#0c1629] rounded-xl shadow-2xl border border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setRoleMenuOpen(false)}
                >
                  <div className="px-3.5 py-1.5 border-b border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Demo Role Switcher (Evaluation)
                    </p>
                  </div>

                  <button
                    onClick={() => { quickLoginAs('student'); setRoleMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                      PC
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Puneet Chaudhary (Student)</p>
                      <p className="text-[10px] text-slate-400">BTMC25O1109 • Math & Comp</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { quickLoginAs('student_stuti'); setRoleMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                      SJ
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Stuti Jain (Student)</p>
                      <p className="text-[10px] text-slate-400">BTMC25O1139 • Math & Comp</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { quickLoginAs('warden'); setRoleMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                      SK
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Dr. S. K. Sharma (Authority)</p>
                      <p className="text-[10px] text-slate-400">Hostel Chief Warden BH-1</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { quickLoginAs('hod'); setRoleMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                      MD
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Prof. Monika Dandotiya (HOD)</p>
                      <p className="text-[10px] text-slate-400">Associate Professor • MAC Dept</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { quickLoginAs('admin'); setRoleMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-slate-800"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                      AD
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Chief Proctorial Board</p>
                      <p className="text-[10px] text-slate-400">Central Admin & Governance</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Profile Dropdown / Sign in */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-lg bg-[#0f1b33] hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-md object-cover border border-slate-600"
                  />
                  <span className="hidden sm:inline text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-[#0c1629] rounded-xl shadow-2xl border border-slate-700 p-3.5 z-50 animate-in fade-in"
                    onMouseLeave={() => setProfileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-lg object-cover border border-blue-500/50"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                          {currentUser.department || 'MITS Gwalior'}
                        </span>
                      </div>
                    </div>

                    <div className="py-2.5 text-xs space-y-1.5">
                      {currentUser.enrollmentNo && (
                        <div className="flex justify-between py-0.5 text-slate-300">
                          <span className="text-slate-500">Enrollment:</span>
                          <span className="font-mono font-semibold text-white">{currentUser.enrollmentNo}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-0.5 text-slate-300">
                        <span className="text-slate-500">Domain Auth:</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Institute Verified
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full mt-2 pt-2 border-t border-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out from GMS
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors cursor-pointer border border-blue-500/30"
              >
                Sign In
              </button>
            )}

            {/* Mobile Navigation Toggle Button */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 border border-slate-700"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden py-3 border-t border-slate-800 space-y-1 animate-in slide-in-from-top-2">
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileNavOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                activeTab === 'dashboard' ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {currentUser?.role === 'authority'
                ? 'Authority Inbox'
                : currentUser?.role === 'admin'
                ? 'Admin Overview'
                : 'Overview'}
            </button>
            <button
              onClick={() => { setActiveTab('submit'); setMobileNavOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                activeTab === 'submit' ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-blue-400" />
              Lodge Grievance
            </button>
            <button
              onClick={() => { setActiveTab('my_tickets'); setMobileNavOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                activeTab === 'my_tickets' ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              My Tickets ({userTicketCount})
            </button>
            <button
              onClick={() => { setActiveTab('community'); setMobileNavOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                activeTab === 'community' ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Community Feed
            </button>
            <button
              onClick={() => { setActiveTab('analytics'); setMobileNavOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                activeTab === 'analytics' ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              SLA Analytics
            </button>
            <button
              onClick={() => { setActiveTab('authorities'); setMobileNavOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                activeTab === 'authorities' ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4 text-indigo-400" />
              Responsible Authorities Directory
            </button>
            <button
              onClick={() => { setIsAnonymousTrackerOpen(true); setMobileNavOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30"
            >
              <KeyRound className="w-4 h-4" />
              Anonymous Token Tracker
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

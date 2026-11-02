import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  KeyRound, 
  GraduationCap, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles,
  UserCheck,
  Building2,
  CheckCircle2,
  Lock,
  FileText,
  Clock,
  Shield,
  Send,
  Activity,
  Layers,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export default function LoginView() {
  const { 
    loginWithGoogle, 
    loginWithEmail, 
    quickLoginAs, 
    setIsAnonymousTrackerOpen, 
    setIsChatbotOpen 
  } = useApp();

  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('puneet.btmc25@mitsgwl.ac.in');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim()) {
      setErrorMessage('Please enter your institute email address.');
      return;
    }
    setIsSubmitting(true);
    try {
      const ok = await loginWithEmail(email, password);
      if (!ok) {
        setErrorMessage('Invalid credentials or unauthorized account.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = async () => {
    setErrorMessage('');
    setGoogleLoading(true);
    let targetEmail = 'puneet.btmc25@mitsgwl.ac.in';
    let targetPass = 'Password@123';
    if (selectedRole === 'authority') {
      targetEmail = 'warden.bh1@mitsgwalior.in';
      targetPass = 'Authority@123';
    }
    if (selectedRole === 'admin') {
      targetEmail = 'proctor.admin@mitsgwalior.in';
      targetPass = 'Admin@123';
    }
    try {
      await loginWithGoogle(targetEmail, targetPass);
    } finally {
      setGoogleLoading(false);
    }
  };

  const setRoleDefaults = (role) => {
    setSelectedRole(role);
    setErrorMessage('');
    if (role === 'student') {
      setEmail('puneet.btmc25@mitsgwl.ac.in');
      setPassword('Password@123');
    } else if (role === 'authority') {
      setEmail('warden.bh1@mitsgwalior.in');
      setPassword('Authority@123');
    } else if (role === 'admin') {
      setEmail('proctor.admin@mitsgwalior.in');
      setPassword('Admin@123');
    }
  };

  const featureCards = [
    {
      title: 'Grievance Submission',
      desc: 'Lodge academic, mess, hostel, and campus infrastructure issues or submit anonymously with zero-knowledge keys.',
      icon: Send,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Complaint Tracking',
      desc: 'Real-time FSM lifecycle visibility from initial intake to investigator assignment, field checks, and resolution.',
      icon: Activity,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    },
    {
      title: 'Authority Management',
      desc: 'Role-based consoles for Hostel Wardens, HODs, and Central Proctorial Board with audit-logged internal notes.',
      icon: ShieldCheck,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'Transparency & Accountability',
      desc: 'Tamper-evident status history, strict escalation matrices, student feedback validation, and campus SLA metrics.',
      icon: CheckCircle2,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    }
  ];

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Two-Column Split Screen Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* ─────────────────────────────────────────────────────────────
            LEFT SECTION: Institutional Identity & System Features
            ───────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Institution Header Badge */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-900/60 to-slate-900 border border-blue-500/30 p-2 shadow-lg shadow-blue-900/20 flex items-center justify-center">
                <img 
                  src="/images/mits.png" 
                  alt="MITS Gwalior Logo" 
                  className="w-full h-full object-contain filter drop-shadow"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#080e1a]"></span>
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-300 border border-blue-500/30">
                <Shield className="w-3 h-3 text-blue-400" />
                <span>MITS Grievance Portal</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white mt-1">
                Grievance Management System
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Madhav Institute of Technology & Science, Gwalior
              </p>
              <p className="text-[11px] text-slate-500">
                Deemed to be University • NAAC A++ Accredited • Estd. 1957
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            A centralized, enterprise-grade governance platform engineered for time-bound resolution, 
            transparent investigation workflows, and accountability across academic departments, 
            hostel administrations, and student amenities.
          </p>

          {/* Feature Cards Grid (4 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {featureCards.map((feat) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={feat.title}
                  className="bg-[#0b1424] hover:bg-[#0e1a30] border border-slate-800 hover:border-blue-500/40 rounded-xl p-4 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg border shrink-0 ${feat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                        {feat.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust Footnote */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>TLS 1.3 & JWT Encrypted</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>UGC & AICTE Compliance</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">
              Department of Mathematics & Computing
            </span>
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────
            RIGHT SECTION: Clearly Bordered Institutional Login Panel
            ───────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-5">
          <div className="bg-[#0c1629] border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
            
            {/* Top Border Glow Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400"></div>

            {/* Panel Title */}
            <div className="space-y-1 mb-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Sign in to your account
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  GMS Portal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authenticate with your MITS institutional credentials
              </p>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Google Single Sign-On Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-[#121f38] hover:bg-[#162746] text-white border border-slate-700 hover:border-blue-400/50 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer disabled:opacity-60 shadow-sm"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google Workspace</span>
              </button>
              <p className="text-[11px] text-center text-slate-500 font-medium">
                Verified access for <span className="font-mono text-blue-400 font-semibold">@mitsgwl.ac.in</span> & <span className="font-mono text-blue-400 font-semibold">@mitsgwalior.in</span>
              </p>
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0c1629] px-3 text-slate-500 font-semibold tracking-wider text-[10px]">
                  Or Sign In with Institute ID
                </span>
              </div>
            </div>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#080f1c] border border-slate-800 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setRoleDefaults('student')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedRole === 'student'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRoleDefaults('authority')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedRole === 'authority'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Authority
              </button>
              <button
                type="button"
                onClick={() => setRoleDefaults('admin')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Institute Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="enrollment@mitsgwl.ac.in"
                    className="w-full px-3.5 py-2.5 bg-[#080f1c] border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-medium placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <div className="absolute right-3 top-2.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                    MITS
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline cursor-pointer">
                    Forgot Password?
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter account password"
                    className="w-full px-3.5 py-2.5 bg-[#080f1c] border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-medium placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-3.5 h-3.5 rounded bg-[#080f1c] border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember active session (7 days)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 border border-blue-500/30"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Panel for Evaluation */}
            <div className="mt-4 p-3 bg-[#080f1c] border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Evaluation Fast Login:
                </span>
                <span className="text-[10px] text-slate-500">1-Click Auth</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => quickLoginAs('student')}
                  className="px-2.5 py-1.5 text-left bg-[#0c1629] hover:bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 rounded-lg transition-colors cursor-pointer group"
                >
                  <p className="text-[11px] font-bold text-white group-hover:text-emerald-300">Puneet Chaudhary</p>
                  <p className="text-[9px] text-emerald-400 font-medium">Student (BTMC25O1109)</p>
                </button>

                <button
                  type="button"
                  onClick={() => quickLoginAs('student_stuti')}
                  className="px-2.5 py-1.5 text-left bg-[#0c1629] hover:bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 rounded-lg transition-colors cursor-pointer group"
                >
                  <p className="text-[11px] font-bold text-white group-hover:text-emerald-300">Stuti Jain</p>
                  <p className="text-[9px] text-emerald-400 font-medium">Student (BTMC25O1139)</p>
                </button>

                <button
                  type="button"
                  onClick={() => quickLoginAs('warden')}
                  className="px-2.5 py-1.5 text-left bg-[#0c1629] hover:bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 rounded-lg transition-colors cursor-pointer group"
                >
                  <p className="text-[11px] font-bold text-white group-hover:text-indigo-300">Dr. S. K. Sharma</p>
                  <p className="text-[9px] text-indigo-400 font-medium">Hostel Warden BH-1</p>
                </button>

                <button
                  type="button"
                  onClick={() => quickLoginAs('hod')}
                  className="px-2.5 py-1.5 text-left bg-[#0c1629] hover:bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 rounded-lg transition-colors cursor-pointer group"
                >
                  <p className="text-[11px] font-bold text-white group-hover:text-indigo-300">Prof. M. Dandotiya</p>
                  <p className="text-[9px] text-indigo-400 font-medium">HOD • Math & Comp</p>
                </button>
              </div>

              <button
                type="button"
                onClick={() => quickLoginAs('admin')}
                className="w-full px-2.5 py-1.5 text-center bg-[#0c1629] hover:bg-purple-950/40 border border-slate-700/80 hover:border-purple-500/50 rounded-lg text-[11px] font-bold text-purple-300 transition-colors cursor-pointer"
              >
                Sign In as Chief Proctorial Admin (Full Governance)
              </button>
            </div>

            {/* Anonymous Complaint Direct Fast Tracker */}
            <div className="text-center pt-3 mt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAnonymousTrackerOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Filed an Anonymous Grievance? Track by Secret Token &rarr;</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

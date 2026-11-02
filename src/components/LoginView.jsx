import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  GraduationCap, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles,
  Building2,
  CheckCircle2,
  FileText,
  Clock,
  Shield,
  Send,
  Activity,
  AlertCircle,
  UserPlus,
  KeyRound,
  RotateCcw
} from 'lucide-react';
import api from '../api';

export default function LoginView() {
  const { 
    loginWithEmail, 
    register, 
    quickLoginAs, 
    addToast 
  } = useApp();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('25mc1st139@mitsgwl.ac.in');
  const [loginPassword, setLoginPassword] = useState('S@just');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('Mathematics and Computing');
  const [regEnrollment, setRegEnrollment] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Forgot password modal state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: request code, 2: reset pass
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  const mitsDepartments = [
    'Mathematics and Computing',
    'Computer Science & Engineering',
    'Information Technology',
    'Artificial Intelligence & Data Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electronics & Telecommunication',
    'Chemical Engineering',
    'Architecture & Planning'
  ];

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your registered institutional email.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoginLoading(true);
    try {
      const ok = await loginWithEmail(loginEmail.trim(), loginPassword);
      if (!ok) {
        setErrorMessage('Invalid credentials or unauthorized account.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Register submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Please enter your institutional email.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setRegLoading(true);
    try {
      const ok = await register({
        name: regName.trim(),
        email: regEmail.trim(),
        college_email: regEmail.trim(),
        department: regDepartment,
        enrollment_no: regEnrollment.trim(),
        password: regPassword
      });

      if (!ok) {
        setErrorMessage('Registration failed. This email may already be registered.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setRegLoading(false);
    }
  };

  // Quick Demo Account Selection
  const applyDemoAccount = (role) => {
    setErrorMessage('');
    setAuthMode('login');
    if (role === 'student') {
      setLoginEmail('25mc1st139@mitsgwl.ac.in');
      setLoginPassword('S@just');
    } else if (role === 'authority') {
      setLoginEmail('hod.mac@mitsgwalior.in');
      setLoginPassword('Authority@123');
    } else if (role === 'admin') {
      setLoginEmail('admin@mitsgwalior.in');
      setLoginPassword('Admin@123');
    }
  };

  // Forgot password handlers
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setForgotMsg('');
    try {
      const res = await api.auth.forgotPassword(forgotEmail.trim());
      if (res.error) {
        setForgotMsg(res.error);
      } else {
        setForgotMsg(res.message + (res.resetCode ? ` (Dev Code: ${res.resetCode})` : ''));
        if (res.resetCode) setForgotCode(res.resetCode);
        setForgotStep(2);
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotReset = async (e) => {
    e.preventDefault();
    if (!forgotNewPass || forgotNewPass.length < 6) {
      setForgotMsg('New password must be at least 6 characters long.');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await api.auth.resetPassword(forgotEmail.trim(), forgotCode.trim(), forgotNewPass);
      if (res.error) {
        setForgotMsg(res.error);
      } else {
        addToast('Password Reset', 'Password updated successfully! Please log in.', 'success');
        setIsForgotOpen(false);
        setLoginEmail(forgotEmail.trim());
        setLoginPassword(forgotNewPass);
        setForgotStep(1);
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* ─────────────────────────────────────────────────────────────
            LEFT SECTION: Institutional Overview & Features
            ───────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-6">
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
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Autonomous Redressal Framework</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight mt-1">
                Grievance Management System
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Madhav Institute of Technology & Science, Gwalior (M.P.)
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
            <p className="font-medium text-slate-200">
              Welcome to the official grievance resolution portal of MITS Gwalior. Submit academic, examination, hostel, mess, and infrastructure complaints directly to authorized institute authorities with transparent lifecycle auditing.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Full PostgreSQL Persistence
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-blue-400 font-semibold">
                <Lock className="w-3.5 h-3.5" /> Confidential Contact Protection
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Clock className="w-3.5 h-3.5" /> Real-time SLA Timelines
              </span>
            </div>
          </div>

          {/* Quick Demo Credentials Panel */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Demo Evaluation Accounts
              </span>
              <span className="text-[10px] text-slate-400">Click to fill</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyDemoAccount('student')}
                className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/30 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-0.5">
                  <span>Student Demo</span>
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] text-slate-300 truncate font-mono">25mc1st139@mitsgwl.ac.in</div>
                <div className="text-[10px] text-slate-500">Pass: S@just</div>
              </button>

              <button
                type="button"
                onClick={() => applyDemoAccount('authority')}
                className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-indigo-500/30 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-indigo-400 mb-0.5">
                  <span>Authority (HOD)</span>
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] text-slate-300 truncate font-mono">hod.mac@mitsgwalior.in</div>
                <div className="text-[10px] text-slate-500">Pass: Authority@123</div>
              </button>

              <button
                type="button"
                onClick={() => applyDemoAccount('admin')}
                className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-purple-500/30 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-purple-400 mb-0.5">
                  <span>Dean / Proctor</span>
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] text-slate-300 truncate font-mono">admin@mitsgwalior.in</div>
                <div className="text-[10px] text-slate-500">Pass: Admin@123</div>
              </button>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            RIGHT SECTION: Tabbed Login / Create Account Card
            ───────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-5">
          <div className="bg-[#0c1629] border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400"></div>

            {/* Auth Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#080f1c] border border-slate-800 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'login'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'register'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ─── OPTION A: LOGIN FORM ──────────────────────────────── */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Institute Email Address
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="25mc1st139@mitsgwl.ac.in"
                    className="w-full px-3.5 py-2.5 bg-[#080f1c] border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-medium placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setIsForgotOpen(true); setForgotEmail(loginEmail); setForgotMsg(''); }}
                      className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 bg-[#080f1c] border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-medium placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                >
                  {loginLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Sign In to GMS</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ─── OPTION B: CREATE ACCOUNT FORM ─────────────────────── */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    placeholder="Aarav Sharma"
                    className="w-full px-3 py-2 bg-[#080f1c] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Institutional Email Address
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="student@mitsgwl.ac.in"
                    className="w-full px-3 py-2 bg-[#080f1c] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Department
                    </label>
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="w-full px-2.5 py-2 bg-[#080f1c] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {mitsDepartments.map((d) => (
                        <option key={d} value={d} className="bg-slate-900 text-white">{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Enrollment No.
                    </label>
                    <input
                      type="text"
                      value={regEnrollment}
                      onChange={(e) => setRegEnrollment(e.target.value)}
                      placeholder="0901MC251001"
                      className="w-full px-3 py-2 bg-[#080f1c] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-[#080f1c] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-[#080f1c] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-3"
                >
                  {regLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Create Student Account</span>
                      <UserPlus className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
              Institutional Redressal & Compliance • Department of Mathematics & Computing
            </div>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          FORGOT PASSWORD MODAL
          ───────────────────────────────────────────────────────────── */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#0c1629] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Password Reset Verification</span>
              </h3>
              <button
                onClick={() => setIsForgotOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            {forgotMsg && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs">
                {forgotMsg}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotRequest} className="space-y-3">
                <p className="text-xs text-slate-400">
                  Enter your registered MITS institute email address. A 6-digit password reset code will be generated for verification.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="your.email@mitsgwl.ac.in"
                    className="w-full px-3.5 py-2.5 bg-[#080f1c] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
                >
                  {forgotLoading ? 'Processing...' : 'Generate Reset Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotReset} className="space-y-3">
                <p className="text-xs text-slate-400">
                  Enter the verification code and set your new password.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value)}
                    required
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 bg-[#080f1c] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono tracking-widest text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={forgotNewPass}
                    onChange={(e) => setForgotNewPass(e.target.value)}
                    required
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 bg-[#080f1c] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all"
                >
                  {forgotLoading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

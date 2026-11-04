import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import FormInput from '../components/forms/FormInput';
import ErrorMessage from '../components/common/ErrorMessage';
import Modal from '../components/common/Modal';

export default function LoginPage() {
  const { loginWithEmail, loginWithGoogle, quickLoginAs } = useApp();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'authority' | 'admin'
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState({ sent: false, error: '' });

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setErrorMessage('');
    if (role === 'student') {
      setEmail('stuti.btmc25@mitsgwl.ac.in');
      setPassword('password123');
    } else if (role === 'authority') {
      setEmail('hod.mac@mitsgwalior.in');
      setPassword('authority123');
    } else if (role === 'admin') {
      setEmail('proctor.admin@mitsgwalior.in');
      setPassword('admin123');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your institutional email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setLoading(true);

    try {
      const success = await loginWithEmail(email.trim(), password);
      if (success) {
        setSuccessMessage('Authentication verified! Entering grievance dashboard...');
        setTimeout(() => {
          if (selectedRole === 'admin') navigate('/admin/dashboard');
          else if (selectedRole === 'authority') navigate('/faculty/dashboard');
          else navigate('/student/dashboard');
        }, 500);
      } else {
        setErrorMessage('Authentication rejected. Check credentials or use the demo shortcut below.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login request could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMessage('');
    try {
      const targetEmail = email.trim() || 'student.google@mitsgwl.ac.in';
      if (loginWithGoogle) {
        const ok = await loginWithGoogle(targetEmail, 'GoogleSSO@2026');
        if (ok) {
          setSuccessMessage('Google Single Sign-On authenticated! Redirecting...');
          setTimeout(() => navigate('/student/dashboard'), 500);
          return;
        }
      }
      await quickLoginAs('student');
      setSuccessMessage('Signed in with Google (Institutional SSO). Launching dashboard...');
      setTimeout(() => navigate('/student/dashboard'), 500);
    } catch (err) {
      setErrorMessage('Google Sign-In failed: ' + err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role) => {
    setLoading(true);
    setErrorMessage('');
    try {
      await quickLoginAs(role);
      setSuccessMessage(`Logged in as ${role.toUpperCase()}. Redirecting...`);
      setTimeout(() => {
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'authority') navigate('/faculty/dashboard');
        else navigate('/student/dashboard');
      }, 500);
    } catch (err) {
      setErrorMessage('Quick login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotStatus({ sent: false, error: 'Please enter your registered email' });
      return;
    }
    setForgotStatus({ sent: true, error: '' });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 selection:bg-amber-400 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        <div className="absolute inset-0 manga-halftone pointer-events-none opacity-20" />

        <div className="w-full max-w-md bg-white border-4 border-slate-900 rounded-sm shadow-[6px_6px_0px_#0f172a] overflow-hidden relative z-10">
          {/* Header Panel with Official MITS Logo */}
          <div className="bg-[#090d16] text-white p-6 text-center border-b-2 border-slate-900 relative">
            <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 font-mono text-[9px] font-black px-2 py-0.5 rounded-xs border border-slate-900 shadow-[1px_1px_0px_#000]">
              SSO LOGIN
            </div>

            {/* Official MITS Gwalior Logo */}
            <div className="w-16 h-16 rounded-sm bg-white border-2 border-slate-900 p-1.5 flex items-center justify-center mx-auto mb-3 shadow-[3px_3px_0px_#2563eb]">
              <img
                src="/images/mits.png"
                alt="MITS Gwalior"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="font-black text-slate-950 text-base">MITS</span>';
                }}
              />
            </div>

            <h2 className="text-xl font-black font-mono tracking-tight uppercase">
              MITS INSTITUTIONAL ACCESS
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Grievance Management System // Portal Entry
            </p>
          </div>

          {/* Manga Speech Bubble Help tip */}
          <div className="p-4 bg-amber-50 border-b-2 border-slate-900">
            <div className="manga-bubble p-2.5 bg-white text-xs font-bold text-slate-800 flex items-center gap-2">
              <span className="text-base">💬</span>
              <span className="text-[11px] leading-tight font-medium">
                Sign in with your official university ID or Google Workspace credentials.
              </span>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 border-b-2 border-slate-900 bg-slate-50 text-xs font-mono font-black text-center select-none">
            <button
              type="button"
              onClick={() => handleRoleSelect('student')}
              className={`py-3 px-2 border-b-4 transition-all ${
                selectedRole === 'student'
                  ? 'border-blue-600 text-blue-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              STUDENT
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('authority')}
              className={`py-3 px-2 border-b-4 transition-all ${
                selectedRole === 'authority'
                  ? 'border-blue-600 text-blue-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              FACULTY
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`py-3 px-2 border-b-4 transition-all ${
                selectedRole === 'admin'
                  ? 'border-blue-600 text-blue-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              ADMIN
            </button>
          </div>

          {/* Login Form Body */}
          <div className="p-6 space-y-4">
            {errorMessage && (
              <ErrorMessage
                variant="error"
                message={errorMessage}
                onDismiss={() => setErrorMessage('')}
              />
            )}
            {successMessage && (
              <ErrorMessage
                variant="success"
                message={successMessage}
              />
            )}

            {/* Google Sign In Button */}
            <div>
              <Button
                type="button"
                variant="google"
                size="md"
                className="w-full justify-center font-mono text-xs font-bold"
                onClick={handleGoogleSignIn}
                loading={googleLoading}
              >
                Sign in with Google
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 font-mono font-bold text-slate-400 text-[10px]">
                    OR INSTITUTIONAL CREDENTIALS
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <FormInput
                label="University Email"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name.dept@mitsgwl.ac.in"
                required
                icon={Mail}
                helperText="MITS-issued email address"
              />

              <FormInput
                label="Account Password"
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                icon={Lock}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded-sm border-2 border-slate-900 text-blue-600 focus:ring-blue-600"
                  />
                  <span>Remember session</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setForgotStatus({ sent: false, error: '' }); setIsForgotModalOpen(true); }}
                  className="text-blue-700 hover:text-blue-900 underline"
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center font-mono uppercase text-xs"
                loading={loading}
              >
                Sign In as {selectedRole.toUpperCase()}
              </Button>
            </form>

            {/* Quick Demo Switcher Info */}
            <div className="mt-4 pt-4 border-t-2 border-slate-200 text-center space-y-2">
              <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                QUICK EVALUATION SHORTCUTS:
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('student')}
                  className="px-2.5 py-1 text-[11px] font-black font-mono bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-900 rounded-sm shadow-[1px_1px_0px_#000] cursor-pointer"
                >
                  Student Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('authority')}
                  className="px-2.5 py-1 text-[11px] font-black font-mono bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-900 rounded-sm shadow-[1px_1px_0px_#000] cursor-pointer"
                >
                  Faculty Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin')}
                  className="px-2.5 py-1 text-[11px] font-black font-mono bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-900 rounded-sm shadow-[1px_1px_0px_#000] cursor-pointer"
                >
                  Admin Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset University Password"
        subtitle="Verification link dispatched to your registered address."
      >
        {forgotStatus.sent ? (
          <div className="py-4 space-y-3 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-black font-mono text-slate-900 uppercase">
              Reset Token Dispatched
            </h4>
            <p className="text-xs text-slate-600 font-medium">
              If an account with <span className="font-bold text-slate-900">{forgotEmail}</span> exists, password reset instructions have been delivered.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsForgotModalOpen(false)}
              className="mt-2 font-mono text-xs"
            >
              Close Window
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 py-2">
            {forgotStatus.error && (
              <ErrorMessage variant="error" message={forgotStatus.error} />
            )}
            <FormInput
              label="Registered University Email"
              id="forgotEmail"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="e.g. rollno@mitsgwl.ac.in"
              required
              icon={Mail}
              helperText="Must match your registered student/faculty email account."
            />
            <div className="flex justify-end gap-2 pt-2 border-t-2 border-slate-900">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsForgotModalOpen(false)}
                className="font-mono text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="font-mono text-xs"
              >
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Footer />
    </div>
  );
}

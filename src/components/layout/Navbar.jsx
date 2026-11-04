import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  Shield, 
  PlusCircle, 
  Search,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { RoleBadge } from '../common/Badge';

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { currentUser, logout, quickLoginAs } = useApp();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090d16] text-white border-b-2 border-slate-900 shadow-md">
      {/* Top Editorial Ribbon */}
      <div className="bg-[#04070e] px-4 py-1 text-[11px] text-slate-400 border-b border-slate-800 font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-amber-400 tracking-wider">MITS GWALIOR</span>
            <span className="text-slate-600">//</span>
            <span className="hidden sm:inline text-slate-300 font-medium">DEEMED TO BE UNIVERSITY • NAAC A++</span>
            <span className="hidden md:inline bg-blue-950 text-blue-300 border border-blue-700 px-1.5 py-0.2 rounded text-[10px] font-bold">
              UGC REDRESSAL SYSTEM
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[10px] text-slate-400">
              Grievance Redressal Mechanism
            </span>
            <a 
              href="https://web.mitsgwalior.in" 
              target="_blank" 
              rel="noreferrer" 
              className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors text-[11px]"
            >
              <span>mitsgwalior.in</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Official MITS Gwalior Logo + Branding */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-sm border-2 border-slate-700 bg-slate-800 text-slate-200 hover:text-white focus:outline-hidden"
              title="Toggle Menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link to="/" className="flex items-center gap-3 group">
            {/* Official MITS Gwalior Logo */}
            <div className="relative w-10 h-10 rounded-sm bg-white p-1 border-2 border-slate-900 shadow-[2px_2px_0px_#2563eb] flex items-center justify-center shrink-0">
              <img
                src="/images/mits.png"
                alt="MITS Gwalior Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="font-black text-slate-900 text-xs">MITS</span>';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors uppercase font-mono">
                  MITS GMS
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-xs border border-slate-900 shadow-[1px_1px_0px_#000]">
                  VOL.26
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight leading-none">
                Grievance Management System
              </p>
            </div>
          </Link>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              {/* Quick actions for student */}
              {currentUser.role === 'student' && (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/submit"
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-sm border-2 border-slate-900 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Lodge Ticket</span>
                  </Link>
                  <Link
                    to="/track"
                    className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-sm border-2 border-slate-700 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Track Status</span>
                  </Link>
                </div>
              )}

              {/* Demo Role Switcher */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="hidden md:inline-flex items-center gap-1.5 text-xs bg-slate-900 border-2 border-slate-700 text-slate-200 hover:text-white px-2.5 py-1.5 rounded-sm shadow-[2px_2px_0px_#000] font-mono transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span className="capitalize">Role: {currentUser.role}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 rounded-sm bg-white text-slate-900 shadow-[4px_4px_0px_#0f172a] border-2 border-slate-900 py-1 z-50 text-xs font-bold">
                    <div className="px-3 py-1.5 border-b-2 border-slate-900 text-[10px] text-slate-500 uppercase font-mono bg-slate-100">
                      Switch Role (Demo Mode)
                    </div>
                    <button
                      onClick={() => { quickLoginAs('student'); setRoleMenuOpen(false); navigate('/student/dashboard'); }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between"
                    >
                      <span>Student (Applicant)</span>
                      {currentUser.role === 'student' && <span className="text-blue-600">✓</span>}
                    </button>
                    <button
                      onClick={() => { quickLoginAs('authority'); setRoleMenuOpen(false); navigate('/faculty/dashboard'); }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between"
                    >
                      <span>Faculty / Warden</span>
                      {currentUser.role === 'authority' && <span className="text-blue-600">✓</span>}
                    </button>
                    <button
                      onClick={() => { quickLoginAs('admin'); setRoleMenuOpen(false); navigate('/admin/dashboard'); }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between"
                    >
                      <span>Administrator (Proctor)</span>
                      {currentUser.role === 'admin' && <span className="text-blue-600">✓</span>}
                    </button>
                  </div>
                )}
              </div>

              {/* User Profile avatar dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-sm border-2 border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-all text-left shadow-[2px_2px_0px_#000]"
                >
                  <div className="w-7 h-7 rounded-sm bg-amber-400 border border-slate-900 text-slate-950 font-black flex items-center justify-center text-xs">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-xs font-bold text-white truncate max-w-[130px] leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-amber-400 capitalize leading-tight font-mono">
                      {currentUser.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 rounded-sm bg-white text-slate-900 shadow-[4px_4px_0px_#0f172a] border-2 border-slate-900 py-1 z-50 text-xs">
                    <div className="px-3.5 py-2.5 border-b-2 border-slate-900 bg-slate-50">
                      <p className="font-extrabold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate font-mono">{currentUser.email}</p>
                      <div className="mt-1.5">
                        <RoleBadge role={currentUser.role} />
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-100 flex items-center gap-2 font-bold text-slate-800"
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      <span>Profile & Dossier</span>
                    </Link>
                    <div className="border-t-2 border-slate-200 my-1" />
                    <button
                      type="button"
                      onClick={() => { setProfileDropdownOpen(false); handleLogout(); }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black px-4 py-2 rounded-sm border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all uppercase tracking-wider font-mono"
              >
                <span>Portal Login</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

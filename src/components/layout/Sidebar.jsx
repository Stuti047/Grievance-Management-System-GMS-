import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  PlusCircle,
  Search,
  ListFilter,
  User,
  Sparkles,
  Compass
} from 'lucide-react';
import { RoleBadge } from '../common/Badge';

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser } = useApp();

  const role = currentUser?.role || 'student';

  const studentLinks = [
    { to: '/student/dashboard', label: 'Overview Panel', code: '01', icon: LayoutDashboard },
    { to: '/submit', label: 'Lodge Grievance', code: '02', icon: PlusCircle },
    { to: '/track', label: 'Track Registry', code: '03', icon: Search },
    { to: '/profile', label: 'My Dossier', code: '04', icon: User }
  ];

  const facultyLinks = [
    { to: '/faculty/dashboard', label: 'Authority Console', code: '01', icon: LayoutDashboard },
    { to: '/track', label: 'All Grievances', code: '02', icon: Search },
    { to: '/profile', label: 'Faculty Dossier', code: '03', icon: User }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Proctorial Command', code: '01', icon: LayoutDashboard },
    { to: '/admin/responsibility-mappings', label: 'Responsibility Matrix', code: '02', icon: Compass },
    { to: '/track', label: 'Campus Records', code: '03', icon: ListFilter },
    { to: '/profile', label: 'Admin Dossier', code: '04', icon: User }
  ];

  const navLinks = role === 'admin' 
    ? adminLinks 
    : role === 'authority' 
    ? facultyLinks 
    : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-white border-r-2 border-slate-900 z-40 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: User info pill & Nav */}
        <div className="p-4 space-y-5 overflow-y-auto">
          {/* User Brief Manga Card */}
          <div className="bg-slate-50 border-2 border-slate-900 rounded-sm p-3 shadow-[2.5px_2.5px_0px_#0f172a] flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-xs font-black text-slate-900 truncate">
                {currentUser?.name || 'Authorized Member'}
              </p>
              <p className="text-[10px] text-slate-500 font-mono truncate">
                {currentUser?.department || 'MITS Gwalior'}
              </p>
            </div>
            <RoleBadge role={role} />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                NAVIGATION MENU
              </span>
              <span className="text-[10px] text-slate-400 font-mono">PANEL 01</span>
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-sm border-2 text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white border-slate-900 shadow-[2.5px_2.5px_0px_#000] translate-x-1'
                        : 'bg-white text-slate-700 border-transparent hover:border-slate-900 hover:bg-slate-100 hover:shadow-[2px_2px_0px_#0f172a]'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </div>
                  <span className="text-[10px] font-mono opacity-60">
                    [{link.code}]
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Manga Speech Bubble Tip */}
        <div className="p-4 border-t-2 border-slate-900 bg-slate-50/70 space-y-3 text-xs">
          <div className="manga-bubble p-2.5 bg-white text-[11px] font-bold text-slate-800">
            <div className="flex items-center gap-1.5 text-blue-600 mb-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider font-mono text-[10px]">Proctorial Note</span>
            </div>
            <p className="font-normal text-slate-600 text-[10px] leading-snug">
              Every filed grievance is assigned an immutable tracking hash and review deadline.
            </p>
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1">
            <span>MITS-GMS PORTAL</span>
            <span>VER 2.6.4</span>
          </div>
        </div>
      </aside>
    </>
  );
}

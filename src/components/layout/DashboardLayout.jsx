import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
  chapter = 'PANEL // 01',
  breadcrumbs = []
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 relative">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />

      <div className="flex-1 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 flex flex-col justify-between relative">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Page Header (if title or actions exist) */}
            {(title || actions || breadcrumbs.length > 0) && (
              <div className="bg-white border-2 border-slate-900 rounded-sm p-5 shadow-[3px_3px_0px_#0f172a] relative overflow-hidden">
                {/* Background Halftone Pattern */}
                <div className="absolute inset-0 manga-halftone pointer-events-none" />

                <div className="relative z-10">
                  {breadcrumbs.length > 0 && (
                    <nav className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 mb-2">
                      {breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={idx}>
                          {idx > 0 && <span className="text-slate-400">/</span>}
                          {crumb.href ? (
                            <a href={crumb.href} className="hover:text-blue-600 transition-colors">
                              {crumb.label}
                            </a>
                          ) : (
                            <span className="text-slate-900">{crumb.label}</span>
                          )}
                        </React.Fragment>
                      ))}
                    </nav>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-block text-[10px] font-black font-mono bg-blue-600 text-white px-2 py-0.5 rounded-xs border border-slate-900 shadow-[1px_1px_0px_#000] mb-1">
                        {chapter}
                      </div>
                      {title && (
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase font-mono">
                          {title}
                        </h1>
                      )}
                      {subtitle && (
                        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                          {subtitle}
                        </p>
                      )}
                    </div>
                    {actions && (
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        {actions}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {children}
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );
}

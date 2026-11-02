import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import SubmitComplaintView from './components/SubmitComplaintView';
import MyTicketsView from './components/MyTicketsView';
import CommunityFeedView from './components/CommunityFeedView';
import AnalyticsView from './components/AnalyticsView';
import TicketDetailModal from './components/TicketDetailModal';
import AnonymousTrackerModal from './components/AnonymousTrackerModal';
import AIChatbotWidget from './components/AIChatbotWidget';
import Toast from './components/Toast';

import AuthorityInboxView from './components/AuthorityInboxView';
import AdminDashboardView from './components/AdminDashboardView';
import AdminAddAccountView from './components/AdminAddAccountView';
import StudentManagementView from './components/StudentManagementView';
import AdminComplaintsView from './components/AdminComplaintsView';
import FacultyDirectoryView from './components/FacultyDirectoryView';

function MainLayout() {
  const { currentUser, activeTab } = useApp();

  // If user is not logged in, render the authentic AMS MITS-style Login View
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#080e1a] text-slate-100 flex flex-col justify-between">
        <Header />
        <main className="flex-1 flex flex-col justify-center">
          <LoginView />
        </main>
        <AnonymousTrackerModal />
        <AIChatbotWidget />
        <Toast />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080e1a] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Content View */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          currentUser?.role === 'admin' ? (
            <AdminDashboardView />
          ) : currentUser?.role === 'authority' ? (
            <AuthorityInboxView />
          ) : (
            <DashboardView />
          )
        )}
        {activeTab === 'authority_inbox' && <AuthorityInboxView />}
        {activeTab === 'admin_dashboard' && <AdminDashboardView />}
        {activeTab === 'admin_add_account' && <AdminAddAccountView />}
        {activeTab === 'student_management' && <StudentManagementView />}
        {activeTab === 'admin_complaints' && <AdminComplaintsView />}
        {activeTab === 'submit' && <SubmitComplaintView />}
        {activeTab === 'my_tickets' && <MyTicketsView />}
        {activeTab === 'community' && <CommunityFeedView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'authorities' && <FacultyDirectoryView />}
        {activeTab === 'faculty' && <FacultyDirectoryView />}
        {activeTab === 'login' && <LoginView />}
      </main>

      {/* Footer */}
      <footer className="bg-[#0b1322] border-t border-slate-800 mt-12 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <img 
              src="/images/mits.png" 
              alt="MITS Gwalior" 
              className="h-8 w-8 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <p className="font-semibold text-slate-200">
                Madhav Institute of Technology & Science, Gwalior (M.P.), India
              </p>
              <p className="text-[11px] text-slate-500">
                Deemed to be University • NAAC Accredited with A++ Grade
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400 space-y-0.5">
            <p className="font-semibold text-blue-400">
              GMS — Grievance Management System
            </p>
            <p className="text-slate-400">
              Presented by: <span className="font-semibold text-slate-300">Puneet Chaudhary (BTMC25O1109)</span> & <span className="font-semibold text-slate-300">Stuti Jain (BTMC25O1139)</span>
            </p>
            <p className="text-slate-500">
              Under Guidance of: <span className="font-semibold text-slate-300">Prof. Monika Dandotiya</span> (Mathematics and Computing)
            </p>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <TicketDetailModal />
      <AnonymousTrackerModal />
      <AIChatbotWidget />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

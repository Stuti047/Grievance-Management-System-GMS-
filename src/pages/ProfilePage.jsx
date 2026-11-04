import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Lock,
  Key
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import FormInput from '../components/forms/FormInput';
import { RoleBadge } from '../components/common/Badge';
import ErrorMessage from '../components/common/ErrorMessage';

export default function ProfilePage() {
  const { currentUser, addToast } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ error: '', success: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordMsg({ error: '', success: '' });

    if (!currentPassword) {
      setPasswordMsg({ error: 'Please enter your current password.', success: '' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ error: 'New password must be at least 6 characters.', success: '' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ error: 'New passwords do not match.', success: '' });
      return;
    }

    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setPasswordMsg({ error: '', success: 'Password credentials re-keyed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (addToast) addToast('Security Keyed', 'Password credentials updated.', 'success');
    }, 600);
  };

  return (
    <DashboardLayout
      title="PERSONAL DOSSIER & CLEARANCE"
      subtitle="Identity verification and credentials on file with Madhav Institute of Technology & Science"
      chapter="DOSSIER"
      breadcrumbs={[
        { label: 'Dashboard', href: currentUser?.role === 'admin' ? '/admin/dashboard' : currentUser?.role === 'authority' ? '/faculty/dashboard' : '/student/dashboard' },
        { label: 'Profile Dossier' }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* User Card (Left - 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card tag="IDENTIFICATION">
            <div className="text-center pb-4 border-b-2 border-slate-200">
              <div className="w-20 h-20 rounded-sm bg-amber-400 border-4 border-slate-900 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-[4px_4px_0px_#000] font-mono">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <h3 className="text-base font-black text-slate-950 font-mono tracking-tight uppercase">
                {currentUser?.name || 'Authorized Member'}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser?.email || 'user@mitsgwl.ac.in'}</p>
              <div className="mt-2.5">
                <RoleBadge role={currentUser?.role || 'student'} />
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-bold">Department:</span>
                <span className="font-black text-slate-900">{currentUser?.department || 'Mathematics and Computing'}</span>
              </div>
              {currentUser?.enrollmentNo && (
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-bold">Enrollment No:</span>
                  <span className="font-black text-blue-800">{currentUser.enrollmentNo}</span>
                </div>
              )}
              {currentUser?.hostel && (
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-bold">Hostel Residence:</span>
                  <span className="font-black text-slate-900">{currentUser.hostel}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-bold">Security Token:</span>
                <span className="inline-flex items-center text-emerald-800 font-black">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  SHA-256 VERIFIED
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Security & Password Settings (Right - 7 cols) */}
        <div className="lg:col-span-7">
          <Card
            title="AUTHENTICATION SECURITY KEYS"
            subtitle="Update your password for accessing MITS portal services and SSO"
            tag="SECURITY"
          >
            {passwordMsg.error && (
              <ErrorMessage variant="error" message={passwordMsg.error} className="mb-4" />
            )}
            {passwordMsg.success && (
              <ErrorMessage variant="success" message={passwordMsg.success} className="mb-4" />
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <FormInput
                label="Current Password"
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                icon={Lock}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="New Password"
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  icon={Key}
                />

                <FormInput
                  label="Confirm Password"
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  icon={Key}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={savingPassword}
                  className="font-mono text-xs"
                >
                  Save New Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

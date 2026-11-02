import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  UserPlus,
  ShieldCheck,
  Building,
  Mail,
  User,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BadgeCheck,
  KeyRound,
  ShieldAlert,
  Award
} from 'lucide-react';

export default function AdminAddAccountView() {
  const { createAuthority, subAuthorities } = useApp();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    sub_authority_id: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAccount, setCreatedAccount] = useState(null);

  // Helper to extract initials from name
  const getInitials = (name) => {
    if (!name || !name.trim()) return 'AO';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Find selected sub-authority object
  const selectedSubAuth = useMemo(() => {
    if (!formData.sub_authority_id || !subAuthorities) return null;
    return subAuthorities.find(s => s.id === formData.sub_authority_id) || null;
  }, [formData.sub_authority_id, subAuthorities]);

  // Validation function
  const validate = (values) => {
    const errs = {};

    if (!values.name || !values.name.trim()) {
      errs.name = 'Full name is required.';
    } else if (values.name.trim().length < 3) {
      errs.name = 'Name must be at least 3 characters.';
    }

    if (!values.email || !values.email.trim()) {
      errs.email = 'Official college email is required.';
    } else {
      const clean = values.email.trim().toLowerCase();
      if (!clean.endsWith('@mitsgwalior.in')) {
        errs.email = 'Email must end with official institute domain @mitsgwalior.in';
      } else if (!clean.includes('@') || clean.split('@')[0].length < 2) {
        errs.email = 'Please provide a valid mailbox name before @mitsgwalior.in';
      }
    }

    if (!values.sub_authority_id) {
      errs.sub_authority_id = 'Please assign a designated sub-authority / department.';
    }

    return errs;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(validate(formData));
  };

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (touched[field]) {
      setErrors(validate(updated));
    }
  };

  // Quick email helper button
  const handleDomainQuickFill = () => {
    if (!formData.email) {
      handleChange('email', '@mitsgwalior.in');
    } else if (!formData.email.includes('@')) {
      handleChange('email', `${formData.email.trim()}@mitsgwalior.in`);
    } else {
      const prefix = formData.email.split('@')[0];
      handleChange('email', `${prefix}@mitsgwalior.in`);
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setTouched({
      name: true,
      email: true,
      designation: true,
      sub_authority_id: true
    });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        college_email: formData.email.trim().toLowerCase(),
        sub_authority_id: formData.sub_authority_id,
        designation: formData.designation.trim() || 'Authority Officer'
      };

      const success = await createAuthority(payload);
      if (success) {
        setCreatedAccount({
          ...payload,
          subAuthorityName: selectedSubAuth?.name || 'Department Officer',
          section: selectedSubAuth?.section || 'college',
          createdAt: new Date().toISOString()
        });

        // Reset form
        setFormData({
          name: '',
          email: '',
          designation: '',
          sub_authority_id: ''
        });
        setTouched({});
        setErrors({});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setCreatedAccount(null);
    setFormData({
      name: '',
      email: '',
      designation: '',
      sub_authority_id: ''
    });
    setTouched({});
    setErrors({});
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">
      
      {/* ─── Manga-Inspired Header Banner ─────────────────────────────────── */}
      <div className="bg-[#0b1424] rounded-2xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute inset-0 manga-halftone opacity-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-widest bg-blue-900/60 text-blue-300 border border-blue-700/60">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                MITS // CENTRAL GOVERNANCE & ACCESS
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Official Account Provisioning
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase">
              Provision Authority & Admin Accounts
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Create departmental authority credentials for MITS faculty, hostel wardens, and mess committee officers. Enforces institutional email validation on the <strong>@mitsgwalior.in</strong> domain.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-[#080e1a] text-blue-300 text-xs font-mono font-bold border border-slate-800 flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
              <span>@mitsgwalior.in domain verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── Success Notification Banner (If Just Created) ─────────────────── */}
      {createdAccount && (
        <div className="bg-emerald-950/30 border border-emerald-700/60 rounded-2xl p-5 sm:p-6 shadow-md animate-in fade-in zoom-in-95 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm border border-emerald-400/40">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-emerald-900/80 text-emerald-300 border border-emerald-700">
                  Account Activated
                </span>
                <h3 className="text-base sm:text-lg font-black text-white mt-1 uppercase">
                  Authority Account Successfully Provisioned!
                </h3>
                <p className="text-xs text-emerald-300">
                  The designated officer can immediately sign in using their institutional email.
                </p>
              </div>
            </div>

            <button
              onClick={handleCreateAnother}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Provision Another</span>
            </button>
          </div>

          {/* Account Details Receipt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#080e1a] p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] font-mono uppercase font-bold">Officer Name</span>
              <strong className="text-white font-bold">{createdAccount.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-mono uppercase font-bold">Official Email</span>
              <span className="font-mono font-bold text-blue-400">{createdAccount.college_email}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-mono uppercase font-bold">Designation</span>
              <span className="text-slate-300 font-semibold">{createdAccount.designation}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-mono uppercase font-bold">Assigned Department</span>
              <span className="text-emerald-400 font-bold">{createdAccount.subAuthorityName}</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Two-Column Layout: Form (Left) & Live Preview (Right) ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── Form Card (Left 7 Cols) ───────────────────────────────────────── */}
        <div className="lg:col-span-7 bg-[#0b1424] rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-7 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-400" />
              <span>Authority Registration Details</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter official college personnel data. Fields marked with an asterisk (<span className="text-rose-400">*</span>) are mandatory.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
            
            {/* Field 1: Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Official Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. Dr. S. K. Sharma / Prof. Monika Dandotiya"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`w-full pl-10 pr-4 py-3 bg-[#080e1a] border rounded-xl text-xs sm:text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                    touched.name && errors.name
                      ? 'border-rose-500 focus:ring-rose-500 bg-rose-950/20'
                      : 'border-slate-700 focus:border-blue-400 focus:ring-blue-400'
                  }`}
                />
              </div>
              {touched.name && errors.name ? (
                <p className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </p>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Include honorifics (Dr., Prof., Er.) if applicable.
                </p>
              )}
            </div>

            {/* Field 2: Email */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                  College Email Address <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleDomainQuickFill}
                  className="text-[11px] font-mono font-bold text-blue-400 hover:text-blue-300 underline transition-colors cursor-pointer"
                >
                  + Add @mitsgwalior.in
                </button>
              </div>

              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  placeholder="e.g. warden.bh1@mitsgwalior.in"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full pl-10 pr-4 py-3 bg-[#080e1a] border rounded-xl text-xs sm:text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                    touched.email && errors.email
                      ? 'border-rose-500 focus:ring-rose-500 bg-rose-950/20'
                      : 'border-slate-700 focus:border-blue-400 focus:ring-blue-400'
                  }`}
                />
              </div>

              {touched.email && errors.email ? (
                <p className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-blue-400 font-semibold">
                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                    Must end in @mitsgwalior.in
                  </span>
                  <span className="text-slate-500 font-mono">@mitsgwalior.in</span>
                </div>
              )}
            </div>

            {/* Field 3: Designation / Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Designation / Official Title
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. Chief Warden (BH-1) / Associate Professor / Estate Officer"
                  value={formData.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#080e1a] border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Displayed on grievance resolution notes and audit history logs.
              </p>
            </div>

            {/* Field 4: Sub-Authority Assignment */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Sub-Authority / Department Assignment <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <select
                  value={formData.sub_authority_id}
                  onChange={(e) => handleChange('sub_authority_id', e.target.value)}
                  onBlur={() => handleBlur('sub_authority_id')}
                  className={`w-full pl-10 pr-4 py-3 bg-[#080e1a] border rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                    touched.sub_authority_id && errors.sub_authority_id
                      ? 'border-rose-500 focus:ring-rose-500 bg-rose-950/20'
                      : 'border-slate-700 focus:border-blue-400 focus:ring-blue-400'
                  }`}
                >
                  <option value="" className="bg-[#0b1424] text-slate-400">-- Select Department / Sub-Authority --</option>
                  {subAuthorities && subAuthorities.map(sub => (
                    <option key={sub.id} value={sub.id} className="bg-[#0b1424] text-white">
                      {sub.name} [{sub.section?.toUpperCase()}]
                    </option>
                  ))}
                </select>
              </div>

              {touched.sub_authority_id && errors.sub_authority_id ? (
                <p className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.sub_authority_id}
                </p>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Determines which categories of grievances this authority will receive and review.
                </p>
              )}
            </div>

            {/* Submit Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                <span>Zero-password OTP sign-in ready</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ name: '', email: '', designation: '', sub_authority_id: '' });
                    setErrors({});
                    setTouched({});
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Clear
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-blue-900/30 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 border border-blue-400/30"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Provisioning Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Provision Account</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* ── Live Preview Card (Right 5 Cols) ──────────────────────────────── */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Credential Card Preview</span>
            </h3>
            <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
              REAL-TIME RENDER
            </span>
          </div>

          {/* MITS Institutional ID Card Visual (Manga Tech Badge) */}
          <div className="bg-[#0b1424] rounded-2xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden space-y-5">
            <div className="absolute inset-0 manga-halftone opacity-25 pointer-events-none" />

            {/* Header: Institute Identification */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center font-black text-xs text-blue-300">
                  MITS
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
                    MITS Gwalior (M.P.)
                  </p>
                  <p className="text-[11px] font-semibold text-slate-300">
                    Authority Grievance Officer
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700 uppercase tracking-wider">
                ACTIVE
              </span>
            </div>

            {/* Officer Profile Live Display */}
            <div className="flex items-center gap-4 relative z-10">
              {/* Initials Avatar Box */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-lg border-2 border-blue-400/40 shrink-0">
                {getInitials(formData.name)}
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <h4 className="text-base sm:text-lg font-black text-white truncate leading-tight">
                  {formData.name.trim() || 'Officer / Faculty Name'}
                </h4>
                <p className="text-xs text-blue-300 font-semibold truncate">
                  {formData.designation.trim() || 'Official Designation / Title'}
                </p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                    ROLE: AUTHORITY
                  </span>
                  {selectedSubAuth && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-amber-950/80 text-amber-300 border border-amber-800 uppercase">
                      {selectedSubAuth.section}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Credential Data Blocks */}
            <div className="bg-[#080e1a] rounded-xl p-3.5 border border-slate-800 space-y-2 text-xs relative z-10">
              <div className="flex justify-between items-center py-0.5 border-b border-slate-800/80">
                <span className="text-[11px] text-slate-400">Institutional Email:</span>
                <span className="font-mono text-[11px] text-blue-300 font-bold truncate max-w-[200px]">
                  {formData.email.trim() || 'officer@mitsgwalior.in'}
                </span>
              </div>

              <div className="flex justify-between items-center py-0.5 border-b border-slate-800/80">
                <span className="text-[11px] text-slate-400">Assigned Branch:</span>
                <span className="font-bold text-slate-200 text-right truncate max-w-[190px]">
                  {selectedSubAuth ? selectedSubAuth.name : 'Unassigned Branch'}
                </span>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-[11px] text-slate-400">Security Clearance:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                  <BadgeCheck className="w-3.5 h-3.5" /> FSM Resolution Officer
                </span>
              </div>
            </div>

            {/* Bottom Bar: Institutional Validation Seal */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 relative z-10">
              <span className="tracking-wide">GMS GOVERNANCE CELL</span>
              <span className="font-mono text-blue-400">@mitsgwalior.in VERIFIED</span>
            </div>

          </div>

          {/* Institutional Advisory Notice */}
          <div className="p-4 rounded-xl bg-[#080e1a] border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <h4 className="font-bold flex items-center gap-1.5 text-blue-300">
              <Award className="w-4 h-4 text-blue-400" />
              Administrative Governance Rules:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 leading-relaxed">
              <li>Authority officers can transition complaint statuses according to the FSM workflow.</li>
              <li>Authorities can log confidential internal notes hidden from students.</li>
              <li>Only official <strong>@mitsgwalior.in</strong> emails are authorized for authority roles.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}

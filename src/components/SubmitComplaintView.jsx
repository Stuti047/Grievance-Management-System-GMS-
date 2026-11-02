import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import api from '../api';
import { 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  UploadCloud, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Lock, 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  ThumbsUp, 
  MapPin, 
  Info, 
  Clock, 
  UserCheck, 
  RefreshCw, 
  ExternalLink,
  Zap
} from 'lucide-react';

/**
 * Section color-coding badge metadata
 */
const SECTION_META = {
  hostel: {
    label: 'Hostel Block',
    badge: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
    dot: 'bg-purple-400'
  },
  mess: {
    label: 'Mess & Dining',
    badge: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
    dot: 'bg-amber-400'
  },
  college: {
    label: 'College Campus',
    badge: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
    dot: 'bg-blue-400'
  }
};

export default function SubmitComplaintView() {
  const { 
    currentUser, 
    categories = [], 
    subAuthorities = [], 
    createGrievance, 
    fetchGrievances, 
    addToast, 
    setActiveTab,
    toggleSupport,
    chatbotPrefillData,
    setChatbotPrefillData,
    setIsChatbotOpen
  } = useApp();

  // Wizard Step: 1 = Details, 2 = Review, 3 = Done
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [categoryId, setCategoryId] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]); // Array<{ id, name, size, type, dataUrl }>

  // UI & Validation State
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdGrievance, setCreatedGrievance] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Duplicate Detection State
  const [duplicates, setDuplicates] = useState([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [dismissDuplicates, setDismissDuplicates] = useState(false);

  const fileInputRef = useRef(null);

  // Initialize default category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  // Support AI Chatbot draft prefill if available
  useEffect(() => {
    if (chatbotPrefillData) {
      if (chatbotPrefillData.title) setTitle(chatbotPrefillData.title);
      if (chatbotPrefillData.description) setDescription(chatbotPrefillData.description);
      if (chatbotPrefillData.location) setLocation(chatbotPrefillData.location);
      if (chatbotPrefillData.category) {
        const found = categories.find(c => 
          c.name.toLowerCase().includes(chatbotPrefillData.category.toLowerCase()) ||
          c.id === chatbotPrefillData.category
        );
        if (found) setCategoryId(found.id);
      }
      if (chatbotPrefillData.is_anonymous !== undefined) {
        setIsAnonymous(Boolean(chatbotPrefillData.is_anonymous));
      }

      if (addToast) {
        addToast('Draft Applied', 'Grievance details prefilled from GMS Assistant.', 'info');
      }
      if (setChatbotPrefillData) {
        setChatbotPrefillData(null);
      }
    }
  }, [chatbotPrefillData, categories, addToast, setChatbotPrefillData]);

  // 400ms Debounced Duplicate Detection
  useEffect(() => {
    if (dismissDuplicates) return;

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 10) {
      setDuplicates([]);
      setIsCheckingDuplicates(false);
      return;
    }

    setIsCheckingDuplicates(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const res = await api.grievances.getDuplicates(trimmedTitle, description.trim(), categoryId);
        if (res && Array.isArray(res.duplicates)) {
          setDuplicates(res.duplicates);
        } else {
          setDuplicates([]);
        }
      } catch (err) {
        console.error('Duplicate detection check error:', err);
        setDuplicates([]);
      } finally {
        setIsCheckingDuplicates(false);
      }
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [title, description, categoryId, dismissDuplicates]);

  // Lookups for selected category & sub-authority
  const selectedCategory = categories.find(c => c.id === categoryId) || categories[0] || null;
  const selectedSubAuthority = subAuthorities.find(s => s.id === selectedCategory?.sub_authority_id) || null;
  const sectionMeta = SECTION_META[selectedCategory?.section] || SECTION_META.college;

  // Validation logic
  const validateForm = () => {
    const errs = {};
    if (!categoryId) {
      errs.categoryId = 'Please select a grievance category.';
    }
    if (!title.trim()) {
      errs.title = 'Title is required.';
    } else if (title.trim().length < 10) {
      errs.title = `Title must be at least 10 characters (${title.trim().length}/10 entered).`;
    }

    if (!description.trim()) {
      errs.description = 'Description is required.';
    } else if (description.trim().length < 30) {
      errs.description = `Description must be at least 30 characters (${description.trim().length}/30 entered).`;
    }

    if (!location.trim()) {
      errs.location = 'Please specify the campus location (e.g., Hostel Block/Room or Academic Wing).';
    }

    return errs;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(validateForm());
  };

  // Step 1 -> Step 2
  const handleProceedToReview = (e) => {
    e.preventDefault();
    setTouched({
      categoryId: true,
      title: true,
      description: true,
      location: true
    });

    const errs = validateForm();
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      addToast?.('Incomplete Form', 'Please fix the highlighted fields before proceeding.', 'warning');
      return;
    }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // File upload handler (max 3 files, converts to Data URL)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (evidenceFiles.length + files.length > 3) {
      addToast?.('Upload Limit Exceeded', 'You can attach a maximum of 3 evidence files.', 'warning');
      return;
    }

    files.forEach(file => {
      // 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        addToast?.('File Too Large', `"${file.name}" exceeds 5MB size limit.`, 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setEvidenceFiles(prev => {
          if (prev.length >= 3) return prev;
          return [
            ...prev,
            {
              id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name: file.name,
              size: file.size,
              type: file.type,
              dataUrl: event.target.result
            }
          ];
        });
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId) => {
    setEvidenceFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Final submit handler
  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId,
        location: location.trim(),
        is_anonymous: Boolean(isAnonymous),
        evidence_urls: evidenceFiles.map(f => f.dataUrl)
      };

      const result = await createGrievance(payload);

      if (result) {
        setCreatedGrievance(result);
        setCurrentStep(3);
        if (fetchGrievances) {
          fetchGrievances();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Submission failed:', err);
      addToast?.('Submission Error', 'An unexpected error occurred while filing the grievance.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy token to clipboard
  const handleCopyToken = (token) => {
    if (!token) return;
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(token);
      } else {
        const ta = document.createElement('textarea');
        ta.value = token;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedToken(true);
      addToast?.('Token Copied', 'Secret tracking token copied to clipboard.', 'success');
      setTimeout(() => setCopiedToken(false), 2500);
    } catch {
      addToast?.('Copy Error', 'Please select and copy the token manually.', 'warning');
    }
  };

  // Handle "Support Instead" for duplicate tickets
  const handleSupportInstead = async (duplicateTicket) => {
    try {
      if (toggleSupport) {
        await toggleSupport(duplicateTicket.id);
      } else {
        await api.grievances.toggleSupport(duplicateTicket.id);
      }
      addToast?.(
        'Supported Existing Grievance',
        `Endorsement recorded for ${duplicateTicket.grievance_code}. Redirecting to feed...`,
        'success'
      );
      if (setActiveTab) {
        setActiveTab('community');
      }
    } catch (err) {
      console.error('Failed to support duplicate:', err);
      addToast?.('Error', 'Unable to record support at this moment.', 'error');
    }
  };

  // Reset form to file another grievance
  const handleResetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setIsAnonymous(false);
    setEvidenceFiles([]);
    setErrors({});
    setTouched({});
    setDuplicates([]);
    setDismissDuplicates(false);
    setCreatedGrievance(null);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-3.5 sm:px-6">
      
      {/* ─── Manga-Inspired Institutional Header Banner ─── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-widest bg-blue-900/60 text-blue-300 border border-blue-700/60 shadow-xs">
              MITS // GMS-INTAKE
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Official Grievance Registration Pipeline
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Lodge Student Grievance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
            Submit issues directly into the automated SLA governance pipeline. Every step is cryptographically audited and routed to designated university authorities.
          </p>
        </div>

        {/* AI Guide Assistant Shortcut Button */}
        {setIsChatbotOpen && (
          <button
            type="button"
            onClick={() => setIsChatbotOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white text-xs font-bold shadow-md shadow-blue-950/50 hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer self-start md:self-auto shrink-0 border border-blue-400/30"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
            <span>Ask GMS Assistant</span>
          </button>
        )}
      </div>

      {/* ─── Step Indicators (Manga Tech Stepper) ─── */}
      <div className="mb-8 bg-[#0b1424] rounded-2xl border border-slate-800 shadow-lg p-4 sm:p-5 relative overflow-hidden">
        <div className="absolute inset-0 manga-halftone opacity-30 pointer-events-none" />
        <div className="grid grid-cols-3 gap-2 sm:gap-4 relative z-10">
          
          {/* Step 1: Details */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 transition-colors border ${
              currentStep === 1
                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30 ring-2 ring-blue-500/20'
                : currentStep > 1
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}>
              {currentStep > 1 ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : '1'}
            </div>
            <div className="min-w-0">
              <p className={`text-xs sm:text-sm font-black truncate uppercase tracking-wide ${currentStep === 1 ? 'text-blue-400' : 'text-slate-300'}`}>
                1. Details
              </p>
              <p className="text-[10px] text-slate-500 hidden sm:block truncate">
                Context & Evidence
              </p>
            </div>
          </div>

          {/* Connector Line / Step 2: Review */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 transition-colors border ${
              currentStep === 2
                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30 ring-2 ring-blue-500/20'
                : currentStep > 2
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}>
              {currentStep > 2 ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : '2'}
            </div>
            <div className="min-w-0">
              <p className={`text-xs sm:text-sm font-black truncate uppercase tracking-wide ${currentStep === 2 ? 'text-blue-400' : 'text-slate-300'}`}>
                2. Review
              </p>
              <p className="text-[10px] text-slate-500 hidden sm:block truncate">
                Verify & SLA Route
              </p>
            </div>
          </div>

          {/* Step 3: Done */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 transition-colors border ${
              currentStep === 3
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/20'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}>
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className={`text-xs sm:text-sm font-black truncate uppercase tracking-wide ${currentStep === 3 ? 'text-emerald-400' : 'text-slate-300'}`}>
                3. Done
              </p>
              <p className="text-[10px] text-slate-500 hidden sm:block truncate">
                Ticket & Tracking Key
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          STEP 1: DETAILS INTAKE FORM
         ───────────────────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <form onSubmit={handleProceedToReview} className="space-y-6">
          <div className="bg-[#0b1424] rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-7 space-y-6">
            
            {/* Category Selector & Auto-Routing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="category-select" className="block text-xs font-black text-slate-300 uppercase tracking-widest">
                  Grievance Category *
                </label>
                {selectedCategory && (
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border inline-flex items-center gap-1.5 ${sectionMeta.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sectionMeta.dot}`} />
                    {sectionMeta.label}
                  </span>
                )}
              </div>

              <select
                id="category-select"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  if (errors.categoryId) setErrors(prev => ({ ...prev, categoryId: null }));
                }}
                onBlur={() => handleBlur('categoryId')}
                className="w-full px-4 py-3 bg-[#080e1a] border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#0b1424] text-white">
                    {cat.name} — [SLA: {cat.sla_hours}h] ({cat.section?.toUpperCase()})
                  </option>
                ))}
              </select>

              {errors.categoryId && (
                <p className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.categoryId}
                </p>
              )}

              {/* Auto-Routing Information Box */}
              {selectedCategory && (
                <div className="mt-2.5 p-3 rounded-xl bg-blue-950/40 border border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-blue-300 font-semibold">
                    <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>
                      Routed directly to:{' '}
                      <strong className="font-extrabold text-blue-100">
                        {selectedSubAuthority?.name || 'Designated Administrative Authority'}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-200 text-[11px] font-bold bg-[#080e1a] px-2.5 py-1 rounded-lg border border-blue-800/80 shrink-0 self-start sm:self-auto">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Resolution SLA: {selectedCategory.sla_hours} hours</span>
                  </div>
                </div>
              )}
            </div>

            {/* Anonymous Toggle & Privacy Explanation Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#080e1a] border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    Reporter Identity & Anonymity Mode
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Choose whether this submission is linked to your student credentials or filed under Zero-Knowledge Anonymity.
                  </p>
                </div>

                {/* Anonymous Toggle Switch */}
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <span className={`text-xs font-bold ${!isAnonymous ? 'text-blue-400' : 'text-slate-500'}`}>
                    Verified
                  </span>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isAnonymous}
                    onClick={() => setIsAnonymous(prev => !prev)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isAnonymous ? 'bg-amber-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isAnonymous ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  <span className={`text-xs font-bold ${isAnonymous ? 'text-amber-400' : 'text-slate-500'}`}>
                    Anonymous
                  </span>
                </div>
              </div>

              {/* Verified Mode Identity Pill */}
              {!isAnonymous && currentUser && (
                <div className="p-2.5 rounded-xl bg-[#0b1424] border border-slate-800 flex items-center gap-2.5 text-xs text-slate-300">
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Lodging as verified student:{' '}
                    <strong className="text-white">{currentUser.name}</strong> ({currentUser.college_email || currentUser.email})
                  </span>
                </div>
              )}

              {/* Anonymous Slide-In Privacy Explanation Box */}
              {isAnonymous && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-700/60 text-amber-200 space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-300">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Zero-Knowledge Student Protection Policy</span>
                  </div>
                  <ul className="text-[11px] leading-relaxed text-amber-200/90 list-disc list-inside space-y-1">
                    <li>
                      <strong>Complete Identity Redaction:</strong> Your name, roll number, and college email are stripped from all public feeds and assigned authorities.
                    </li>
                    <li>
                      <strong>Stored Securely for Moderation:</strong> Author records are encrypted and held strictly under proctorial supervision solely to prevent abuse, hate speech, or harassment.
                    </li>
                    <li>
                      <strong>One-Time Secret Key:</strong> A cryptographic tracking token will be issued upon lodging. Keep it safe to view status updates and authority responses.
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Title Field & Duplicate Check */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="grievance-title" className="block text-xs font-black text-slate-300 uppercase tracking-widest">
                  Grievance Title *
                </label>
                <span className={`text-[11px] font-mono font-medium ${
                  title.trim().length >= 10 ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {title.trim().length}/10 chars min
                </span>
              </div>

              <input
                id="grievance-title"
                type="text"
                placeholder="e.g. Broken water purifier in Boys Hostel 1 2nd floor bathroom"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDismissDuplicates(false);
                  if (errors.title) setErrors(prev => ({ ...prev, title: null }));
                }}
                onBlur={() => handleBlur('title')}
                className={`w-full px-4 py-3 bg-[#080e1a] border rounded-xl text-xs sm:text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                  errors.title && touched.title
                    ? 'border-rose-500 focus:ring-rose-500 bg-rose-950/20'
                    : 'border-slate-700 focus:border-blue-400 focus:ring-blue-400'
                }`}
              />

              {errors.title && touched.title && (
                <p className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.title}
                </p>
              )}

              {/* Debounce Checking Indicator */}
              {isCheckingDuplicates && (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>Scanning existing campus tickets for duplicates...</span>
                </div>
              )}

              {/* Similar Open Grievances Panel (Manga Warning Style) */}
              {!dismissDuplicates && duplicates.length > 0 && (
                <div className="mt-3 p-4 rounded-2xl bg-amber-950/40 border border-amber-600/70 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Similar Open Grievances Detected ({duplicates.length})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDismissDuplicates(true)}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-200 underline cursor-pointer"
                    >
                      Dismiss & Continue
                    </button>
                  </div>

                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    A similar issue might already be reported and under investigation. Supporting an existing ticket increases its priority without fragmenting authority attention.
                  </p>

                  <div className="grid grid-cols-1 gap-2.5 pt-1">
                    {duplicates.map((dup) => (
                      <div 
                        key={dup.id}
                        className="p-3 bg-[#0b1424] rounded-xl border border-amber-600/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400/60 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {dup.grievance_code}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                              {dup.status}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 inline-flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3 text-slate-500" />
                              {dup.supports_count} supporters
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white truncate">
                            {dup.title}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSupportInstead(dup)}
                          className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Support Instead</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description Textarea with Char Counter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="grievance-description" className="block text-xs font-black text-slate-300 uppercase tracking-widest">
                  Detailed Description *
                </label>
                <span className={`text-[11px] font-mono font-medium ${
                  description.trim().length >= 30 ? 'text-emerald-400 font-bold' : 'text-slate-500'
                }`}>
                  {description.trim().length}/30 chars min
                </span>
              </div>

              <textarea
                id="grievance-description"
                rows={5}
                placeholder="Clearly state what occurred, when it started, who is affected, and any previous attempts to resolve it. Be specific with equipment names or incident context."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors(prev => ({ ...prev, description: null }));
                }}
                onBlur={() => handleBlur('description')}
                className={`w-full px-4 py-3 bg-[#080e1a] border rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all leading-relaxed ${
                  errors.description && touched.description
                    ? 'border-rose-500 focus:ring-rose-500 bg-rose-950/20'
                    : 'border-slate-700 focus:border-blue-400 focus:ring-blue-400'
                }`}
              />

              {errors.description && touched.description && (
                <p className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Campus Location Field */}
            <div className="space-y-2">
              <label htmlFor="grievance-location" className="block text-xs font-black text-slate-300 uppercase tracking-widest">
                Specific Campus Location *
              </label>

              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="grievance-location"
                  type="text"
                  placeholder="e.g. Boys Hostel 1, 2nd Floor, Room 204 or Central Library Reading Hall"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (errors.location) setErrors(prev => ({ ...prev, location: null }));
                  }}
                  onBlur={() => handleBlur('location')}
                  className={`w-full pl-10 pr-4 py-3 bg-[#080e1a] border rounded-xl text-xs sm:text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                    errors.location && touched.location
                      ? 'border-rose-500 focus:ring-rose-500 bg-rose-950/20'
                      : 'border-slate-700 focus:border-blue-400 focus:ring-blue-400'
                  }`}
                />
              </div>

              {errors.location && touched.location && (
                <p className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.location}
                </p>
              )}
            </div>

            {/* Evidence Upload Section */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-widest">
                    Supporting Evidence (Optional)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Upload photos, screenshots, or PDF receipts (Max 3 files, 5MB each).
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  {evidenceFiles.length}/3 attached
                </span>
              </div>

              {/* Upload Input Area */}
              {evidenceFiles.length < 3 && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-[#080e1a] hover:bg-blue-950/20 rounded-2xl p-6 text-center transition-all cursor-pointer group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-blue-400 mx-auto mb-2 transition-colors" />
                  <p className="text-xs font-bold text-slate-300 group-hover:text-white">
                    Click to browse files or drag and drop here
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Supports JPG, PNG, WEBP, and PDF documents
                  </p>
                </div>
              )}

              {/* Uploaded Files Preview Grid */}
              {evidenceFiles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {evidenceFiles.map((file) => {
                    const isImage = file.type.startsWith('image/') || file.dataUrl?.startsWith('data:image');
                    const sizeKb = Math.round(file.size / 1024);

                    return (
                      <div 
                        key={file.id}
                        className="relative rounded-xl border border-slate-800 bg-[#080e1a] p-2.5 shadow-xs flex items-center sm:flex-col gap-3 group hover:border-slate-700 transition-colors"
                      >
                        {/* Preview Display */}
                        {isImage ? (
                          <div className="w-12 h-12 sm:w-full sm:h-24 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-800">
                            <img 
                              src={file.dataUrl} 
                              alt={file.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 sm:w-full sm:h-24 rounded-lg bg-rose-950/50 border border-rose-900/60 flex flex-col items-center justify-center shrink-0">
                            <FileText className="w-6 h-6 text-rose-400" />
                            <span className="text-[9px] font-bold text-rose-300 uppercase mt-1">PDF Document</span>
                          </div>
                        )}

                        {/* File Details */}
                        <div className="min-w-0 flex-1 sm:w-full">
                          <p className="text-xs font-bold text-white truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`}
                          </p>
                        </div>

                        {/* Remove File Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer shrink-0"
                          title="Remove attachment"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer border border-blue-400/30"
            >
              <span>Continue to Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 2: REVIEW & CONFIRMATION
         ───────────────────────────────────────────────────────────── */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-[#0b1424] rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-7 space-y-6">
            
            <div className="border-b border-slate-800 pb-4">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                STEP 2 OF 3: PRE-SUBMISSION VERIFICATION
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-2 uppercase tracking-tight">
                Verify Grievance Particulars
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Please inspect all details before lodging into the institutional record.
              </p>
            </div>

            {/* Summary Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Category & Section */}
              <div className="p-4 rounded-xl bg-[#080e1a] border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Category & Campus Section
                </span>
                <p className="text-sm font-black text-white">{selectedCategory?.name}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sectionMeta.badge}`}>
                    {sectionMeta.label}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    SLA Window: {selectedCategory?.sla_hours} Hours
                  </span>
                </div>
              </div>

              {/* Designated Sub-Authority Routing */}
              <div className="p-4 rounded-xl bg-[#080e1a] border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Target Authority Dispatch
                </span>
                <p className="text-sm font-black text-white">
                  {selectedSubAuthority?.name || 'Authorized Campus Officer'}
                </p>
                <p className="text-[11px] text-blue-400 font-semibold pt-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  Direct automated ticket assignment
                </p>
              </div>

              {/* Reporting Mode */}
              <div className="p-4 rounded-xl bg-[#080e1a] border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Reporting Mode & Privacy
                </span>
                {isAnonymous ? (
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Zero-Knowledge Shielded Submission</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Standard Verified Student ({currentUser?.name})</span>
                  </div>
                )}
                <p className="text-[11px] text-slate-400">
                  {isAnonymous
                    ? 'Identity stripped from public & officer views; one-time token will be generated.'
                    : 'Trackable through your personal student dashboard.'}
                </p>
              </div>

              {/* Location */}
              <div className="p-4 rounded-xl bg-[#080e1a] border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Incident Campus Location
                </span>
                <p className="text-sm font-black text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{location}</span>
                </p>
              </div>

            </div>

            {/* Grievance Content Box */}
            <div className="p-5 rounded-2xl bg-[#080e1a] border border-slate-800 space-y-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Grievance Title
                </span>
                <h3 className="text-base font-extrabold text-white mt-0.5">
                  {title}
                </h3>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Statement of Complaint
                </span>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Evidence attachments */}
              {evidenceFiles.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Attached Evidence ({evidenceFiles.length} files)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {evidenceFiles.map(f => (
                      <span key={f.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0b1424] border border-slate-700 text-xs font-bold text-slate-300">
                        {f.type.startsWith('image/') ? <ImageIcon className="w-3.5 h-3.5 text-blue-400" /> : <FileText className="w-3.5 h-3.5 text-rose-400" />}
                        <span className="truncate max-w-[150px]">{f.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cryptographic Ledger Stamping Notice */}
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 flex items-start gap-3 text-xs text-blue-300">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-white">Cryptographic Append-Only Ledger Guarantee</p>
                <p className="text-[11px] text-blue-200/80 mt-0.5 leading-relaxed">
                  Upon submission, this grievance is permanently committed to the immutable audit trail with an initial SHA-256 hash. Once registered, no edits or silent deletions can be made by any party.
                </p>
              </div>
            </div>

          </div>

          {/* Step 2 Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Edit</span>
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer border border-blue-400/30"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Registering Grievance on Ledger...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Confirm & Lodge Grievance</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 3: DONE / SUCCESS CARD
         ───────────────────────────────────────────────────────────── */}
      {currentStep === 3 && createdGrievance && (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
          <div className="bg-[#0b1424] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
            
            {/* Success Top Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 manga-halftone opacity-25" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner border border-white/30">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight uppercase">
                  Grievance Lodged Successfully!
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-md mx-auto">
                  Your complaint has been queued for immediate review and assigned an SLA clock.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Grievance Code Display Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#080e1a] border border-slate-800 text-center space-y-1">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  Official Tracking Code
                </span>
                <p className="font-mono text-xl sm:text-2xl font-black text-blue-400 selection:bg-blue-900">
                  {createdGrievance.grievance_code}
                </p>
                <p className="text-[11px] text-slate-400">
                  Target SLA: {createdGrievance.sla_hours || selectedCategory?.sla_hours} hours • Assigned to {selectedSubAuthority?.name}
                </p>
              </div>

              {/* Anonymous Tracking Token Box */}
              {createdGrievance.is_anonymous && (
                <div className="p-5 sm:p-6 rounded-2xl bg-amber-950/30 border-2 border-amber-600/70 text-amber-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide">
                        Secret One-Time Anonymous Tracking Token
                      </h4>
                      <p className="text-[11px] text-amber-300/80">
                        This token is your only credential to view status updates and chat anonymously.
                      </p>
                    </div>
                  </div>

                  {/* Token Copyable Code Box */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-[#080e1a] rounded-xl border border-amber-700/60 shadow-xs">
                    <div className="font-mono text-base sm:text-lg font-black text-amber-300 tracking-wider truncate selection:bg-amber-900">
                      {createdGrievance.tracking_token || 'TRK-TOKEN-MITS'}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyToken(createdGrievance.tracking_token)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 ${
                        copiedToken
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                      }`}
                    >
                      {copiedToken ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Token</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 bg-amber-950/50 rounded-xl text-[11px] text-amber-200 leading-relaxed font-medium border border-amber-800/60">
                    ⚠️ <strong>CRITICAL WARNING:</strong> Please copy and store this token in a safe place immediately. Because your submission is anonymous, it cannot be recovered via email or phone.
                  </div>
                </div>
              )}

              {/* Navigation Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab?.('my_tickets')}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <span>View in My Grievances</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab?.('community')}
                  className="w-full sm:w-auto px-6 py-3 bg-[#080e1a] hover:bg-slate-800 text-blue-400 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
                >
                  <span>Go to Public Feed</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Submit Another</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

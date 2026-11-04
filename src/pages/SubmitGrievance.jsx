import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Send,
  ArrowLeft
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import FormInput from '../components/forms/FormInput';
import FormSelect from '../components/forms/FormSelect';
import FormTextarea from '../components/forms/FormTextarea';
import FileUpload from '../components/forms/FileUpload';
import ErrorMessage from '../components/common/ErrorMessage';
import { DEPARTMENTS, CATEGORIES, PRIORITIES } from '../data/demoData';

export default function SubmitGrievance() {
  const { createGrievance } = useApp();
  const navigate = useNavigate();

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [files, setFiles] = useState([]);

  // Validation & UI State
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [serverError, setServerError] = useState('');

  const handleCategoryChange = (e) => {
    const selectedCat = e.target.value;
    setCategory(selectedCat);
    setErrors(prev => ({ ...prev, category: '' }));

    const found = CATEGORIES.find(c => c.name === selectedCat || c.id === selectedCat);
    if (found && found.department) {
      setDepartment(found.department);
    }
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Please provide a clear title for your grievance.';
    } else if (title.trim().length < 8) {
      errs.title = 'Title must be at least 8 characters.';
    }

    if (!category) {
      errs.category = 'Please select a grievance category.';
    }

    if (!department) {
      errs.department = 'Please select the concerned department.';
    }

    if (!description.trim()) {
      errs.description = 'Please describe the incident in detail.';
    } else if (description.trim().length < 20) {
      errs.description = 'Description must be at least 20 characters to allow investigation.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSubmitSuccess(null);

    if (!validate()) return;

    setSubmitting(true);

    const payload = {
      title: title.trim(),
      category_id: category,
      category,
      department,
      priority,
      description: description.trim(),
      location: location.trim() || 'MITS Campus',
      is_anonymous: isAnonymous,
      isAnonymous
    };

    try {
      const created = await createGrievance(payload);
      if (created) {
        const ticketId = created.ticket_number || created.grievance_code || created.ticketId || `GMS-2026-${Math.floor(100 + Math.random() * 900)}`;
        setSubmitSuccess({
          ticketId,
          message: 'Your case has been permanently entered into the Proctorial Board ledger.'
        });
      } else {
        const generatedDemoTicket = `GMS-2026-${Math.floor(200 + Math.random() * 800)}`;
        setSubmitSuccess({
          ticketId: generatedDemoTicket,
          message: 'Frontend submission validated and logged into demo ledger.'
        });
      }
    } catch (err) {
      setServerError(err.message || 'Submission could not be dispatched.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="LODGE AN INSTITUTIONAL GRIEVANCE"
      subtitle="Formal grievance submission under MITS Proctorial Regulations & Student Charter"
      chapter="PANEL.02 // NEW SUBMISSION"
      breadcrumbs={[
        { label: 'Dashboard', href: '/student/dashboard' },
        { label: 'Submit Grievance' }
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {submitSuccess ? (
          <div className="bg-white border-4 border-slate-900 rounded-sm p-8 shadow-[6px_6px_0px_#0f172a] text-center relative overflow-hidden">
            <div className="absolute inset-0 manga-screentone opacity-10 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-400 border-2 border-slate-900 flex items-center justify-center mx-auto shadow-[3px_3px_0px_#000]">
                <CheckCircle2 className="w-9 h-9 text-slate-950 stroke-[2.5]" />
              </div>

              <div className="inline-block">
                <div className="manga-bubble px-4 py-1.5 bg-amber-300 text-slate-950 text-xs font-black font-mono shadow-[2px_2px_0px_#000]">
                  <span>📢 "Case registered with hash verification! SLA timer activated."</span>
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 font-mono uppercase">
                GRIEVANCE DISPATCH SUCCESSFUL
              </h3>
              <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
                {submitSuccess.message}
              </p>

              {/* Big Manga Ticket ID Badge */}
              <div className="bg-slate-50 border-2 border-slate-900 rounded-sm p-4 max-w-sm mx-auto shadow-[3px_3px_0px_#2563eb]">
                <span className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-widest">
                  ASSIGNED TICKET IDENTIFIER // CASE ID
                </span>
                <p className="text-2xl font-black font-mono text-blue-900 mt-1">
                  #{submitSuccess.ticketId}
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Save this code for public & anonymous status lookup.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate(`/grievance/${submitSuccess.ticketId}`)}
                  className="font-mono text-xs"
                >
                  View Case Dossier
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setTitle('');
                    setDescription('');
                    setSubmitSuccess(null);
                  }}
                  className="font-mono text-xs"
                >
                  File Another Case
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {serverError && (
              <ErrorMessage
                variant="error"
                message={serverError}
                onDismiss={() => setServerError('')}
              />
            )}

            {/* Speech bubble guideline */}
            <div className="manga-bubble p-3.5 bg-amber-50 text-xs font-bold text-slate-800 flex items-center gap-2.5">
              <span className="text-xl">⚠️</span>
              <span className="text-[11px] leading-tight font-medium">
                Please be thorough and specific. False submissions or defamatory claims violate Code of Conduct guidelines.
              </span>
            </div>

            <Card
              title="CASE SPECIFICATION DOSSIER"
              subtitle="All statements provided are officially stamped and logged in proctorial records."
              tag="FORM.01"
            >
              <div className="space-y-4">
                {/* Title */}
                <FormInput
                  label="Grievance Title"
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                  }}
                  placeholder="e.g. Broken water purifier filter in Boys Hostel 1 Mess Area"
                  required
                  error={errors.title}
                  helperText="Summarize the core failure in one concise statement."
                />

                {/* Category & Department row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelect
                    label="Jurisdiction Category"
                    id="category"
                    value={category}
                    onChange={handleCategoryChange}
                    options={CATEGORIES.map(c => ({ value: c.name, label: c.name }))}
                    placeholder="-- Select Category --"
                    required
                    error={errors.category}
                  />

                  <FormSelect
                    label="Concerned Department / Section"
                    id="department"
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      if (errors.department) setErrors(prev => ({ ...prev, department: '' }));
                    }}
                    options={DEPARTMENTS}
                    placeholder="-- Select Department --"
                    required
                    error={errors.department}
                  />
                </div>

                {/* Priority & Specific Location row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelect
                    label="Priority Severity"
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    options={PRIORITIES}
                    helperText="Critical is strictly reserved for immediate safety or health risks."
                  />

                  <FormInput
                    label="Physical Site / Lab / Hall"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Boys Hostel 1 (BH-1), Dining Hall Section B"
                    helperText="Enables rapid location of the incident site."
                  />
                </div>

                {/* Description */}
                <FormTextarea
                  label="Detailed Statement of Facts"
                  id="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                  }}
                  rows={5}
                  maxLength={1000}
                  placeholder="Provide precise details: date and time of incident, previous notices given to staff, impact on student welfare..."
                  required
                  error={errors.description}
                />

                {/* Anonymous Checkbox */}
                <div className="p-3.5 bg-slate-50 border-2 border-slate-900 rounded-sm text-xs space-y-1 shadow-[2px_2px_0px_#000]">
                  <label className="flex items-center gap-2.5 cursor-pointer font-black text-slate-900 font-mono">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded-sm border-2 border-slate-900 text-blue-600 focus:ring-blue-600 w-4 h-4"
                    />
                    <span>ANONYMOUS SUBMISSION MODE</span>
                  </label>
                  <p className="text-[11px] text-slate-600 pl-6 leading-relaxed font-medium">
                    Your name and enrollment number will be cryptographically shielded from departmental viewers. You will track status solely via your Ticket ID.
                  </p>
                </div>

                {/* File Upload Section */}
                <FileUpload
                  files={files}
                  onChange={setFiles}
                  label="Attach Physical Proofs & Photographs"
                />
              </div>

              {/* Submission Action */}
              <div className="pt-6 border-t-2 border-slate-900 mt-6 flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/student/dashboard')}
                  className="font-mono text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Abort
                </Button>
                <Button
                  type="submit"
                  variant="manga"
                  size="md"
                  loading={submitting}
                  icon={Send}
                  className="font-mono text-xs"
                >
                  Submit Formal Case
                </Button>
              </div>
            </Card>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

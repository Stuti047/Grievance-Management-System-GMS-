import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, AlertCircle } from 'lucide-react';

export default function FileUpload({
  label = 'Supporting Documents & Proofs',
  files = [],
  onChange,
  maxFiles = 3,
  maxSizeMB = 5,
  allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'],
  helperText = 'Allowed formats: JPG, PNG, PDF (Max 5MB per file)',
  error,
  className = ''
}) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState('');

  const handleFiles = (incomingFiles) => {
    setFileError('');
    const newFiles = [...files];

    for (let i = 0; i < incomingFiles.length; i++) {
      const file = incomingFiles[i];
      if (newFiles.length >= maxFiles) {
        setFileError(`Maximum ${maxFiles} files allowed.`);
        break;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setFileError(`File "${file.name}" exceeds the ${maxSizeMB}MB limit.`);
        continue;
      }
      newFiles.push(file);
    }

    onChange && onChange(newFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (idx) => {
    const updated = files.filter((_, i) => i !== idx);
    onChange && onChange(updated);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
          {label}
        </label>
      )}

      {/* Manga Drag & Drop Area */}
      <div
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed border-slate-900 rounded-sm p-5 text-center cursor-pointer transition-all ${
          dragActive
            ? 'bg-blue-50 border-blue-600 scale-[0.99]'
            : 'bg-white hover:bg-slate-50 shadow-[2px_2px_0px_#0f172a]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />
        <div className="w-10 h-10 rounded-sm bg-blue-100 border-2 border-slate-900 text-blue-900 mx-auto mb-2 flex items-center justify-center shadow-[1.5px_1.5px_0px_#000]">
          <UploadCloud className="w-5 h-5 stroke-[2.5]" />
        </div>
        <p className="text-xs font-black text-slate-900 uppercase font-mono tracking-wide">
          Drop Artifacts / Documents or Click to Browse
        </p>
        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
          {helperText}
        </p>
      </div>

      {(fileError || error) && (
        <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{fileError || error}</span>
        </p>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <ul className="space-y-1.5 mt-2">
          {files.map((file, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between px-3 py-1.5 rounded-sm bg-slate-50 border-2 border-slate-900 text-xs shadow-[1.5px_1.5px_0px_#000]"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <File className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate text-slate-900 font-bold">{file.name}</span>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  ({(file.size / 1024).toFixed(0)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                className="text-slate-500 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                title="Remove file"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

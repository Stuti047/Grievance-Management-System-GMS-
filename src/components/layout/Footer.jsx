import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#090d16] border-t-2 border-slate-900 text-slate-400 py-6 px-4 sm:px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3 text-left">
          <div className="w-9 h-9 rounded-sm bg-white p-1 border-2 border-slate-900 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#2563eb]">
            <img 
              src="/images/mits.png" 
              alt="MITS Gwalior" 
              className="w-full h-full object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div>
            <p className="font-bold text-slate-200">
              Madhav Institute of Technology & Science, Gwalior (M.P.), India
            </p>
            <p className="text-[11px] text-slate-400">
              Deemed to be University • NAAC A++ Grade • Established in 1957
            </p>
          </div>
        </div>

        <div className="text-center md:text-right space-y-0.5 text-[11px] text-slate-400">
          <p className="text-amber-400 font-bold uppercase tracking-wider">
            Grievance Redressal Mechanism // Official Registry
          </p>
          <p className="text-slate-300">Central Proctorial Board & Dean of Student Welfare (DSW)</p>
          <p className="text-slate-500">Official Helpline: 0751-2409300 • grievance@mitsgwalior.in</p>
        </div>
      </div>
    </footer>
  );
}

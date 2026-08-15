import { useState, useEffect } from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../lib/api';

export default function ConflictLog() {
  const [conflicts, setConflicts] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/conflicts');
        setConflicts(res.data);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Conflict & Priority Log</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Audit trail of all system-resolved booking conflicts via Google OR-Tools CP-SAT.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {conflicts.map(c => (
            <div key={c.id} className="p-6 flex items-start gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-xl shrink-0 mt-1 shadow-sm">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">EQ-{c.equipment_id} Displacement</h3>
                  <span className="text-sm font-medium text-slate-400">{new Date(c.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center flex-wrap gap-4 text-sm font-medium p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl mb-4 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 line-through decoration-slate-400">P{c.priority} Request</span>
                  <ArrowRight className="w-4 h-4 text-industrial-500 shrink-0" />
                  <span className="text-industrial-600 dark:text-industrial-400 px-3 py-1 bg-industrial-100 dark:bg-industrial-900/40 rounded-lg">Site {c.site_id}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-900 dark:text-slate-200 font-semibold mr-1">System Resolution:</strong> {c.resolution_note || 'Auto-displaced by higher priority.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

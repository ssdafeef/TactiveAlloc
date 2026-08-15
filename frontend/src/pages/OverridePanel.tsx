import { useState, useEffect } from 'react';
import { Check, X, AlertOctagon, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../lib/api';

export default function OverridePanel() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const [dispRes, pendRes] = await Promise.all([
        api.get('/bookings?status=displaced'),
        api.get('/bookings?status=pending')
      ]);
      setRequests([...dispRes.data, ...pendRes.data]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleOverride = async (id: number, status: string) => {
    setLoadingId(id);
    try {
      await api.patch(`/bookings/${id}/override`, {
        status,
        resolution_note: `Manually ${status} by manager.`
      });
      await load();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.detail || "Failed to override.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Manager Override Panel</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review displaced bookings and manual override requests.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests.map(req => (
          <div key={req.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <AlertOctagon className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">EQ-{req.equipment_id} <span className="text-slate-400 font-normal mx-1">for</span> Site {req.site_id}</h3>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded text-xs font-bold border border-slate-200 dark:border-slate-600">P{req.priority}</span>
                </div>
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2 capitalize">{req.status}</p>
                <p className="text-sm text-slate-500">Requested Dates: <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}</span></p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => handleOverride(req.id, 'approved')}
                disabled={loadingId === req.id}
                className="flex items-center px-5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 rounded-xl text-sm font-medium transition-colors border border-emerald-200 dark:border-emerald-800/30 shadow-sm hover:shadow disabled:opacity-50"
              >
                {loadingId === req.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />} 
                Approve
              </button>
              <button 
                onClick={() => handleOverride(req.id, 'rejected')}
                disabled={loadingId === req.id}
                className="flex items-center px-5 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-xl text-sm font-medium transition-colors border border-red-200 dark:border-red-800/30 shadow-sm hover:shadow disabled:opacity-50"
              >
                {loadingId === req.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />} 
                Reject
              </button>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Check className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">All caught up</h3>
            <p className="text-slate-500 mt-1">No pending overrides or displaced bookings.</p>
          </div>
        )}
      </div>
    </div>
  );
}

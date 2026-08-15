import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { AlertCircle, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function NewBooking() {
  const [formData, setFormData] = useState({
    equipment_id: '',
    site_id: '',
    start_date: '',
    end_date: '',
    priority: '2'
  });
  
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const selectedEquipment = equipmentList.find(eq => eq.id.toString() === formData.equipment_id) || null;

  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [equipRes, siteRes] = await Promise.all([
          api.get('/equipment'),
          api.get('/sites')
        ]);
        setEquipmentList(equipRes.data);
        setSiteList(siteRes.data);
        if (equipRes.data.length > 0) setFormData(f => ({ ...f, equipment_id: equipRes.data[0].id.toString() }));
        if (siteRes.data.length > 0) setFormData(f => ({ ...f, site_id: siteRes.data[0].id.toString() }));
      } catch (e) {
        console.error("Failed to load dropdowns", e);
      }
    }
    loadDropdowns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    if (!formData.start_date || !formData.end_date) {
      setFeedback({ type: 'error', message: 'Please choose both a start date and end date before submitting the booking.' });
      setLoading(false);
      return;
    }

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setFeedback({ type: 'error', message: 'The selected booking dates are invalid. Please choose valid start and end times.' });
      setLoading(false);
      return;
    }

    try {
      await api.post('/bookings', {
        equipment_id: parseInt(formData.equipment_id),
        site_id: parseInt(formData.site_id),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        priority: parseInt(formData.priority),
        shift: 'full_day'
      });
      
      setFeedback({ type: 'success', message: 'Booking approved and scheduled successfully. No conflicts detected.' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'An unexpected error occurred.';
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Request Equipment</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Book equipment for your site. Conflicts are resolved automatically based on priority.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Equipment Type</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-industrial-500 focus:border-industrial-500 block p-3.5 transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none"
                value={formData.equipment_id}
                onChange={e => setFormData({...formData, equipment_id: e.target.value})}
              >
                {equipmentList.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name} ({eq.type})</option>
                ))}
              </select>
              {selectedEquipment && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Selected type: <span className="font-medium text-slate-700 dark:text-slate-200">{selectedEquipment.type}</span>
                </p>
              )}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Destination Site</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-industrial-500 focus:border-industrial-500 block p-3.5 transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none"
                value={formData.site_id}
                onChange={e => setFormData({...formData, site_id: e.target.value})}
              >
                {siteList.map(site => (
                  <option key={site.id} value={site.id}>{site.name} ({site.location})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Start Date & Time</label>
              <input 
                type="datetime-local" 
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-industrial-500 focus:border-industrial-500 block p-3.5 transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none"
                value={formData.start_date}
                onChange={e => setFormData({...formData, start_date: e.target.value})}
              />
            </div>
            
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">End Date & Time</label>
              <input 
                type="datetime-local" 
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-industrial-500 focus:border-industrial-500 block p-3.5 transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none"
                value={formData.end_date}
                onChange={e => setFormData({...formData, end_date: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Project Priority</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { val: '3', label: 'Low (P3)' },
                { val: '2', label: 'Standard (P2)' },
                { val: '1', label: 'High/Critical (P1)' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.val}
                  onClick={() => setFormData({...formData, priority: p.val})}
                  className={cn(
                    "py-3 px-4 rounded-xl border text-sm font-medium transition-all text-center",
                    formData.priority === p.val 
                      ? "border-industrial-500 bg-industrial-50 text-industrial-700 shadow-sm dark:bg-industrial-900/20 dark:text-industrial-400" 
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:border-slate-300"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              disabled={loading}
              className="w-full md:w-auto flex items-center justify-center px-8 py-3.5 bg-industrial-500 hover:bg-industrial-600 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
              Check Availability & Book
              {!loading && <ChevronRight className="w-5 h-5 ml-2" />}
            </button>
          </div>
        </form>
        
        {feedback && (
          <div className={cn(
            "p-6 border-t animate-in slide-in-from-bottom-2",
            feedback.type === 'success' ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30" : "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30"
          )}>
            <div className="flex items-start">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 shrink-0" />
              )}
              <div className="ml-4">
                <h3 className={cn(
                  "text-sm font-semibold",
                  feedback.type === 'success' ? "text-emerald-800 dark:text-emerald-400" : "text-red-800 dark:text-red-400"
                )}>
                  {feedback.type === 'success' ? 'Booking Confirmed' : 'Conflict Detected'}
                </h3>
                <div className={cn(
                  "mt-1.5 text-sm leading-relaxed",
                  feedback.type === 'success' ? "text-emerald-700 dark:text-emerald-500" : "text-red-700 dark:text-red-500"
                )}>
                  {feedback.message}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

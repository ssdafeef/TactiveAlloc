import { useState, useEffect } from 'react';
import { Search, Filter, Wrench, FileText, X, CalendarClock } from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../lib/api';

type EquipmentUnit = {
  id: number;
  name: string;
  type: string;
  status: string;
};

export default function Fleet() {
  const [fleetData, setFleetData] = useState<EquipmentUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<EquipmentUnit | null>(null);
  const [historyData, setHistoryData] = useState<{ bookings: any[]; maintenance: any[] }>({ bookings: [], maintenance: [] });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [maintenanceForm, setMaintenanceForm] = useState({
    start_date: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    end_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16),
    description: '',
  });

  const isManager = role === 'manager';

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/equipment');
        setFleetData(res.data);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  async function openHistory(unit: EquipmentUnit) {
    setSelectedUnit(unit);
    try {
      const [detailRes, maintenanceRes] = await Promise.all([
        api.get(`/equipment/${unit.id}`),
        api.get('/maintenance', { params: { equipment_id: unit.id } }),
      ]);

      setHistoryData({
        bookings: detailRes.data.bookings ?? [],
        maintenance: maintenanceRes.data ?? [],
      });
      setIsHistoryOpen(true);
    } catch (error) {
      console.error('Failed to load equipment history', error);
      setHistoryData({ bookings: [], maintenance: [] });
      setIsHistoryOpen(true);
    }
  }

  function openMaintenance(unit: EquipmentUnit) {
    setSelectedUnit(unit);
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    setMaintenanceForm({
      start_date: start.toISOString().slice(0, 16),
      end_date: end.toISOString().slice(0, 16),
      description: `Scheduled maintenance for ${unit.name}`,
    });
    setIsMaintenanceOpen(true);
  }

  async function submitMaintenance() {
    if (!selectedUnit) return;

    try {
      await api.post('/maintenance', {
        equipment_id: selectedUnit.id,
        start_date: new Date(maintenanceForm.start_date).toISOString(),
        end_date: new Date(maintenanceForm.end_date).toISOString(),
        description: maintenanceForm.description || `Maintenance for ${selectedUnit.name}`,
      });

      setIsMaintenanceOpen(false);
      const res = await api.get('/equipment');
      setFleetData(res.data);
      if (selectedUnit) {
        openHistory(selectedUnit);
      }
    } catch (error) {
      console.error('Failed to schedule maintenance', error);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Equipment Fleet</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track all heavy equipment units.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search fleet..." className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-industrial-500 outline-none w-64 transition-shadow shadow-sm" />
          </div>
          <button className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 min-w-[900px]">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Equipment ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Current Location</th>
                <th className="px-6 py-4">Next Available</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {fleetData.map(unit => (
                <tr key={unit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{unit.name}</td>
                  <td className="px-6 py-4 capitalize">{unit.type}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1.5 text-xs font-semibold rounded-full min-w-[90px] inline-block text-center",
                      unit.status === 'available' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                      unit.status === 'booked' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                      unit.status === 'maintenance' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    )}>
                      {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">-</td>
                  <td className="px-6 py-4 font-medium">-</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openHistory(unit)} className="text-industrial-600 hover:text-industrial-700 font-medium transition-colors">History</button>
                    {isManager && (
                      <button
                        onClick={() => openMaintenance(unit)}
                        className="ml-4 inline-flex items-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        aria-label={`Schedule maintenance for ${unit.name}`}
                      >
                        <Wrench className="w-4 h-4 inline" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isHistoryOpen && selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Equipment history</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{selectedUnit.name}</h3>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 overflow-y-auto p-6 lg:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <FileText className="h-4 w-4" /> Booking history
                </div>
                <div className="space-y-3">
                  {historyData.bookings.length > 0 ? historyData.bookings.map((booking) => (
                    <div key={booking.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/80">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">Status: {booking.status}</span>
                        <span className="text-xs text-slate-500">Priority {booking.priority}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        {new Date(booking.start_date).toLocaleString()} → {new Date(booking.end_date).toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">Site #{booking.site_id}</p>
                    </div>
                  )) : (
                    <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
                      No booking history found for this equipment.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <CalendarClock className="h-4 w-4" /> Maintenance schedule
                </div>
                <div className="space-y-3">
                  {historyData.maintenance.length > 0 ? historyData.maintenance.map((m) => (
                    <div key={m.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/80">
                      <p className="font-medium text-slate-900 dark:text-white">{m.description}</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        {new Date(m.start_date).toLocaleString()} → {new Date(m.end_date).toLocaleString()}
                      </p>
                    </div>
                  )) : (
                    <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
                      No maintenance records found for this equipment.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMaintenanceOpen && selectedUnit && isManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Maintenance</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{selectedUnit.name}</h3>
              </div>
              <button onClick={() => setIsMaintenanceOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Start</label>
                <input
                  type="datetime-local"
                  value={maintenanceForm.start_date}
                  onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, start_date: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-industrial-400 focus:ring-4 focus:ring-industrial-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">End</label>
                <input
                  type="datetime-local"
                  value={maintenanceForm.end_date}
                  onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, end_date: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-industrial-400 focus:ring-4 focus:ring-industrial-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={maintenanceForm.description}
                  onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-industrial-400 focus:ring-4 focus:ring-industrial-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsMaintenanceOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={submitMaintenance} className="rounded-xl bg-industrial-500 px-4 py-2 text-sm font-medium text-white hover:bg-industrial-600">
                Save maintenance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ util: '0%', active: 0, conflicts: 0, maint: 0 });
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [bookRes, equipRes, confRes] = await Promise.all([
          api.get('/bookings'),
          api.get('/equipment'),
          api.get('/conflicts')
        ]);
        
        const bookings = bookRes.data;
        const equipment = equipRes.data;
        const conflicts = confRes.data;
        
        const activeCount = bookings.filter((b: any) => b.status === 'approved').length;
        const maintCount = equipment.filter((e: any) => e.status === 'maintenance').length;
        const availableCount = equipment.filter((e: any) => e.status === 'available').length;
        const util = equipment.length > 0 ? Math.round(((equipment.length - availableCount) / equipment.length) * 100) : 0;
        
        setStats({
          util: `${util}%`,
          active: activeCount,
          conflicts: conflicts.length,
          maint: maintCount
        });
        
        setTimelineData(bookings.map((b: any) => ({
          id: b.id,
          equip: `EQ-${b.equipment_id}`,
          site: `Site ${b.site_id}`,
          start: new Date(b.start_date).toLocaleDateString(),
          duration: `${Math.round((new Date(b.end_date).getTime() - new Date(b.start_date).getTime())/(1000*3600*24))} days`,
          status: b.status
        })).slice(0, 5));
        
        setActivityFeed(conflicts.map((c: any) => ({
          id: c.id,
          text: c.resolution_note || `Booking ${c.id} displaced.`,
          time: new Date(c.start_date).toLocaleDateString(),
          type: 'conflict'
        })).slice(0, 5));
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Overview</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track equipment utilization and resolve conflicts across sites.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Fleet Utilization', value: stats.util, trend: 'Current', good: true },
          { label: 'Active Bookings', value: stats.active, trend: 'Current', good: true },
          { label: 'Conflicts Resolved', value: stats.conflicts, trend: 'Total', good: true },
          { label: 'In Maintenance', value: stats.maint, trend: 'Scheduled', good: false },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <span className={cn("text-xs font-medium", stat.good ? "text-emerald-500" : "text-industrial-500")}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Booking Timeline</h3>
            <button className="text-sm font-medium text-industrial-600 hover:text-industrial-700 transition-colors">View Full Calendar</button>
          </div>
          <div className="space-y-4">
            {timelineData.map((item) => (
              <div key={item.id} className="flex items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 transition-colors hover:border-slate-200 dark:hover:border-slate-700">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{item.equip}</p>
                  <p className="text-sm text-slate-500">{item.site}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{item.start}</p>
                    <p className="text-xs text-slate-500">{item.duration}</p>
                  </div>
                  <span className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-full min-w-[80px] text-center",
                    item.status === 'approved' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                    item.status === 'pending' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                    item.status === 'displaced' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {activityFeed.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className="mt-1">
                  {activity.type === 'conflict' && <AlertTriangle className="w-5 h-5 text-industrial-500" />}
                  {activity.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {activity.type === 'info' && <Clock className="w-5 h-5 text-blue-500" />}
                </div>
                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{activity.text}</p>
                  <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

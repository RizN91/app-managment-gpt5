import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { format, addHours, startOfDay } from 'date-fns';

export default function SchedulerPage() {
  const loadAll = useStore(s => s.loadAll);
  const entities = useStore(s => s.entities);
  const updateJob = useStore(s => s.updateJob);
  useEffect(() => { loadAll(); }, []);
  const [date, setDate] = useState(() => new Date());

  if (!entities) return null;

  const techs = entities.users.filter(u => u.role === 'Tech');
  const hours = Array.from({ length: 9 }).map((_,i)=> addHours(startOfDay(date), 8 + i));

  function allowDrop(ev: React.DragEvent) { ev.preventDefault(); }
  function onDrop(ev: React.DragEvent, userId: string, hour: Date) {
    ev.preventDefault();
    const jobId = ev.dataTransfer.getData('text/plain');
    updateJob(jobId, { assigneeId: userId, scheduledAt: hour.toISOString(), status: 'Scheduled' as any });
  }

  const unscheduled = entities.jobs.filter(j => !j.scheduledAt || new Date(j.scheduledAt).toDateString() !== date.toDateString());

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <div className="card p-3 space-y-2 md:col-span-1">
        <div className="font-semibold">Unscheduled</div>
        {unscheduled.slice(0,40).map(j => (
          <div key={j.id} className="p-2 rounded border border-slate-200 dark:border-white/10" draggable onDragStart={e=>e.dataTransfer.setData('text/plain', j.id)}>
            {j.jobNo} — {j.profileCode ?? 'TBC'} — Qty {j.qty ?? 1}
          </div>
        ))}
      </div>
      <div className="md:col-span-3 space-y-2">
        <div className="flex items-center gap-2">
          <input type="date" className="input" value={format(date,'yyyy-MM-dd')} onChange={e=>setDate(new Date(e.target.value))} />
        </div>
        <div className="card p-2 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 w-40 text-left">Tech</th>
                {hours.map(h => <th key={h.toISOString()} className="p-2 text-left">{format(h,'h a')}</th>)}
              </tr>
            </thead>
            <tbody>
              {techs.map(t => (
                <tr key={t.id}>
                  <td className="p-2 font-medium">{t.name}</td>
                  {hours.map(h => (
                    <td key={h.toISOString()} className="p-2 min-w-48 align-top">
                      <div className="h-24 rounded border border-dashed border-slate-300 dark:border-white/10 p-1" onDragOver={allowDrop} onDrop={e=>onDrop(e,t.id,h)}>
                        {entities.jobs.filter(j => j.assigneeId===t.id && j.scheduledAt && new Date(j.scheduledAt).getHours()===h.getHours() && new Date(j.scheduledAt).toDateString()===date.toDateString()).map(j => (
                          <div key={j.id} className="p-2 bg-white/80 dark:bg-white/5 rounded border border-slate-200 dark:border-white/10">{j.jobNo} — {j.profileCode ?? 'TBC'}</div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
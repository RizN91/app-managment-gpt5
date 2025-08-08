import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Fuse from 'fuse.js';
import { useStore } from '../store/useStore';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import type { JobStatus } from '../types';
import { toCsv } from '../utils/csv';

export default function JobsPage() {
  const loadAll = useStore(s => s.loadAll);
  const entities = useStore(s => s.entities);
  const changeStatus = useStore(s => s.changeStatus);
  useEffect(() => { loadAll(); }, []);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All'|'Low'|'Normal'|'High'|'Urgent'>('All');
  const [selected, setSelected] = useState<string[]>([]);

  if (!entities) return null;

  const fuse = new Fuse(entities.jobs, { keys: ['jobNo','notes','profileCode'], threshold: 0.4 });
  let rows = query ? fuse.search(query).map(r=>r.item) : entities.jobs;
  if (statusFilter !== 'All') rows = rows.filter(r => r.status === statusFilter);
  if (priorityFilter !== 'All') rows = rows.filter(r => r.priority === priorityFilter);

  function toggle(id: string) {
    setSelected(sel => sel.includes(id) ? sel.filter(x=>x!==id) : [...sel, id]);
  }

  function bulk(to: JobStatus) { selected.forEach(id => changeStatus(id, to)); setSelected([]); }

  function exportCsv() {
    const e = entities!; // not null due to guard above
    const csv = toCsv(rows.map(r => ({ jobNo: r.jobNo, status: r.status, priority: r.priority, customer: e.customers.find(c=>c.id===r.customerId)?.name ?? '', profile: r.profileCode ?? '' })));
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'jobs.csv'; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <div className="card p-3 flex flex-wrap gap-2 items-center">
        <input className="input max-w-xs" placeholder="Fuzzy search" value={query} onChange={e=>setQuery(e.target.value)} />
        <select className="select max-w-[200px]" value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)}>
          <option value="All">All statuses</option>
          {Array.from(new Set(entities.jobs.map(j=>j.status))).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select max-w-[200px]" value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value as any)}>
          {['All','Low','Normal','High','Urgent'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {selected.length>0 && (
          <div className="ml-auto flex gap-2">
            <button className="btn-ghost" onClick={()=>bulk('Scheduled')}>Bulk: Schedule</button>
            <button className="btn-ghost" onClick={()=>bulk('In Progress')}>Bulk: Start</button>
            <button className="btn-ghost" onClick={()=>setSelected([])}>Clear</button>
          </div>
        )}
        <div className="ml-auto" />
        <button className="btn-primary" onClick={exportCsv}>Export CSV</button>
      </div>
      <div className="card overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white/80 dark:bg-slate-900/80">
            <tr className="text-left">
              <th className="p-2"><input type="checkbox" checked={selected.length>0 && selected.length===rows.length} onChange={e=> setSelected(e.target.checked? rows.map(r=>r.id): [])} /></th>
              <th className="p-2">Job</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Status</th>
              <th className="p-2">Priority</th>
              <th className="p-2">Profile</th>
              <th className="p-2">Scheduled</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(j => (
              <tr key={j.id} className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5">
                <td className="p-2"><input type="checkbox" checked={selected.includes(j.id)} onChange={()=>toggle(j.id)} /></td>
                <td className="p-2 font-medium"><Link to={`/jobs/${j.id}`} className="hover:underline">{j.jobNo}</Link></td>
                <td className="p-2">{entities.customers.find(c=>c.id===j.customerId)?.name}</td>
                <td className="p-2"><StatusBadge status={j.status} /></td>
                <td className="p-2"><PriorityBadge priority={j.priority} /></td>
                <td className="p-2">{j.profileCode ?? '-'}</td>
                <td className="p-2">{j.scheduledAt ? new Date(j.scheduledAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
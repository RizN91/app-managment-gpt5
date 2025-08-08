import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import StatusBadge from '../components/StatusBadge';
import KanbanBoard from '../components/KanbanBoard';

export default function DashboardPage() {
  const loadAll = useStore(s => s.loadAll);
  const entities = useStore(s => s.entities);
  useEffect(() => { loadAll(); }, []);
  if (!entities) return null;

  const now = new Date();
  const activeJobs = entities.jobs.filter(j => !['Paid','Cancelled'].includes(j.status));
  const awaitingApproval = entities.jobs.filter(j => j.status === 'Waiting Approval');
  const scheduledToday = entities.jobs.filter(j => j.scheduledAt && new Date(j.scheduledAt).toDateString() === now.toDateString());
  const overdue = entities.jobs.filter(j => ['Quoted','Waiting Approval','Approved'].includes(j.status) && new Date(j.createdAt) < new Date(now.getTime() - 1000*60*60*24*14));
  const revenueThisMonth = entities.invoices.filter(i => i.status !== 'Draft').reduce((s,i)=>s+i.total,0);

  const map = new Map<string, number>();
  activeJobs.forEach(j => map.set(j.status, (map.get(j.status) ?? 0) + 1));
  const stageEntries = Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
  const max = Math.max(1, ...stageEntries.map(([,n]) => n));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Kpi title="Active Jobs" value={activeJobs.length} />
        <Kpi title="Awaiting Approval" value={awaitingApproval.length} />
        <Kpi title="Scheduled Today" value={scheduledToday.length} />
        <Kpi title="Overdue" value={overdue.length} />
        <Kpi title="Revenue This Month" value={`$${revenueThisMonth.toFixed(0)}`} />
      </div>
      <div className="card p-4">
        <div className="font-semibold mb-2">Jobs by Stage</div>
        <div className="flex gap-2 items-end">
          {stageEntries.map(([status, count]) => (
            <div key={status} className="flex flex-col items-center text-xs">
              <div className="w-6 bg-brand-500/70 rounded-t" style={{ height: `${(count/max)*120}px` }} />
              <div className="mt-1 w-20 text-center"><StatusBadge status={status as any} /></div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">Kanban</div>
        </div>
        <KanbanBoard />
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="card p-4">
      <div className="text-xs opacity-70">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
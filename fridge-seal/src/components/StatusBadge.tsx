import type { JobStatus } from '../types';

const color: Record<JobStatus, string> = {
  'New': 'bg-slate-200 text-slate-800',
  'Need to Measure': 'bg-amber-200 text-amber-900',
  'Measured': 'bg-blue-200 text-blue-900',
  'Quoted': 'bg-purple-200 text-purple-900',
  'Waiting Approval': 'bg-yellow-200 text-yellow-900',
  'Approved': 'bg-emerald-200 text-emerald-900',
  'In Production': 'bg-indigo-200 text-indigo-900',
  'Ready for Install': 'bg-cyan-200 text-cyan-900',
  'Scheduled': 'bg-teal-200 text-teal-900',
  'In Progress': 'bg-orange-200 text-orange-900',
  'Completed': 'bg-gray-200 text-gray-900',
  'Invoiced': 'bg-pink-200 text-pink-900',
  'Paid': 'bg-green-300 text-green-900',
  'On Hold': 'bg-zinc-300 text-zinc-900',
  'Cancelled': 'bg-red-200 text-red-900',
};

export default function StatusBadge({ status }: { status: JobStatus }) {
  return <span className={`badge ${color[status]}`}>{status}</span>;
}
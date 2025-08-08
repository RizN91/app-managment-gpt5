import type { Priority } from '../types';

const color: Record<Priority, string> = {
  Low: 'bg-slate-200 text-slate-800',
  Normal: 'bg-blue-200 text-blue-900',
  High: 'bg-orange-200 text-orange-900',
  Urgent: 'bg-red-200 text-red-900',
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`badge ${color[priority]}`}>{priority}</span>;
}
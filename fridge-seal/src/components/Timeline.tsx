import { useStore } from '../store/useStore';
import { format } from 'date-fns';

export default function Timeline({ jobId }: { jobId: string }) {
  const entities = useStore(s => s.entities);
  if (!entities) return null;
  const items = entities.activities.filter(a => a.jobId === jobId).sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
  return (
    <ol className="space-y-2">
      {items.map(i => (
        <li key={i.id} className="text-sm">
          <span className="opacity-60 mr-2">{format(new Date(i.timestamp), 'dd MMM, HH:mm')}</span>
          <span>{i.action}</span>
        </li>
      ))}
    </ol>
  );
}
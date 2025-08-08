import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

export default function CustomersPage() {
  const loadAll = useStore(s => s.loadAll);
  const entities = useStore(s => s.entities);
  useEffect(() => { loadAll(); }, []);
  const [q, setQ] = useState('');
  if (!entities) return null;

  const rows = entities.customers.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="card p-3 flex items-center gap-2">
        <input className="input" placeholder="Search customers" value={q} onChange={e=>setQ(e.target.value)} />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map(c => (
          <div key={c.id} className="card p-3">
            <div className="font-semibold">{c.name}</div>
            <div className="text-sm opacity-70">{c.addresses[0]?.street}, {c.addresses[0]?.suburb}</div>
            <div className="mt-2 text-sm">Jobs: {entities.jobs.filter(j => j.customerId===c.id).length}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
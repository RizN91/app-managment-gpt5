import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function GlobalSearch() {
  const navigate = useNavigate();
  const entities = useStore(s => s.entities);
  const [q, setQ] = useState('');

  const fuse = useMemo(() => {
    if (!entities) return null;
    const list = [
      ...entities.jobs.map(j => ({
        type: 'Job',
        id: j.id,
        label: `${j.jobNo} ${j.profileCode ?? ''}`,
        text: `${j.jobNo} ${j.status} ${j.notes ?? ''}`,
      })),
      ...entities.customers.map(c => ({ type: 'Customer', id: c.id, label: c.name, text: `${c.name} ${c.addresses.map(a => a.street+' '+a.suburb).join(' ')}` })),
      ...entities.sites.map(s => ({ type: 'Site', id: s.id, label: `${s.address.street}, ${s.address.suburb}`, text: `${s.address.street} ${s.address.suburb} ${s.address.postcode}` }))
    ];
    return new Fuse(list, { keys: ['label','text'], threshold: 0.3 });
  }, [entities]);

  const results = q && fuse ? fuse.search(q).slice(0,7).map(r => r.item) : [];

  function open(item: any) {
    if (item.type === 'Job') navigate(`/jobs/${item.id}`);
  }

  return (
    <div className="relative w-full md:w-96">
      <input id="global-search-input" className="input" placeholder="Search jobs, customers, sites... (/ to focus)" value={q} onChange={e => setQ(e.target.value)} />
      {q && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full card p-2">
          {results.map((r:any) => (
            <button key={r.id} className="w-full text-left px-2 py-1 rounded hover:bg-slate-100/60 dark:hover:bg-white/10" onClick={() => open(r)}>
              <div className="text-sm font-medium">{r.label}</div>
              <div className="text-xs opacity-70">{r.type}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
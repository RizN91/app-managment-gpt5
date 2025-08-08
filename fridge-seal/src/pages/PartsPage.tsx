import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import * as db from '../services/db';

export default function PartsPage() {
  const loadAll = useStore(s => s.loadAll);
  const entities = useStore(s => s.entities);
  useEffect(() => { loadAll(); }, []);
  const [editing, setEditing] = useState<string | null>(null);
  if (!entities) return null;

  async function update(id: string, patch: any) {
    await db.updateItem('parts', id, patch); await loadAll();
  }

  return (
    <div className="card p-3 overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className="p-2">SKU</th>
            <th className="p-2">Name</th>
            <th className="p-2">Profile</th>
            <th className="p-2">Colour</th>
            <th className="p-2">Length</th>
            <th className="p-2">Price ex</th>
            <th className="p-2">Stock</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {entities.parts.map(p => (
            <tr key={p.id} className="border-t border-slate-100 dark:border-white/5">
              <td className="p-2">{p.sku}</td>
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.profileCode}</td>
              <td className="p-2">{p.colour}</td>
              <td className="p-2">{p.lengthMm}mm</td>
              <td className="p-2">${p.priceEx.toFixed(2)}</td>
              <td className={`p-2 ${p.stockQty<10?'text-red-600 font-semibold':''}`}>{p.stockQty}</td>
              <td className="p-2 text-right"><button className="btn-ghost" onClick={()=>setEditing(p.id)}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="card p-4 w-full max-w-md">
            <div className="font-semibold mb-2">Edit Part</div>
            {(() => { const p = entities.parts.find(x=>x.id===editing)!; return (
              <div className="space-y-2">
                <input className="input" value={p.priceEx} onChange={e=>update(p.id, { priceEx: Number(e.target.value) })} />
                <input className="input" value={p.stockQty} onChange={e=>update(p.id, { stockQty: Number(e.target.value) })} />
                <div className="flex justify-end gap-2"><button className="btn-ghost" onClick={()=>setEditing(null)}>Close</button></div>
              </div>
            ); })()}
          </div>
        </div>
      )}
    </div>
  );
}
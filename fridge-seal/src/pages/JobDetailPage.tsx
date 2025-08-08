import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import StatusBadge from '../components/StatusBadge';
import LabelButton from '../components/LabelButton';
import PhotoUploader from '../components/PhotoUploader';
import Timeline from '../components/Timeline';
import type { Job } from '../types';
import { nextStatus } from '../utils/statusMachine';

export default function JobDetailPage() {
  const { id } = useParams();
  const entities = useStore(s => s.entities);
  const loadAll = useStore(s => s.loadAll);
  const updateJob = useStore(s => s.updateJob);
  const changeStatus = useStore(s => s.changeStatus);
  const addQuoteForJob = useStore(s => s.addQuoteForJob);
  const addInvoiceForJob = useStore(s => s.addInvoiceForJob);

  useEffect(() => { loadAll(); }, []);
  if (!entities) return null;
  const e = entities; // narrow
  const job = e.jobs.find(j => j.id === id);
  if (!job) return <div>Job not found</div>;
  const jobId = job.id;

  const customer = e.customers.find(c=>c.id===job.customerId)!;
  const site = e.sites.find(s=>s.id===job.siteId)!;
  const parts = e.parts;

  const [tab, setTab] = useState<'Overview'|'Schedule'|'Measurements'|'Parts'|'Photos'|'Notes'|'Documents'|'Timeline'>('Overview');

  const suggestion = useMemo(()=> suggestProfile(job), [job.id, job.measurements?.A_mm, job.measurements?.C_mm]);

  async function savePatch(patch: Partial<Job>) {
    await updateJob(jobId, patch);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs opacity-60">{customer.name} • {site.address.street}, {site.address.suburb}</div>
          <div className="text-2xl font-semibold">{job.jobNo}</div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={job.status} />
          {nextStatus(job.status) && <button className="btn-primary" onClick={()=>changeStatus(jobId, nextStatus(job.status)!)}>Advance</button>}
          <LabelButton job={job} />
        </div>
      </div>

      <div className="card p-2 flex gap-2">
        {(['Overview','Measurements','Parts','Photos','Notes','Documents','Timeline'] as const).map(t => (
          <button key={t} className={`btn-ghost ${tab===t ? 'bg-slate-100 dark:bg-white/10' : ''}`} onClick={()=>setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card p-4 space-y-3 md:col-span-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs opacity-70">Assignee</div>
                <select className="select" value={job.assigneeId ?? ''} onChange={e=>savePatch({ assigneeId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {e.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <div className="text-xs opacity-70">Priority</div>
                <select className="select" value={job.priority} onChange={e=>savePatch({ priority: e.target.value as any })}>
                  {['Low','Normal','High','Urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <div className="text-xs opacity-70">Scheduled</div>
                <input type="datetime-local" className="input" value={job.scheduledAt ? job.scheduledAt.slice(0,16) : ''} onChange={e=>savePatch({ scheduledAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
              </div>
              <div>
                <div className="text-xs opacity-70">Qty</div>
                <input type="number" className="input" value={job.qty ?? 1} onChange={e=>savePatch({ qty: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <div className="text-xs opacity-70">Notes</div>
              <textarea className="input h-24" value={job.notes ?? ''} onChange={e=>savePatch({ notes: e.target.value })} />
            </div>
          </div>
          <div className="card p-4 space-y-2">
            <div className="font-semibold">Quick Actions</div>
            <button className="btn-ghost" onClick={()=>addQuoteForJob(jobId)}>Create Quote</button>
            <button className="btn-ghost" onClick={()=>addInvoiceForJob(jobId)}>Create Invoice</button>
            <button className="btn-ghost" onClick={()=>changeStatus(jobId,'On Hold')}>Put On Hold</button>
            <button className="btn-ghost" onClick={()=>changeStatus(jobId,'Cancelled')}>Cancel Job</button>
          </div>
        </div>
      )}

      {tab === 'Measurements' && (
        <div className="card p-4 grid md:grid-cols-2 gap-3">
          <div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs opacity-70">A (width mm)</div>
                <input type="number" className="input" value={job.measurements?.A_mm ?? ''} onChange={e=>savePatch({ measurements: { ...job.measurements, A_mm: Number(e.target.value) } })} />
              </div>
              <div>
                <div className="text-xs opacity-70">C (height mm)</div>
                <input type="number" className="input" value={job.measurements?.C_mm ?? ''} onChange={e=>savePatch({ measurements: { ...job.measurements, C_mm: Number(e.target.value) } })} />
              </div>
              <div>
                <div className="text-xs opacity-70">Colour</div>
                <select className="select" value={job.sealColour ?? 'black'} onChange={e=>savePatch({ sealColour: e.target.value as any })}>
                  <option value="black">black</option>
                  <option value="grey">grey</option>
                </select>
              </div>
              <div>
                <div className="text-xs opacity-70">Hinge Side</div>
                <select className="select" value={job.measurements?.hingeSide ?? ''} onChange={e=>savePatch({ measurements: { ...job.measurements, hingeSide: e.target.value as any } })}>
                  <option value="">-</option>
                  {['Left','Right','Top','Bottom'].map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <div className="text-xs opacity-70">Gasket Type</div>
                <select className="select" value={job.measurements?.gasketType ?? 'push-in'} onChange={e=>savePatch({ measurements: { ...job.measurements, gasketType: e.target.value as any } })}>
                  <option value="push-in">push-in</option>
                  <option value="screw-in">screw-in</option>
                </select>
              </div>
            </div>
            <div className="mt-3 text-sm">
              <div className="font-medium">Smart Suggestions</div>
              {suggestion && (
                <div className="text-sm">Suggested profile: <span className="font-semibold">{suggestion}</span>
                  <button className="btn-ghost ml-2" onClick={()=>savePatch({ profileCode: suggestion })}>Apply</button>
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs opacity-70">Profile Code</div>
            <input className="input" value={job.profileCode ?? ''} onChange={e=>savePatch({ profileCode: e.target.value })} />
          </div>
        </div>
      )}

      {tab === 'Parts' && (
        <div className="card p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Part</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Price ex</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {job.parts.map((pl, idx) => {
                const part = parts.find(p => p.id === pl.partId)!;
                return (
                  <tr key={pl.id} className="border-t border-slate-100 dark:border-white/5">
                    <td className="p-2">{part?.name} {part?.profileCode} {part?.colour}</td>
                    <td className="p-2"><input type="number" className="input" value={pl.quantity} onChange={e=>{
                      const copy = [...job.parts];
                      copy[idx] = { ...copy[idx], quantity: Number(e.target.value) };
                      savePatch({ parts: copy });
                    }} /></td>
                    <td className="p-2">${(pl.overridePriceEx ?? parts.find(p=>p.id===pl.partId)?.priceEx ?? 0).toFixed(2)}</td>
                    <td className="p-2 text-right"><button className="btn-ghost" onClick={()=>savePatch({ parts: job.parts.filter(x=>x.id!==pl.id) })}>Remove</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-3">
            <select className="select" onChange={e=>{
              const part = parts.find(p => p.id === e.target.value);
              if (!part) return;
              savePatch({ parts: [...job.parts, { id: crypto.randomUUID(), partId: part.id, quantity: 1 }] });
            }}>
              <option value="">Add Part...</option>
              {parts.map(p => <option key={p.id} value={p.id}>{p.name} {p.profileCode} {p.colour}</option>)}
            </select>
          </div>
        </div>
      )}

      {tab === 'Photos' && (
        <div className="card p-4">
          <PhotoUploader photos={job.photos} onChange={photos=>savePatch({ photos })} />
        </div>
      )}

      {tab === 'Notes' && (
        <div className="card p-4">
          <textarea className="input h-64" value={job.notes ?? ''} onChange={e=>savePatch({ notes: e.target.value })} />
        </div>
      )}

      {tab === 'Documents' && (
        <div className="card p-4 space-y-2">
          <div className="font-semibold">Quotes</div>
          {e.quotes.filter(q=>q.jobId===job.id).map(q => (
            <div key={q.id} className="flex items-center justify-between">
              <div>{q.number} — {q.status} — ${q.total.toFixed(2)}</div>
              <a className="btn-ghost" href="#" onClick={(e)=>{ e.preventDefault(); const w=window.open('about:blank','_blank'); if(w) w.document.write(`<pre>${JSON.stringify(q,null,2)}</pre>`); }}>View</a>
            </div>
          ))}
          <div className="font-semibold">Invoices</div>
          {e.invoices.filter(i=>i.jobId===job.id).map(i => (
            <div key={i.id} className="flex items-center justify-between">
              <div>{i.number} — {i.status} — ${i.total.toFixed(2)}</div>
              <a className="btn-ghost" href="#" onClick={(e)=>{ e.preventDefault(); const w=window.open('about:blank','_blank'); if(w) w.document.write(`<pre>${JSON.stringify(i,null,2)}</pre>`); }}>View</a>
            </div>
          ))}
        </div>
      )}

      {tab === 'Timeline' && (
        <div className="card p-4">
          <Timeline jobId={job.id} />
        </div>
      )}
    </div>
  );
}

function suggestProfile(job: Job): string | null {
  const A = job.measurements?.A_mm ?? 0; const C = job.measurements?.C_mm ?? 0;
  if (!A || !C) return null;
  if (A >= 700 && A <= 750 && C >= 1500 && C <= 1600) return 'RP423';
  if (A >= 600 && A <= 700 && C >= 1400 && C <= 1550) return 'RP215';
  return null;
}
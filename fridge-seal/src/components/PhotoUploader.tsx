import { useRef } from 'react';
import type { Photo } from '../types';

export default function PhotoUploader({ photos, onChange }: { photos: Photo[]; onChange: (p: Photo[]) => void; }) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const arr: Photo[] = [];
    for (const f of Array.from(files)) {
      const dataUrl = await fileToDataURL(f);
      arr.push({ id: Math.random().toString(36).slice(2), dataUrl });
    }
    onChange([...(photos ?? []), ...arr]);
    if (fileRef.current) fileRef.current.value = '';
  }

  function move(idx: number, dir: -1 | 1) {
    const copy = [...photos];
    const ni = idx + dir;
    if (ni < 0 || ni >= copy.length) return;
    const [sp] = copy.splice(idx, 1);
    copy.splice(ni, 0, sp);
    onChange(copy);
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e)=>onFiles(e.target.files)} className="hidden" />
      <button className="btn-ghost" onClick={()=>fileRef.current?.click()}>Upload Photos</button>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
        {photos?.map((p, idx) => (
          <div key={p.id} className="rounded-lg overflow-hidden border border-slate-200 dark:border-white/10">
            <img src={p.dataUrl} alt="photo" className="w-full h-36 object-cover" />
            <div className="flex items-center justify-between text-xs p-1">
              <input className="input text-xs py-1" placeholder="Caption" value={p.caption ?? ''} onChange={e=>{
                const copy = [...photos];
                copy[idx] = { ...copy[idx], caption: e.target.value };
                onChange(copy);
              }} />
              <div className="flex gap-1">
                <button className="btn-ghost" onClick={()=>move(idx,-1)}>↑</button>
                <button className="btn-ghost" onClick={()=>move(idx,1)}>↓</button>
                <button className="btn-ghost" onClick={()=>onChange(photos.filter(x=>x.id!==p.id))}>✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function fileToDataURL(file: File): Promise<string> {
  return await new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}
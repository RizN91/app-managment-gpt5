import { makeLabel } from '../utils/pdf';
import type { Job } from '../types';

export default function LabelButton({ job }: { job: Job }) {
  async function gen() {
    const dataUrl = await makeLabel(job);
    const win = window.open('about:blank','_blank');
    if (win) win.document.write(`<iframe src="${dataUrl}" style="width:100%;height:100%"></iframe>`);
  }
  return <button className="btn-ghost" onClick={gen}>Print Label</button>;
}
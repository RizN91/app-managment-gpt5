import jsPDF from 'jspdf';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - qrcode lacks types by default; we treat as any
import QRCode from 'qrcode';
import type { Job, Quote, Invoice } from '../types';

export async function makeLabel(job: Job): Promise<string> {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text('FridgeSeal Label', 14, 14);
  doc.setFontSize(11);
  doc.text(`Job: ${job.jobNo}`, 14, 24);
  doc.text(`Profile: ${job.profileCode ?? 'TBD'}  Colour: ${job.sealColour ?? 'TBD'}  Qty: ${job.qty ?? 1}`, 14, 32);
  doc.text(`A: ${job.measurements?.A_mm ?? '-'}  C: ${job.measurements?.C_mm ?? '-'}`, 14, 40);
  const dataUrl = await QRCode.toDataURL(`job:${job.id}`);
  // @ts-ignore
  doc.addImage(dataUrl, 'PNG', 150, 10, 40, 40);
  return doc.output('datauristring');
}

export function makeQuotePdf(quote: Quote): string {
  const doc = new jsPDF();
  doc.text(`Quote ${quote.number}`, 14, 14);
  doc.text(`Job: ${quote.jobId}`, 14, 22);
  let y = 32;
  quote.lineItems.forEach(li => {
    doc.text(`${li.description} x${li.quantity}  $${li.unitPriceEx.toFixed(2)} ex`, 14, y); y += 8;
  });
  y += 4;
  doc.text(`Subtotal: $${quote.subtotal.toFixed(2)}`, 14, y); y += 8;
  doc.text(`Tax: $${quote.tax.toFixed(2)}`, 14, y); y += 8;
  doc.text(`Total: $${quote.total.toFixed(2)}`, 14, y);
  return doc.output('datauristring');
}

export function makeInvoicePdf(invoice: Invoice): string {
  const doc = new jsPDF();
  doc.text(`Invoice ${invoice.number}`, 14, 14);
  let y = 28;
  invoice.lineItems.forEach(li => { doc.text(`${li.description} x${li.quantity}  $${li.unitPriceEx.toFixed(2)} ex`, 14, y); y += 8; });
  y += 4;
  doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 14, y); y += 8;
  doc.text(`Tax: $${invoice.tax.toFixed(2)}`, 14, y); y += 8;
  doc.text(`Total: $${invoice.total.toFixed(2)}`, 14, y);
  return doc.output('datauristring');
}
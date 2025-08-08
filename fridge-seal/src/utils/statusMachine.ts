import type { JobStatus } from '../types';

const order: JobStatus[] = [
  'New',
  'Need to Measure',
  'Measured',
  'Quoted',
  'Waiting Approval',
  'Approved',
  'In Production',
  'Ready for Install',
  'Scheduled',
  'In Progress',
  'Completed',
  'Invoiced',
  'Paid',
  'On Hold',
  'Cancelled',
];

export function canTransition(from: JobStatus, to: JobStatus): boolean {
  if (to === 'On Hold' || to === 'Cancelled') return true; // allow any time
  if (from === 'Cancelled') return false;
  const iFrom = order.indexOf(from);
  const iTo = order.indexOf(to);
  return iTo >= 0 && iTo <= order.indexOf('Paid') && iTo >= iFrom - 1; // allow same, next, or minor correction forward
}

export function nextStatus(current: JobStatus): JobStatus | null {
  const i = order.indexOf(current);
  if (i < 0 || i + 1 >= order.indexOf('Paid') + 1) return null;
  return order[i + 1] as JobStatus;
}

export function previousStatus(current: JobStatus): JobStatus | null {
  const i = order.indexOf(current);
  if (i <= 0) return null;
  return order[i - 1] as JobStatus;
}

export const allStatuses = order;
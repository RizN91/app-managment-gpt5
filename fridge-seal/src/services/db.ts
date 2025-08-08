import { set, get } from 'idb-keyval';
import { addDays, format } from 'date-fns';
import type { Entities, ID, Job, Customer, Site, User, Part, Activity, Quote, Invoice, Priority, JobStatus } from '../types';

const KEY = 'fridgeseal-db-v1';

function uid(prefix = ''): ID { return prefix + Math.random().toString(36).slice(2, 9); }

export async function load(): Promise<Entities | null> { return (await get(KEY)) as Entities | null; }
export async function save(db: Entities): Promise<void> { await set(KEY, db); }

export async function initSeed(): Promise<void> {
  const existing = await load();
  if (existing) return;
  const users: User[] = [
    { id: uid('u_'), shortCode: 'FS', name: 'Brett S', role: 'Admin', mobile: '0400 000 111', email: 'brett@example.com' },
    { id: uid('u_'), shortCode: 'MK', name: 'Mark T', role: 'Tech', mobile: '0400 222 333', email: 'mark@example.com' },
    { id: uid('u_'), shortCode: 'JS', name: 'Jess P', role: 'Scheduler', mobile: '0400 444 555', email: 'jess@example.com' },
  ];

  const melbSuburbs = [
    'Fitzroy', 'Richmond', 'Southbank', 'Moonee Ponds', 'St Kilda', 'Carlton', 'Brunswick', 'Footscray', 'Prahran', 'Docklands', 'South Yarra', 'Collingwood', 'Abbotsford', 'Kew', 'Hawthorn', 'Williamstown', 'Coburg', 'Essendon', 'Ascot Vale', 'Port Melbourne'
  ];

  function addr(suburb: string, streetNo: number) {
    return { street: `${streetNo} ${['Exhibition','Swanston','Napier','Lygon','Ramsden','Albert Park','Collins','Elizabeth','Barkly','Chapel'][streetNo % 10]} St`, suburb, state: 'VIC', postcode: '3000', type: 'site' as const };
  }

  const customerNames = [
    'Provincial Hotel', 'Morris House', 'Bekka', 'The Posty', 'Beer Deluxe Fed Square', 'Station Hotel', 'Lakeside Pavilion', 'Yarra Botanica', 'The Prahran Hotel', 'Southbank Deli', 'Moonee Market', 'Green Grocer Fitzroy', 'Coburg Supermart', 'Richmond Cafe', 'Albert Park Cafe', 'Carlton Bistro', 'Footscray Fresh', 'Docklands Convenience', 'St Kilda Ice Bar', 'Hawthorn Social', 'Kew Sushi', 'Abbotsford Bakery', 'Williamstown Pier Cafe', 'Essendon Super', 'Ascot Vale RSL'
  ];

  const customers: Customer[] = customerNames.map((name, i) => ({
    id: uid('c_'),
    name,
    contactName: 'Manager',
    phone: `03 9${(300000 + i).toString().slice(1)}`,
    email: `${name.toLowerCase().replace(/[^a-z]/g,'')}@example.com`,
    notes: i % 3 === 0 ? 'After-hours access required' : '',
    addresses: [addr(melbSuburbs[i % melbSuburbs.length], 20 + i)],
  }));

  const sites: Site[] = customers.map((c, i) => ({
    id: uid('s_'),
    customerId: c.id,
    address: c.addresses[0],
    accessNotes: i % 4 === 0 ? 'Back alley roller door, ask for key' : undefined,
    onsiteContact: 'Duty Manager',
    parkingNotes: 'Street parking',
  }));

  const parts: Part[] = [
    { id: uid('p_'), sku: 'RP423-BLK', name: 'Raven RP423', profileCode: 'RP423', colour: 'black', lengthMm: 2100, priceEx: 45, taxRate: 0.1, stockQty: 30 },
    { id: uid('p_'), sku: 'RP423-GRY', name: 'Raven RP423', profileCode: 'RP423', colour: 'grey', lengthMm: 2100, priceEx: 45, taxRate: 0.1, stockQty: 22 },
    { id: uid('p_'), sku: 'RP215-BLK', name: 'Raven RP215', profileCode: 'RP215', colour: 'black', lengthMm: 2000, priceEx: 39, taxRate: 0.1, stockQty: 40 },
    { id: uid('p_'), sku: 'RP215-GRY', name: 'Raven RP215', profileCode: 'RP215', colour: 'grey', lengthMm: 2000, priceEx: 39, taxRate: 0.1, stockQty: 18 },
  ];

  const statusPool: JobStatus[] = ['New','Need to Measure','Measured','Quoted','Waiting Approval','Approved','In Production','Ready for Install','Scheduled','In Progress','Completed','Invoiced','Paid'];

  function jobNo(n: number) { return `JB${(460 + n).toString().padStart(4,'0')}`; }

  const jobs: Job[] = Array.from({ length: 45 }).map((_, i) => {
    const cust = customers[i % customers.length];
    const site = sites.find(s => s.customerId === cust.id)!;
    const status = statusPool[i % statusPool.length];
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - (60 - i));
    const scheduledAt = i % 3 === 0 ? addDays(createdAt, (i % 14)).toISOString() : undefined;
    return {
      id: uid('j_'),
      jobNo: jobNo(i),
      customerId: cust.id,
      siteId: site.id,
      status,
      priority: (['Low','Normal','High','Urgent'] as Priority[])[i % 4],
      createdAt: createdAt.toISOString(),
      scheduledAt,
      assigneeId: users[(i % users.length)].id,
      measurements: i % 5 === 0 ? { A_mm: 720 + (i % 3) * 5, C_mm: 1520 + (i % 5) * 5, gasketType: 'push-in', hingeSide: 'Left' } : undefined,
      sealColour: i % 2 === 0 ? 'black' : 'grey',
      profileCode: i % 5 === 0 ? (i % 2 === 0 ? 'RP423' : 'RP215') : undefined,
      qty: (i % 3) + 1,
      photos: [],
      notes: i % 2 === 0 ? 'Customer prefers morning.' : 'Beware dog on site.',
      parts: [],
      checklists: [
        { id: uid('chk_'), type: 'Measure', items: [
          { id: uid('ci_'), label: 'Measured A width', checked: i % 5 === 0 },
          { id: uid('ci_'), label: 'Measured C height', checked: i % 5 === 0 },
          { id: uid('ci_'), label: 'Photos taken', checked: false, requiresPhoto: true },
        ] },
        { id: uid('chk_'), type: 'Install', items: [
          { id: uid('ci_'), label: 'Seal installed', checked: false },
          { id: uid('ci_'), label: 'Door closes properly', checked: false },
          { id: uid('ci_'), label: 'Site signed off', checked: false },
        ] },
      ],
    };
  });

  const activities: Activity[] = jobs.map(j => ({ id: uid('a_'), jobId: j.id, timestamp: j.createdAt, action: 'Job created', actorId: users[0].id }));

  const quotes: Quote[] = [];
  const invoices: Invoice[] = [];

  const db: Entities = { customers, sites, users, parts, jobs, quotes, invoices, activities, timesheets: [] };
  await save(db);
}

// CRUD utilities
export async function getAll<K extends keyof Entities>(key: K): Promise<Entities[K]> {
  const db = (await load())!;
  return structuredClone(db[key]);
}

export async function getById<K extends keyof Entities>(key: K, id: ID): Promise<any> {
  const col = await getAll(key as any);
  // @ts-ignore
  return (col as any[]).find(x => x.id === id);
}

export async function addItem<K extends keyof Entities>(key: K, item: any): Promise<any> {
  const db = (await load())!;
  // @ts-ignore
  db[key].push(item);
  await save(db);
  return item;
}

export async function updateItem<K extends keyof Entities>(key: K, id: ID, patch: Partial<any>): Promise<any> {
  const db = (await load())!;
  // @ts-ignore
  const arr = db[key] as any[];
  const idx = arr.findIndex(x => x.id === id);
  if (idx >= 0) {
    arr[idx] = { ...arr[idx], ...patch };
    await save(db);
    return arr[idx];
  }
  throw new Error(`Not found: ${String(key)} ${id}`);
}

export async function removeItem<K extends keyof Entities>(key: K, id: ID): Promise<void> {
  const db = (await load())!;
  // @ts-ignore
  db[key] = (db[key] as any[]).filter(x => x.id !== id);
  await save(db);
}

export async function nextQuoteNumber(): Promise<string> {
  const quotes = await getAll('quotes');
  const n = quotes.length + 1;
  return `Q${format(new Date(), 'yyMM')}-${n.toString().padStart(3,'0')}`;
}

export async function nextInvoiceNumber(): Promise<string> {
  const invoices = await getAll('invoices');
  const n = invoices.length + 1;
  return `INV${format(new Date(), 'yyMM')}-${n.toString().padStart(3,'0')}`;
}

export async function logActivity(jobId: ID, action: string, actorId?: ID, meta?: Record<string, any>) {
  const db = (await load())!;
  const activity: Activity = { id: uid('a_'), jobId, timestamp: new Date().toISOString(), action, actorId, meta };
  db.activities.push(activity);
  await save(db);
  return activity;
}

export function generateJobNo(existingCount: number): string {
  return `JB${(469 + existingCount + 1).toString().padStart(4,'0')}`;
}

export { uid };
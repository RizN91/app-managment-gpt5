// README (quick): TypeScript domain types for the FridgeSeal Pro app.
export type ID = string;

export type Priority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type SealColour = 'black' | 'grey';
export type Role = 'Admin' | 'Scheduler' | 'Tech';

export type JobStatus =
  | 'New'
  | 'Need to Measure'
  | 'Measured'
  | 'Quoted'
  | 'Waiting Approval'
  | 'Approved'
  | 'In Production'
  | 'Ready for Install'
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Invoiced'
  | 'Paid'
  | 'On Hold'
  | 'Cancelled';

export interface Address {
  street: string;
  suburb: string;
  state: string; // e.g., VIC
  postcode: string;
  type?: 'billing' | 'site' | 'postal';
}

export interface Customer {
  id: ID;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  notes?: string;
  addresses: Address[];
}

export interface Site {
  id: ID;
  customerId: ID;
  address: Address;
  accessNotes?: string;
  onsiteContact?: string;
  parkingNotes?: string;
}

export interface Photo {
  id: ID;
  dataUrl: string; // base64
  caption?: string;
}

export interface ChecklistItem {
  id: ID;
  label: string;
  checked: boolean;
  requiresPhoto?: boolean;
}

export interface JobChecklist {
  id: ID;
  type: 'Measure' | 'Install';
  items: ChecklistItem[];
}

export interface Part {
  id: ID;
  sku: string;
  name: string;
  profileCode: string;
  colour: SealColour;
  lengthMm: number;
  priceEx: number;
  taxRate: number; // 0.1 for GST 10%
  stockQty: number;
}

export interface JobPartLine {
  id: ID;
  partId: ID;
  quantity: number;
  overridePriceEx?: number;
}

export interface Measurement {
  A_mm?: number; // width
  C_mm?: number; // height
  hingeSide?: 'Left' | 'Right' | 'Top' | 'Bottom';
  gasketType?: 'push-in' | 'screw-in';
}

export interface Job {
  id: ID;
  jobNo: string; // JB####
  customerId: ID;
  siteId: ID;
  status: JobStatus;
  priority: Priority;
  createdAt: string; // ISO
  scheduledAt?: string; // ISO
  assigneeId?: ID;
  measurements?: Measurement;
  sealColour?: SealColour;
  profileCode?: string;
  qty?: number;
  photos: Photo[];
  notes?: string;
  parts: JobPartLine[];
  checklists: JobChecklist[];
  quoteId?: ID;
  invoiceId?: ID;
}

export interface User {
  id: ID;
  shortCode: string; // e.g., FS
  name: string;
  role: Role;
  mobile?: string;
  email?: string;
}

export interface QuoteOrInvoiceLineItem {
  id: ID;
  description: string;
  quantity: number;
  unitPriceEx: number;
  taxRate: number; // GST 10%
}

export interface Quote {
  id: ID;
  number: string;
  jobId: ID;
  lineItems: QuoteOrInvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined';
  pdfUrl?: string;
}

export interface Invoice {
  id: ID;
  number: string;
  jobId: ID;
  lineItems: QuoteOrInvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid';
  pdfUrl?: string;
}

export interface Activity {
  id: ID;
  jobId: ID;
  timestamp: string; // ISO
  actorId?: ID;
  action: string;
  meta?: Record<string, any>;
}

export interface Timesheet {
  id: ID;
  userId: ID;
  jobId?: ID;
  start: string; // ISO
  end?: string; // ISO
  travelKm?: number;
}

export interface Entities {
  customers: Customer[];
  sites: Site[];
  users: User[];
  parts: Part[];
  jobs: Job[];
  quotes: Quote[];
  invoices: Invoice[];
  activities: Activity[];
  timesheets: Timesheet[];
}
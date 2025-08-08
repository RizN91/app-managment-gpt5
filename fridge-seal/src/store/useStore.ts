import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Entities, Job, ID, JobStatus, Quote, Invoice } from '../types';
import * as db from '../services/db';
import { canTransition } from '../utils/statusMachine';

interface StoreState {
  entities: Entities | null;
  currentUserId?: ID;
  loadAll: () => Promise<void>;
  addJob: (partial: Partial<Job>) => Promise<Job>;
  updateJob: (id: ID, patch: Partial<Job>) => Promise<Job>;
  deleteJob: (id: ID) => Promise<void>;
  changeStatus: (id: ID, to: JobStatus) => Promise<Job>;
  addQuoteForJob: (jobId: ID) => Promise<Quote>;
  addInvoiceForJob: (jobId: ID) => Promise<Invoice>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      entities: null,
      currentUserId: undefined,
      async loadAll() {
        await db.initSeed();
        const entities = (await db.load())!;
        set({ entities, currentUserId: entities.users[0]?.id });
      },
      async addJob(partial) {
        const entities = (await db.load())!;
        const job: Job = {
          id: db.uid('j_'),
          jobNo: db.generateJobNo(entities.jobs.length),
          customerId: partial.customerId!,
          siteId: partial.siteId!,
          status: partial.status ?? 'New',
          priority: partial.priority ?? 'Normal',
          createdAt: new Date().toISOString(),
          scheduledAt: partial.scheduledAt,
          assigneeId: partial.assigneeId,
          measurements: partial.measurements,
          sealColour: partial.sealColour,
          profileCode: partial.profileCode,
          qty: partial.qty ?? 1,
          photos: [],
          notes: partial.notes ?? '',
          parts: [],
          checklists: [
            { id: db.uid('chk_'), type: 'Measure', items: [
              { id: db.uid('ci_'), label: 'Measured A width', checked: false },
              { id: db.uid('ci_'), label: 'Measured C height', checked: false },
              { id: db.uid('ci_'), label: 'Photos taken', checked: false, requiresPhoto: true },
            ] },
            { id: db.uid('chk_'), type: 'Install', items: [
              { id: db.uid('ci_'), label: 'Seal installed', checked: false },
              { id: db.uid('ci_'), label: 'Door closes properly', checked: false },
              { id: db.uid('ci_'), label: 'Site signed off', checked: false },
            ] },
          ],
        };
        await db.addItem('jobs', job);
        await db.logActivity(job.id, 'Job created', get().currentUserId);
        set({ entities: (await db.load())! });
        return job;
      },
      async updateJob(id, patch) {
        const updated = await db.updateItem('jobs', id, patch);
        await db.logActivity(id, 'Job updated', get().currentUserId, { patch });
        set({ entities: (await db.load())! });
        return updated;
      },
      async deleteJob(id) {
        await db.removeItem('jobs', id);
        await db.logActivity(id, 'Job deleted', get().currentUserId);
        set({ entities: (await db.load())! });
      },
      async changeStatus(id, to) {
        const job = await db.getById('jobs', id) as Job;
        if (!canTransition(job.status, to)) throw new Error(`Invalid transition ${job.status} -> ${to}`);
        const updated = await db.updateItem('jobs', id, { status: to });
        await db.logActivity(id, `Status: ${job.status} -> ${to}`, get().currentUserId);
        set({ entities: (await db.load())! });
        return updated as Job;
      },
      async addQuoteForJob(jobId) {
        const entities = (await db.load())!;
        const job = entities.jobs.find(j => j.id === jobId)!;
        const number = await db.nextQuoteNumber();
        const quote: Quote = {
          id: db.uid('q_'), number, jobId: job.id,
          lineItems: [
            { id: db.uid('li_'), description: `${job.profileCode ?? 'Seal'} supply`, quantity: job.qty ?? 1, unitPriceEx: 60, taxRate: 0.1 },
            { id: db.uid('li_'), description: 'Labour', quantity: 1, unitPriceEx: 95, taxRate: 0.1 },
          ],
          subtotal: 0, tax: 0, total: 0, status: 'Draft'
        };
        quote.subtotal = quote.lineItems.reduce((s, li) => s + li.quantity * li.unitPriceEx, 0);
        quote.tax = quote.lineItems.reduce((s, li) => s + li.quantity * li.unitPriceEx * li.taxRate, 0);
        quote.total = quote.subtotal + quote.tax;
        await db.addItem('quotes', quote);
        await db.updateItem('jobs', jobId, { quoteId: quote.id });
        await db.logActivity(jobId, 'Quote created', get().currentUserId, { number });
        set({ entities: (await db.load())! });
        return quote;
      },
      async addInvoiceForJob(jobId) {
        const entities = (await db.load())!;
        const job = entities.jobs.find(j => j.id === jobId)!;
        const number = await db.nextInvoiceNumber();
        const invoice: Invoice = {
          id: db.uid('i_'), number, jobId: job.id,
          lineItems: [
            { id: db.uid('li_'), description: `${job.profileCode ?? 'Seal'} supply`, quantity: job.qty ?? 1, unitPriceEx: 60, taxRate: 0.1 },
            { id: db.uid('li_'), description: 'Labour', quantity: 1, unitPriceEx: 95, taxRate: 0.1 },
          ],
          subtotal: 0, tax: 0, total: 0, status: 'Draft'
        };
        invoice.subtotal = invoice.lineItems.reduce((s, li) => s + li.quantity * li.unitPriceEx, 0);
        invoice.tax = invoice.lineItems.reduce((s, li) => s + li.quantity * li.unitPriceEx * li.taxRate, 0);
        invoice.total = invoice.subtotal + invoice.tax;
        await db.addItem('invoices', invoice);
        await db.updateItem('jobs', jobId, { invoiceId: invoice.id });
        await db.logActivity(jobId, 'Invoice created', get().currentUserId, { number });
        set({ entities: (await db.load())! });
        return invoice;
      },
    }),
    { name: 'fridgeseal-store' }
  )
);
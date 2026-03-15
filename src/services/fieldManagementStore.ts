import {
  Client,
  Property,
  Field,
  JobRecord,
  JobOutcome,
} from '../types/fieldManagement';
import { UserRole } from '../contexts/AuthContext';

const CLIENTS_KEY = 'ftf_clients';
const PROPERTIES_KEY = 'ftf_properties';
const FIELDS_KEY = 'ftf_fields';
const JOBS_KEY = 'ftf_jobs';
const OUTCOMES_KEY = 'ftf_outcomes';

// ─── Current user context ───────────────────────────────────

interface CurrentUser {
  id: string;
  role: UserRole;
  contractorId?: string;   // For client users — their contractor's user ID
  clientRecordId?: string; // For client users — their Client business record ID
}

let currentUser: CurrentUser | null = null;

export function setCurrentUser(user: CurrentUser | null): void {
  currentUser = user;
}

// ─── Generic helpers ─────────────────────────────────────────

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function genId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ─── Scoping helpers ─────────────────────────────────────────

function getVisibleClientIds(): Set<string> | null {
  if (!currentUser) return null;
  if (currentUser.role === 'admin') return null; // null = no filter
  if (currentUser.role === 'contractor') {
    const clients = load<Client>(CLIENTS_KEY).filter((c) => c.contractorUserId === currentUser!.id);
    return new Set(clients.map((c) => c.id));
  }
  // client role
  if (currentUser.clientRecordId) {
    return new Set([currentUser.clientRecordId]);
  }
  return new Set(); // empty = see nothing
}

function scopeClients(clients: Client[]): Client[] {
  if (!currentUser) return clients;
  if (currentUser.role === 'admin') return clients;
  if (currentUser.role === 'contractor') {
    return clients.filter((c) => c.contractorUserId === currentUser!.id);
  }
  // client role
  if (currentUser.clientRecordId) {
    return clients.filter((c) => c.id === currentUser!.clientRecordId);
  }
  return [];
}

// ─── Clients ─────────────────────────────────────────────────

export function getClients(): Client[] {
  return scopeClients(load<Client>(CLIENTS_KEY));
}

export function getAllClientsUnscoped(): Client[] {
  return load<Client>(CLIENTS_KEY);
}

export function getClientById(id: string): Client | undefined {
  const client = load<Client>(CLIENTS_KEY).find((c) => c.id === id);
  if (!client) return undefined;
  // Access check
  if (!currentUser) return client;
  if (currentUser.role === 'admin') return client;
  if (currentUser.role === 'contractor' && client.contractorUserId === currentUser.id) return client;
  if (currentUser.role === 'client' && client.id === currentUser.clientRecordId) return client;
  return undefined;
}

export function saveClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client {
  const clients = load<Client>(CLIENTS_KEY);
  const client: Client = { ...data, id: genId(), createdAt: now(), updatedAt: now() };
  clients.push(client);
  save(CLIENTS_KEY, clients);
  return client;
}

export function updateClient(id: string, updates: Partial<Client>): Client {
  const clients = load<Client>(CLIENTS_KEY);
  const idx = clients.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Client not found');
  clients[idx] = { ...clients[idx], ...updates, updatedAt: now() };
  save(CLIENTS_KEY, clients);
  return clients[idx];
}

export function deleteClient(id: string): void {
  save(CLIENTS_KEY, load<Client>(CLIENTS_KEY).filter((c) => c.id !== id));
  const props = getPropertiesByClient(id);
  props.forEach((p) => deleteProperty(p.id));
}

// ─── Properties ──────────────────────────────────────────────

export function getProperties(): Property[] {
  const visibleClients = getVisibleClientIds();
  const props = load<Property>(PROPERTIES_KEY);
  if (visibleClients === null) return props;
  return props.filter((p) => visibleClients.has(p.clientId));
}

export function getPropertyById(id: string): Property | undefined {
  const prop = load<Property>(PROPERTIES_KEY).find((p) => p.id === id);
  if (!prop) return undefined;
  const visibleClients = getVisibleClientIds();
  if (visibleClients !== null && !visibleClients.has(prop.clientId)) return undefined;
  return prop;
}

export function getPropertiesByClient(clientId: string): Property[] {
  return load<Property>(PROPERTIES_KEY).filter((p) => p.clientId === clientId);
}

export function saveProperty(data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Property {
  const properties = load<Property>(PROPERTIES_KEY);
  const property: Property = { ...data, id: genId(), createdAt: now(), updatedAt: now() };
  properties.push(property);
  save(PROPERTIES_KEY, properties);
  return property;
}

export function updateProperty(id: string, updates: Partial<Property>): Property {
  const properties = load<Property>(PROPERTIES_KEY);
  const idx = properties.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Property not found');
  properties[idx] = { ...properties[idx], ...updates, updatedAt: now() };
  save(PROPERTIES_KEY, properties);
  return properties[idx];
}

export function deleteProperty(id: string): void {
  save(PROPERTIES_KEY, load<Property>(PROPERTIES_KEY).filter((p) => p.id !== id));
  const fields = getFieldsByProperty(id);
  fields.forEach((f) => deleteField(f.id));
}

// ─── Fields ──────────────────────────────────────────────────

export function getFields(): Field[] {
  const visibleClients = getVisibleClientIds();
  if (visibleClients === null) return load<Field>(FIELDS_KEY);
  const visiblePropertyIds = new Set(
    load<Property>(PROPERTIES_KEY)
      .filter((p) => visibleClients.has(p.clientId))
      .map((p) => p.id)
  );
  return load<Field>(FIELDS_KEY).filter((f) => visiblePropertyIds.has(f.propertyId));
}

export function getFieldById(id: string): Field | undefined {
  return load<Field>(FIELDS_KEY).find((f) => f.id === id);
}

export function getFieldsByProperty(propertyId: string): Field[] {
  return load<Field>(FIELDS_KEY).filter((f) => f.propertyId === propertyId);
}

export function saveField(data: Omit<Field, 'id' | 'createdAt' | 'updatedAt'>): Field {
  const fields = load<Field>(FIELDS_KEY);
  const field: Field = { ...data, id: genId(), createdAt: now(), updatedAt: now() };
  fields.push(field);
  save(FIELDS_KEY, fields);
  return field;
}

export function updateField(id: string, updates: Partial<Field>): Field {
  const fields = load<Field>(FIELDS_KEY);
  const idx = fields.findIndex((f) => f.id === id);
  if (idx === -1) throw new Error('Field not found');
  fields[idx] = { ...fields[idx], ...updates, updatedAt: now() };
  save(FIELDS_KEY, fields);
  return fields[idx];
}

export function deleteField(id: string): void {
  save(FIELDS_KEY, load<Field>(FIELDS_KEY).filter((f) => f.id !== id));
  const jobs = getJobsByField(id);
  jobs.forEach((j) => deleteJob(j.id));
}

// ─── Jobs ────────────────────────────────────────────────────

export function getJobs(): JobRecord[] {
  const visibleClients = getVisibleClientIds();
  const jobs = load<JobRecord>(JOBS_KEY);
  if (visibleClients === null) return jobs;
  return jobs.filter((j) => visibleClients.has(j.clientId));
}

export function getJobById(id: string): JobRecord | undefined {
  return load<JobRecord>(JOBS_KEY).find((j) => j.id === id);
}

export function getJobsByField(fieldId: string): JobRecord[] {
  return load<JobRecord>(JOBS_KEY).filter((j) => j.fieldId === fieldId).sort((a, b) => b.dateSprayed.localeCompare(a.dateSprayed));
}

export function getJobsByProperty(propertyId: string): JobRecord[] {
  return load<JobRecord>(JOBS_KEY).filter((j) => j.propertyId === propertyId).sort((a, b) => b.dateSprayed.localeCompare(a.dateSprayed));
}

export function getJobsByClient(clientId: string): JobRecord[] {
  return load<JobRecord>(JOBS_KEY).filter((j) => j.clientId === clientId).sort((a, b) => b.dateSprayed.localeCompare(a.dateSprayed));
}

export function saveJob(data: Omit<JobRecord, 'id' | 'createdAt' | 'updatedAt'>): JobRecord {
  const jobs = load<JobRecord>(JOBS_KEY);
  const job: JobRecord = { ...data, id: genId(), createdAt: now(), updatedAt: now() };
  jobs.push(job);
  save(JOBS_KEY, jobs);
  return job;
}

export function updateJob(id: string, updates: Partial<JobRecord>): JobRecord {
  const jobs = load<JobRecord>(JOBS_KEY);
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) throw new Error('Job not found');
  jobs[idx] = { ...jobs[idx], ...updates, updatedAt: now() };
  save(JOBS_KEY, jobs);
  return jobs[idx];
}

export function deleteJob(id: string): void {
  save(JOBS_KEY, load<JobRecord>(JOBS_KEY).filter((j) => j.id !== id));
  save(OUTCOMES_KEY, getOutcomes().filter((o) => o.jobId !== id));
}

// ─── Outcomes ────────────────────────────────────────────────

export function getOutcomes(): JobOutcome[] {
  return load<JobOutcome>(OUTCOMES_KEY);
}

export function getOutcomeByJob(jobId: string): JobOutcome | undefined {
  return getOutcomes().find((o) => o.jobId === jobId);
}

export function saveOutcome(data: Omit<JobOutcome, 'id' | 'createdAt' | 'updatedAt'>): JobOutcome {
  const outcomes = getOutcomes();
  const outcome: JobOutcome = { ...data, id: genId(), createdAt: now(), updatedAt: now() };
  outcomes.push(outcome);
  save(OUTCOMES_KEY, outcomes);
  return outcome;
}

export function updateOutcome(id: string, updates: Partial<JobOutcome>): JobOutcome {
  const outcomes = getOutcomes();
  const idx = outcomes.findIndex((o) => o.id === id);
  if (idx === -1) throw new Error('Outcome not found');
  outcomes[idx] = { ...outcomes[idx], ...updates, updatedAt: now() };
  save(OUTCOMES_KEY, outcomes);
  return outcomes[idx];
}

// ─── Aggregation helpers ─────────────────────────────────────

export function getClientSummary(clientId: string) {
  const properties = getPropertiesByClient(clientId);
  const propertyIds = new Set(properties.map((p) => p.id));
  const allFields = load<Field>(FIELDS_KEY);
  const fields = allFields.filter((f) => propertyIds.has(f.propertyId));
  const jobs = getJobsByClient(clientId);
  const lastJob = jobs.length > 0 ? jobs[0].dateSprayed : null;
  return {
    propertyCount: properties.length,
    fieldCount: fields.length,
    jobCount: jobs.length,
    lastJobDate: lastJob,
  };
}

export function getPropertySummary(propertyId: string) {
  const fields = getFieldsByProperty(propertyId);
  const jobs = getJobsByProperty(propertyId);
  const totalHa = fields.reduce((sum, f) => sum + (f.sizeHa || 0), 0);
  const lastJob = jobs.length > 0 ? jobs[0].dateSprayed : null;
  return {
    fieldCount: fields.length,
    totalHa,
    jobCount: jobs.length,
    lastJobDate: lastJob,
  };
}

export function getFieldSummary(fieldId: string) {
  const jobs = getJobsByField(fieldId);
  const lastJob = jobs.length > 0 ? jobs[0] : null;
  const lastOutcome = lastJob ? getOutcomeByJob(lastJob.id) : undefined;
  return {
    jobCount: jobs.length,
    lastJobDate: lastJob?.dateSprayed ?? null,
    lastWeed: lastJob?.weedTarget ?? null,
    lastEfficacy: lastOutcome?.efficacyRating ?? null,
  };
}

// ─── Admin helpers ───────────────────────────────────────────

export function getContractorClients(contractorUserId: string): Client[] {
  return load<Client>(CLIENTS_KEY).filter((c) => c.contractorUserId === contractorUserId);
}

export function getAllContractorStats() {
  const users = JSON.parse(localStorage.getItem('ftf_users') || '{}');
  const contractors = Object.values(users).filter((u: any) => u.role === 'contractor') as any[];
  return contractors.map((c: any) => {
    const clients = getContractorClients(c.id);
    const clientIds = new Set(clients.map((cl) => cl.id));
    const jobs = load<JobRecord>(JOBS_KEY).filter((j) => clientIds.has(j.clientId));
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      inviteCode: c.inviteCode,
      clientCount: clients.length,
      jobCount: jobs.length,
    };
  });
}

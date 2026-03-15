import { Quote, QuoteConfig, Kit } from '../types/quote';

const QUOTES_KEY = 'ftf_quotes';
const CONFIG_KEY = 'ftf_quote_config';
const KITS_KEY = 'ftf_kits';

// ─── Quote Config ────────────────────────────────────────────

export function getQuoteConfig(userId: string): QuoteConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const configs: QuoteConfig[] = JSON.parse(raw);
    return configs.find((c) => c.contractorUserId === userId) || null;
  } catch {
    return null;
  }
}

export function saveQuoteConfig(config: Omit<QuoteConfig, 'id' | 'createdAt' | 'updatedAt'>): QuoteConfig {
  const existing = getAllConfigs();
  const now = new Date().toISOString();
  const entry: QuoteConfig = {
    ...config,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  const filtered = existing.filter((c) => c.contractorUserId !== config.contractorUserId);
  filtered.push(entry);
  localStorage.setItem(CONFIG_KEY, JSON.stringify(filtered));
  return entry;
}

export function updateQuoteConfig(userId: string, updates: Partial<QuoteConfig>): QuoteConfig {
  const existing = getAllConfigs();
  const idx = existing.findIndex((c) => c.contractorUserId === userId);
  if (idx === -1) throw new Error('Config not found');
  existing[idx] = { ...existing[idx], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(existing));
  return existing[idx];
}

function getAllConfigs(): QuoteConfig[] {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ─── Kits ───────────────────────────────────────────────────────

function getAllKits(): Kit[] {
  try {
    const raw = localStorage.getItem(KITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAllKits(kits: Kit[]) {
  localStorage.setItem(KITS_KEY, JSON.stringify(kits));
}

export function getKits(userId: string): Kit[] {
  return getAllKits().filter((k) => k.contractorUserId === userId);
}

export function getKitById(id: string): Kit | undefined {
  return getAllKits().find((k) => k.id === id);
}

export function getDefaultKit(userId: string): Kit | undefined {
  return getKits(userId).find((k) => k.isDefault);
}

export function saveKit(data: Omit<Kit, 'id' | 'createdAt' | 'updatedAt'>): Kit {
  const all = getAllKits();
  const now = new Date().toISOString();

  // If this is set as default, clear default on others for this user
  if (data.isDefault) {
    for (const k of all) {
      if (k.contractorUserId === data.contractorUserId) k.isDefault = false;
    }
  }

  const kit: Kit = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  all.push(kit);
  saveAllKits(all);
  return kit;
}

export function updateKit(id: string, updates: Partial<Kit>): Kit {
  const all = getAllKits();
  const idx = all.findIndex((k) => k.id === id);
  if (idx === -1) throw new Error('Kit not found');

  // If setting as default, clear others
  if (updates.isDefault) {
    const userId = all[idx].contractorUserId;
    for (const k of all) {
      if (k.contractorUserId === userId) k.isDefault = false;
    }
  }

  all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
  saveAllKits(all);
  return all[idx];
}

export function deleteKit(id: string): void {
  const all = getAllKits().filter((k) => k.id !== id);
  saveAllKits(all);
}

// ─── Quotes ──────────────────────────────────────────────────

function getAllQuotes(): Quote[] {
  try {
    const raw = localStorage.getItem(QUOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(quotes: Quote[]) {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

export function getQuotes(userId?: string): Quote[] {
  const all = getAllQuotes();
  if (userId) return all.filter((q) => q.contractorUserId === userId);
  return all;
}

export function getQuoteById(id: string): Quote | undefined {
  return getAllQuotes().find((q) => q.id === id);
}

export function getQuotesByClient(clientId: string): Quote[] {
  return getAllQuotes().filter((q) => q.clientId === clientId);
}

export function saveQuote(data: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Quote {
  const all = getAllQuotes();
  const now = new Date().toISOString();
  const quote: Quote = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  all.push(quote);
  saveAll(all);
  return quote;
}

export function updateQuote(id: string, updates: Partial<Quote>): Quote {
  const all = getAllQuotes();
  const idx = all.findIndex((q) => q.id === id);
  if (idx === -1) throw new Error('Quote not found');
  all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
  saveAll(all);
  return all[idx];
}

export function deleteQuote(id: string): void {
  const all = getAllQuotes().filter((q) => q.id !== id);
  saveAll(all);
}

export function generateQuoteNumber(userId: string): string {
  const existing = getQuotes(userId);
  const maxNum = existing.reduce((max, q) => {
    const match = q.quoteNumber.match(/FTF-Q-(\d+)/);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `FTF-Q-${String(maxNum + 1).padStart(4, '0')}`;
}

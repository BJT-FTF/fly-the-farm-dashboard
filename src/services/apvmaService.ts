import { APVMAProduct } from '../types/chemical';

const PRODUCTS_RESOURCE_ID = 'b4bb5394-b60b-4602-8bde-2e206ffc498f';
const BASE_URL = 'https://data.gov.au/data/api/3/action/datastore_search';

interface APVMARawRecord {
  _id: number;
  pcode: string;
  prodtype: string;
  psched: string;
  regdate: string;
  fdesc: string;
  typedesc: string;
  hlevel1: string;
  fpname: string;
  sname: string;
  regcode: string;
  expdate: string;
  scode1: string;
}

interface CKANResponse {
  success: boolean;
  result: {
    records: APVMARawRecord[];
    total: number;
  };
}

const cache = new Map<string, { data: APVMAProduct[]; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const scheduleMap: Record<string, string> = {
  '5': 'S5 – Caution',
  '6': 'S6 – Poison',
  '7': 'S7 – Dangerous Poison',
  '': 'Unscheduled',
};

function mapRecord(record: APVMARawRecord): APVMAProduct {
  return {
    id: `apvma-${record.pcode}`,
    productName: record.fpname || 'Unknown',
    apvmaNumber: record.pcode,
    registrant: record.sname || 'Unknown',
    category: record.hlevel1 || 'Unknown',
    formulation: record.fdesc || 'Unknown',
    poisonSchedule: scheduleMap[record.psched] || record.psched || 'Unknown',
    registrationStatus: record.regcode === 'R' ? 'Registered' : record.regcode === 'A' ? 'Approved' : record.regcode || 'Unknown',
    registrationDate: formatDate(record.regdate),
    expiryDate: formatDate(record.expdate),
    source: 'apvma',
  };
}

function formatDate(raw: string): string {
  if (!raw) return '—';
  // Format: "1/07/2025 12:00:00 AM" → "1 Jul 2025"
  try {
    const date = new Date(raw);
    if (isNaN(date.getTime())) return raw;
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return raw;
  }
}

export async function searchAPVMAProducts(query: string): Promise<APVMAProduct[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const cached = cache.get(q);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = `${BASE_URL}?resource_id=${PRODUCTS_RESOURCE_ID}&q=${encodeURIComponent(q)}&limit=20`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`APVMA API error: ${response.status}`);
  }

  const json: CKANResponse = await response.json();
  if (!json.success) {
    throw new Error('APVMA API returned unsuccessful response');
  }

  // Filter to agricultural products only, currently registered
  const products = json.result.records
    .filter((r) => r.prodtype === 'A' && r.regcode === 'R')
    .map(mapRecord);

  cache.set(q, { data: products, timestamp: Date.now() });
  return products;
}

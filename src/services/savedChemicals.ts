import { WeedTreatment, APVMAProduct } from '../types/chemical';

const STORAGE_KEY = 'ftf_saved_chemicals';

export function getSavedChemicals(): WeedTreatment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTreatments(treatments: WeedTreatment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(treatments));
}

export function saveAPVMAProduct(product: APVMAProduct): WeedTreatment {
  const existing = getSavedChemicals();

  // Don't duplicate
  const existingEntry = existing.find((t) => t.id === `apvma-saved-${product.apvmaNumber}`);
  if (existingEntry) return existingEntry;

  const treatment: WeedTreatment = {
    id: `apvma-saved-${product.apvmaNumber}`,
    weed: '—',
    brands: product.productName,
    activeIngredient: product.category || 'See product label',
    droneStatus: 'not-permitted',
    droneStatusNote: 'Drone application status unverified — check product label for aerial application directions.',
    aerialRate: 'See product label',
    waterLHa: 'See product label',
    droneParams: null,
    bestTiming: 'See product label',
    adjuvantNotes: 'See product label',
    source: 'apvma-auto',
    apvmaNumber: product.apvmaNumber,
    registrant: product.registrant,
    formulation: product.formulation,
    poisonSchedule: product.poisonSchedule,
    savedAt: new Date().toISOString(),
  };

  existing.push(treatment);
  saveTreatments(existing);
  return treatment;
}

export function saveAPVMAProducts(products: APVMAProduct[]): WeedTreatment[] {
  return products.map(saveAPVMAProduct);
}

export function removeSavedChemical(id: string): void {
  const existing = getSavedChemicals();
  saveTreatments(existing.filter((t) => t.id !== id));
}

export function getSavedCount(): number {
  return getSavedChemicals().length;
}

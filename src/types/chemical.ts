export type DroneStatus =
  | 'permitted'
  | 'permitted-helicopter-caution'
  | 'permitted-granular'
  | 'permitted-fallow-only'
  | 'not-permitted'
  | 'not-permitted-aquatic';

export interface DroneFlightParams {
  dropletSize: string;
  flightHeightM: string;
  speedMs: string;
}

export type TreatmentSource = 'curated' | 'apvma-auto';

export interface WeedTreatment {
  id: string;
  weed: string;
  brands: string;
  activeIngredient: string;
  droneStatus: DroneStatus;
  droneStatusNote: string;
  aerialRate: string;
  waterLHa: string;
  droneParams: DroneFlightParams | null;
  bestTiming: string;
  adjuvantNotes: string;
  source?: TreatmentSource;
  apvmaNumber?: string;
  registrant?: string;
  formulation?: string;
  poisonSchedule?: string;
  labelUrl?: string;
  savedAt?: string;
}

export interface APVMAProduct {
  id: string;
  productName: string;
  apvmaNumber: string;
  registrant: string;
  category: string;
  formulation: string;
  poisonSchedule: string;
  registrationStatus: string;
  registrationDate: string;
  expiryDate: string;
  source: 'apvma';
}

export interface TankMixIngredient {
  product: string;
  activeIngredient: string;
  rate: string;
}

export interface TankMixRecipe {
  id: string;
  weed: string;
  name: string;
  description: string;
  chemicals: TankMixIngredient[];
  waterLHa: string;
  dropletSize: string;
  adjuvant: string;
  notes: string;
  droneCompatible: boolean;
}

export type SearchResult =
  | { type: 'local'; data: WeedTreatment }
  | { type: 'apvma'; data: APVMAProduct };

import { KitSelection } from './quote';

// ─── Cost Line Item (for breakdowns) ────────────────────────

export interface CostLineItem {
  id: string;
  description: string;
  quantity: number;
  unitLabel: string;  // e.g. 'L', 'nights', 'hrs', 'ea'
  unitCost: number;
  total: number;
}

// ─── Actual Cost Categories ─────────────────────────────────

export interface ActualEquipmentCosts {
  kitSelections: KitSelection[];
  actualFlightHours: number;
  fuelTotal: number;
  fuelBreakdown: CostLineItem[];
}

export interface ActualLabourCosts {
  pilotCount: number;
  pilotHours: number;
  pilotRatePerHour: number;
  hasChemOperator: boolean;
  chemOpHours: number;
  chemOpRatePerHour: number;
  additionalLabour: CostLineItem[];
}

export interface ActualTravelCosts {
  kilometres: number;
  vehicleCostPerKm: number;
  vehicleTotal: number;
  accommodation: number;
  accommodationBreakdown: CostLineItem[];
  meals: number;
  mealsBreakdown: CostLineItem[];
}

export interface ActualRepairCosts {
  items: CostLineItem[];
}

export interface ActualOtherCosts {
  items: CostLineItem[];
}

// ─── Daily Hours Entry ──────────────────────────────────────

export interface DailyHoursEntry {
  date: string;   // ISO date e.g. '2026-03-17'
  hours: number;
}

// ─── Job Actual ─────────────────────────────────────────────

export type ActualStatus = 'draft' | 'finalised';

export interface JobActual {
  id: string;
  contractorUserId: string;

  // Links (all optional)
  jobId?: string;
  quoteId?: string;
  clientId?: string;
  propertyId?: string;
  fieldId?: string;

  // Header
  title: string;
  startDate: string;
  endDate: string;
  dailyHours: DailyHoursEntry[];
  totalDays: number;
  totalHours: number;
  status: ActualStatus;

  // Rate & Revenue
  rateType: 'hourly' | 'hectare';
  rate: number;
  hectares?: number;
  revenue: number;
  effectiveHourlyRate: number;
  revenueNotes: string;

  // Costs
  equipment: ActualEquipmentCosts;
  labour: ActualLabourCosts;
  travel: ActualTravelCosts;
  repairs: ActualRepairCosts;
  otherCosts: ActualOtherCosts;
  chemicalCost: number;

  // Calculated
  totalCost: number;
  grossProfit: number;
  grossMarginPercent: number;

  // Notes
  notes: string;
  lessonsLearned: string;

  createdAt: string;
  updatedAt: string;
}

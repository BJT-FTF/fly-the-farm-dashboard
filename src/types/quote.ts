export type PricingMode = 'per-hectare' | 'per-litre' | 'per-hour' | 'daily-contract';

export type LineItemType =
  | 'broadacre-spray'
  | 'per-litre-spray'
  | 'spot-spray'
  | 'daily-contract'
  | 'travel'
  | 'setup'
  | 'chemical-cost'
  | 'complex-mix-fee'
  | 'hazardous-ppe'
  | 'complexity-surcharge'
  | 'custom';

export interface QuoteLineItem {
  id: string;
  type: LineItemType;
  description: string;
  quantity: number;
  unitLabel: string;
  unitRate: number;
  amount: number;
  applicationRateLHa?: number;
  chemicalName?: string;
  suppliedBy?: 'operator' | 'client';
  sortOrder: number;
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired' | 'invoiced';

// ─── Kit (saved equipment profiles) ────────────────────────────

export type DroneModel = 'T25' | 'T40' | 'T50' | 'T50 (with D-RTK)' | 'T100' | 'Other';

export interface Kit {
  id: string;
  contractorUserId: string;
  name: string;
  isDefault: boolean;

  // Drone
  droneModel: DroneModel;
  droneCustomName: string;
  dronePurchasePrice: number;
  droneLifespanYears: number;
  tankSizeLitres: number;

  // Batteries
  batteryCount: number;
  batteryPriceEach: number;
  batteryCycleLife: number;
  flightMinutesPerCharge: number;

  // Charger & Generator
  chargerPrice: number;
  chargerLifespanYears: number;
  generatorPrice: number;
  generatorLifespanYears: number;
  generatorFuelCostPerHour: number;

  // Consumables (per flight hour)
  propsCostPerHour: number;
  nozzlesCostPerHour: number;
  filtersCostPerHour: number;
  pumpServiceCostPerHour: number;
  otherConsumablesPerHour: number;

  // Vehicle
  vehicleCostPerKm: number;

  // Insurance (annual)
  publicLiabilityAnnual: number;
  hullInsuranceAnnual: number;
  workersCompAnnual: number;
  professionalIndemnityAnnual: number;

  // Licensing (annual)
  licensingCostsAnnual: number;

  // Software (annual)
  softwareCostsAnnual: number;

  // Labour
  pilotCostPerHour: number;
  pilotIncludesSuper: boolean;

  // PPE & Safety (annual)
  ppeSafetyAnnual: number;

  // Maintenance (annual)
  maintenanceBudgetAnnual: number;

  // Overhead (annual)
  overheadAnnual: number;

  // Estimated usage for cost allocation
  estimatedFlightHoursPerYear: number;
  estimatedJobsPerYear: number;
  estimatedKmPerYear: number;
  estimatedRevenuePerYear: number;

  // Productivity
  hectaresPerFlightHour: number;

  createdAt: string;
  updatedAt: string;
}

// ─── Multi-Kit & Crew ─────────────────────────────────────────

export interface KitSelection {
  kitId: string;
  quantity: number;
}

export interface CrewConfig {
  pilotCount: number;
  pilotRatePerHour: number;       // overridable per quote
  hasChemOperator: boolean;
  chemOperatorRatePerHour: number; // overridable per quote
}

// ─── Job Cost Breakdown ────────────────────────────────────────

export interface JobCostBreakdown {
  // Per-job calculated costs
  droneDepreciationPerHour: number;
  batteryDepreciationPerHour: number;
  chargerDepreciationPerHour: number;
  generatorDepreciationPerHour: number;
  consumablesPerHour: number;
  generatorFuelPerHour: number;
  totalEquipmentCostPerHour: number;

  insurancePerHour: number;
  licensingPerJob: number;
  softwarePerJob: number;
  ppeSafetyPerJob: number;
  maintenancePerHour: number;
  overheadPercent: number;

  // Job-specific
  estimatedFlightHours: number;
  estimatedTotalHours: number; // includes setup/travel time
  travelKm: number;

  // Totals
  equipmentCost: number;
  labourCost: number;
  vehicleCost: number;
  insuranceCost: number;
  fixedCostAllocation: number; // licensing + software + PPE + overhead
  chemicalCostToOperator: number;
  totalCost: number;
}

export interface QuoteMargin {
  revenue: number; // total ex GST
  totalCost: number;
  grossProfit: number;
  grossMarginPercent: number;
  revenuePerHour: number;
  costPerHour: number;
  profitPerHour: number;
  revenuePerHectare: number;
  costPerHectare: number;
  profitPerHectare: number;
}

// ─── Quote Config ──────────────────────────────────────────────

export interface QuoteConfig {
  id: string;
  contractorUserId: string;

  // Per-hectare defaults
  defaultApplicationRateLHa: number;
  defaultRateMultiplier: number;
  defaultPerHaOverride: number | null;

  // Per-hour defaults
  defaultHourlyRate: number;
  defaultSpotSprayHourlyRate: number;
  defaultDailyContractRate: number;

  // Travel
  defaultTravelRatePerKm: number;

  // Fees
  defaultSetupFee: number;
  defaultComplexMixFee: number;
  defaultHazardousPPEHourly: number;
  defaultComplexitySurchargePerHour: number;
  defaultChemOperatorRatePerHour: number;

  // Chemical admin
  defaultChemicalAdminPercent: number;

  // Business
  defaultMarkupPercent: number;
  businessName: string;
  businessABN: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  logoDataUrl: string | null;

  // GST
  gstRegistered: boolean;
  gstRate: number;

  // Terms
  defaultPaymentTermsDays: number;
  defaultQuoteValidityDays: number;
  termsAndConditions: string;

  createdAt: string;
  updatedAt: string;
}

export interface QuoteTotals {
  subtotal: number;
  markupPercent: number;
  markupAmount: number;
  subtotalAfterMarkup: number;
  gstApplicable: boolean;
  gstRate: number;
  gstAmount: number;
  total: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  contractorUserId: string;
  clientId: string;
  propertyId?: string;
  fieldIds?: string[];
  jobIds?: string[];  // Linked job(s) created from this quote

  status: QuoteStatus;
  pricingMode: PricingMode;

  jobDescription: string;
  estimatedDate: string;
  validUntil: string;

  lineItems: QuoteLineItem[];

  subtotal: number;
  markupPercent: number;
  markupAmount: number;
  subtotalAfterMarkup: number;
  gstApplicable: boolean;
  gstRate: number;
  gstAmount: number;
  total: number;

  // Cost & margin tracking
  kitId?: string;               // legacy single kit
  kitSelections?: KitSelection[];
  crew?: CrewConfig;
  costBreakdown?: JobCostBreakdown;
  margin?: QuoteMargin;

  paymentTermsDays: number;
  termsAndConditions: string;
  notes: string;
  clientNotes: string;

  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
  acceptedAt: string | null;
}

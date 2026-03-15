import { QuoteLineItem, QuoteTotals, Kit, JobCostBreakdown, QuoteMargin } from '../types/quote';

/**
 * Compute per-hectare rate from application rate and multiplier.
 * Australian industry standard: rate x 1.8
 */
export function computePerHaRate(applicationRateLHa: number, multiplier: number): number {
  return Math.round(applicationRateLHa * multiplier * 100) / 100;
}

/**
 * Calculate chemical cost including admin/markup fee.
 */
export function computeChemicalCost(
  costPerUnit: number,
  unitsRequired: number,
  adminPercent: number,
): number {
  const baseCost = costPerUnit * unitsRequired;
  return Math.round(baseCost * (1 + adminPercent / 100) * 100) / 100;
}

/**
 * Calculate all totals from line items.
 */
export function calculateTotals(
  lineItems: QuoteLineItem[],
  markupPercent: number,
  gstApplicable: boolean,
  gstRate: number,
): QuoteTotals {
  const subtotal = lineItems.reduce((sum, li) => sum + li.amount, 0);
  const markupAmount = Math.round(subtotal * (markupPercent / 100) * 100) / 100;
  const subtotalAfterMarkup = Math.round((subtotal + markupAmount) * 100) / 100;
  const gstAmount = gstApplicable
    ? Math.round(subtotalAfterMarkup * gstRate * 100) / 100
    : 0;
  const total = Math.round((subtotalAfterMarkup + gstAmount) * 100) / 100;

  return {
    subtotal,
    markupPercent,
    markupAmount,
    subtotalAfterMarkup,
    gstApplicable,
    gstRate,
    gstAmount,
    total,
  };
}

/**
 * Calculate hourly cost rates from a kit.
 */
export function calculateKitHourlyRates(kit: Kit) {
  const hrs = kit.estimatedFlightHoursPerYear || 500;
  const jobs = kit.estimatedJobsPerYear || 150;
  const rev = kit.estimatedRevenuePerYear || 200000;

  // Drone depreciation per flight hour
  const droneDepPerHour = kit.dronePurchasePrice / (kit.droneLifespanYears * hrs);

  // Battery depreciation per flight hour
  // Each battery lasts batteryCycleLife charges. Each charge gives flightMinutesPerCharge.
  // Total battery hours = batteryCount * batteryCycleLife * flightMinutesPerCharge / 60
  const totalBatteryHours = kit.batteryCount * kit.batteryCycleLife * kit.flightMinutesPerCharge / 60;
  const totalBatteryCost = kit.batteryCount * kit.batteryPriceEach;
  const batteryDepPerHour = totalBatteryHours > 0 ? totalBatteryCost / totalBatteryHours : 0;

  // Charger depreciation
  const chargerDepPerHour = kit.chargerPrice / (kit.chargerLifespanYears * hrs);

  // Generator depreciation
  const genDepPerHour = kit.generatorPrice / (kit.generatorLifespanYears * hrs);

  // Consumables (already per-hour)
  const consumablesPerHour =
    kit.propsCostPerHour +
    kit.nozzlesCostPerHour +
    kit.filtersCostPerHour +
    kit.pumpServiceCostPerHour +
    kit.otherConsumablesPerHour;

  // Generator fuel
  const fuelPerHour = kit.generatorFuelCostPerHour;

  // Total equipment per flight hour
  const totalEquipmentPerHour =
    droneDepPerHour +
    batteryDepPerHour +
    chargerDepPerHour +
    genDepPerHour +
    consumablesPerHour +
    fuelPerHour;

  // Insurance per flight hour
  const totalInsuranceAnnual =
    kit.publicLiabilityAnnual +
    kit.hullInsuranceAnnual +
    kit.workersCompAnnual +
    kit.professionalIndemnityAnnual;
  const insurancePerHour = totalInsuranceAnnual / hrs;

  // Per-job fixed costs
  const licensingPerJob = kit.licensingCostsAnnual / jobs;
  const softwarePerJob = kit.softwareCostsAnnual / jobs;
  const ppeSafetyPerJob = kit.ppeSafetyAnnual / jobs;

  // Maintenance per flight hour
  const maintenancePerHour = kit.maintenanceBudgetAnnual / hrs;

  // Overhead as % of revenue
  const overheadPercent = rev > 0 ? (kit.overheadAnnual / rev) * 100 : 0;

  // Vehicle cost per km
  const vehicleCostPerKm = kit.vehicleCostPerKm;

  return {
    droneDepPerHour: r2(droneDepPerHour),
    batteryDepPerHour: r2(batteryDepPerHour),
    chargerDepPerHour: r2(chargerDepPerHour),
    genDepPerHour: r2(genDepPerHour),
    consumablesPerHour: r2(consumablesPerHour),
    fuelPerHour: r2(fuelPerHour),
    totalEquipmentPerHour: r2(totalEquipmentPerHour),
    insurancePerHour: r2(insurancePerHour),
    licensingPerJob: r2(licensingPerJob),
    softwarePerJob: r2(softwarePerJob),
    ppeSafetyPerJob: r2(ppeSafetyPerJob),
    maintenancePerHour: r2(maintenancePerHour),
    overheadPercent: r2(overheadPercent),
    vehicleCostPerKm: r2(vehicleCostPerKm),
    pilotCostPerHour: kit.pilotCostPerHour,
    hectaresPerFlightHour: kit.hectaresPerFlightHour,
  };
}

/**
 * Calculate full job cost breakdown for a quote.
 */
export function calculateJobCosts(
  kit: Kit,
  estimatedFlightHours: number,
  setupAndTravelHours: number,
  travelKm: number,
  operatorChemicalCost: number,
  revenue: number,
): JobCostBreakdown {
  const rates = calculateKitHourlyRates(kit);
  const totalHours = estimatedFlightHours + setupAndTravelHours;

  // Equipment costs (flight hours only — drone only runs during spray)
  const equipmentCost = r2(rates.totalEquipmentPerHour * estimatedFlightHours);

  // Labour (all hours — pilot is working during travel/setup too)
  const labourCost = r2(rates.pilotCostPerHour * totalHours);

  // Vehicle
  const vehicleCost = r2(rates.vehicleCostPerKm * travelKm);

  // Insurance (flight hours)
  const insuranceCost = r2(rates.insurancePerHour * estimatedFlightHours);

  // Fixed cost allocation (per-job amounts)
  const fixedCosts = r2(
    rates.licensingPerJob +
    rates.softwarePerJob +
    rates.ppeSafetyPerJob +
    rates.maintenancePerHour * estimatedFlightHours,
  );

  // Overhead (% of revenue)
  const overheadAmount = r2(revenue * (rates.overheadPercent / 100));

  const totalCost = r2(
    equipmentCost +
    labourCost +
    vehicleCost +
    insuranceCost +
    fixedCosts +
    overheadAmount +
    operatorChemicalCost,
  );

  return {
    droneDepreciationPerHour: rates.droneDepPerHour,
    batteryDepreciationPerHour: rates.batteryDepPerHour,
    chargerDepreciationPerHour: rates.chargerDepPerHour,
    generatorDepreciationPerHour: rates.genDepPerHour,
    consumablesPerHour: rates.consumablesPerHour,
    generatorFuelPerHour: rates.fuelPerHour,
    totalEquipmentCostPerHour: rates.totalEquipmentPerHour,
    insurancePerHour: rates.insurancePerHour,
    licensingPerJob: rates.licensingPerJob,
    softwarePerJob: rates.softwarePerJob,
    ppeSafetyPerJob: rates.ppeSafetyPerJob,
    maintenancePerHour: rates.maintenancePerHour,
    overheadPercent: rates.overheadPercent,
    estimatedFlightHours,
    estimatedTotalHours: totalHours,
    travelKm,
    equipmentCost,
    labourCost,
    vehicleCost,
    insuranceCost,
    fixedCostAllocation: r2(fixedCosts + overheadAmount),
    chemicalCostToOperator: operatorChemicalCost,
    totalCost,
  };
}

/**
 * Calculate job costs with multiple kits and crew configuration.
 *
 * Per-drone costs (scale with quantity):
 *   drone depreciation, battery depreciation, charger depreciation,
 *   consumables (props/nozzles/filters), hull insurance
 *
 * Per-job costs (fixed, from primary kit):
 *   generator fuel & depreciation, vehicle, public liability,
 *   professional indemnity, licensing, software, PPE, overhead, maintenance
 */
export function calculateMultiKitJobCosts(
  kits: { kit: Kit; quantity: number }[],
  crew: { pilotCount: number; pilotRate: number; hasChemOp: boolean; chemOpRate: number },
  estimatedFlightHours: number,
  setupAndTravelHours: number,
  travelKm: number,
  operatorChemicalCost: number,
  revenue: number,
): JobCostBreakdown {
  if (kits.length === 0) {
    return {
      droneDepreciationPerHour: 0, batteryDepreciationPerHour: 0,
      chargerDepreciationPerHour: 0, generatorDepreciationPerHour: 0,
      consumablesPerHour: 0, generatorFuelPerHour: 0, totalEquipmentCostPerHour: 0,
      insurancePerHour: 0, licensingPerJob: 0, softwarePerJob: 0,
      ppeSafetyPerJob: 0, maintenancePerHour: 0, overheadPercent: 0,
      estimatedFlightHours, estimatedTotalHours: estimatedFlightHours + setupAndTravelHours,
      travelKm, equipmentCost: 0, labourCost: 0, vehicleCost: 0,
      insuranceCost: 0, fixedCostAllocation: 0, chemicalCostToOperator: operatorChemicalCost,
      totalCost: operatorChemicalCost,
    };
  }

  const primaryKit = kits[0].kit;
  const primaryHrs = primaryKit.estimatedFlightHoursPerYear || 500;
  const primaryJobs = primaryKit.estimatedJobsPerYear || 150;
  const primaryRev = primaryKit.estimatedRevenuePerYear || 200000;
  const totalHours = estimatedFlightHours + setupAndTravelHours;

  // ── Per-drone costs (summed across all kits × quantities) ──
  let totalDroneDepPerHour = 0;
  let totalBatteryDepPerHour = 0;
  let totalChargerDepPerHour = 0;
  let totalConsumablesPerHour = 0;
  let totalHullInsurancePerHour = 0;

  for (const { kit, quantity } of kits) {
    const hrs = kit.estimatedFlightHoursPerYear || 500;

    const droneDepPerHour = kit.dronePurchasePrice / (kit.droneLifespanYears * hrs);
    const totalBatteryHours = kit.batteryCount * kit.batteryCycleLife * kit.flightMinutesPerCharge / 60;
    const totalBatteryCost = kit.batteryCount * kit.batteryPriceEach;
    const batteryDepPerHour = totalBatteryHours > 0 ? totalBatteryCost / totalBatteryHours : 0;
    const chargerDepPerHour = kit.chargerPrice / (kit.chargerLifespanYears * hrs);
    const consumables = kit.propsCostPerHour + kit.nozzlesCostPerHour +
      kit.filtersCostPerHour + kit.pumpServiceCostPerHour + kit.otherConsumablesPerHour;
    const hullPerHour = kit.hullInsuranceAnnual / hrs;

    totalDroneDepPerHour += droneDepPerHour * quantity;
    totalBatteryDepPerHour += batteryDepPerHour * quantity;
    totalChargerDepPerHour += chargerDepPerHour * quantity;
    totalConsumablesPerHour += consumables * quantity;
    totalHullInsurancePerHour += hullPerHour * quantity;
  }

  // Workers comp scales per crew member
  const crewCount = crew.pilotCount + (crew.hasChemOp ? 1 : 0);
  const workersCompPerHour = (primaryKit.workersCompAnnual / primaryHrs) * crewCount;

  // ── Per-job costs (fixed, from primary kit) ──
  const genDepPerHour = primaryKit.generatorPrice / (primaryKit.generatorLifespanYears * primaryHrs);
  const fuelPerHour = primaryKit.generatorFuelCostPerHour;
  const publicLiabilityPerHour = primaryKit.publicLiabilityAnnual / primaryHrs;
  const profIndemnityPerHour = primaryKit.professionalIndemnityAnnual / primaryHrs;
  const maintenancePerHour = primaryKit.maintenanceBudgetAnnual / primaryHrs;
  const licensingPerJob = primaryKit.licensingCostsAnnual / primaryJobs;
  const softwarePerJob = primaryKit.softwareCostsAnnual / primaryJobs;
  const ppeSafetyPerJob = primaryKit.ppeSafetyAnnual / primaryJobs;
  const overheadPercent = primaryRev > 0 ? (primaryKit.overheadAnnual / primaryRev) * 100 : 0;

  // ── Totals ──
  const perDroneEquipPerHour = totalDroneDepPerHour + totalBatteryDepPerHour +
    totalChargerDepPerHour + totalConsumablesPerHour;
  const perJobEquipPerHour = genDepPerHour + fuelPerHour;
  const totalEquipmentPerHour = perDroneEquipPerHour + perJobEquipPerHour;

  const equipmentCost = r2(totalEquipmentPerHour * estimatedFlightHours);

  // Insurance (per-drone: hull; per-job: public liability, prof indemnity; per-crew: workers comp)
  const insurancePerHour = totalHullInsurancePerHour + publicLiabilityPerHour +
    profIndemnityPerHour + workersCompPerHour;
  const insuranceCost = r2(insurancePerHour * estimatedFlightHours);

  // Labour: pilots + optional chem operator
  const pilotLabour = crew.pilotCount * crew.pilotRate * totalHours;
  const chemOpLabour = crew.hasChemOp ? crew.chemOpRate * totalHours : 0;
  const labourCost = r2(pilotLabour + chemOpLabour);

  const vehicleCost = r2(primaryKit.vehicleCostPerKm * travelKm);

  const fixedCosts = r2(
    licensingPerJob + softwarePerJob + ppeSafetyPerJob +
    maintenancePerHour * estimatedFlightHours
  );
  const overheadAmount = r2(revenue * (overheadPercent / 100));

  const totalCost = r2(
    equipmentCost + labourCost + vehicleCost + insuranceCost +
    fixedCosts + overheadAmount + operatorChemicalCost
  );

  return {
    droneDepreciationPerHour: r2(totalDroneDepPerHour),
    batteryDepreciationPerHour: r2(totalBatteryDepPerHour),
    chargerDepreciationPerHour: r2(totalChargerDepPerHour),
    generatorDepreciationPerHour: r2(genDepPerHour),
    consumablesPerHour: r2(totalConsumablesPerHour),
    generatorFuelPerHour: r2(fuelPerHour),
    totalEquipmentCostPerHour: r2(totalEquipmentPerHour),
    insurancePerHour: r2(insurancePerHour),
    licensingPerJob: r2(licensingPerJob),
    softwarePerJob: r2(softwarePerJob),
    ppeSafetyPerJob: r2(ppeSafetyPerJob),
    maintenancePerHour: r2(maintenancePerHour),
    overheadPercent: r2(overheadPercent),
    estimatedFlightHours,
    estimatedTotalHours: totalHours,
    travelKm,
    equipmentCost,
    labourCost,
    vehicleCost,
    insuranceCost,
    fixedCostAllocation: r2(fixedCosts + overheadAmount),
    chemicalCostToOperator: operatorChemicalCost,
    totalCost,
  };
}

/**
 * Calculate margin from revenue and costs.
 */
export function calculateMargin(
  revenue: number,
  costBreakdown: JobCostBreakdown,
  hectares: number,
): QuoteMargin {
  const totalCost = costBreakdown.totalCost;
  const grossProfit = r2(revenue - totalCost);
  const grossMarginPercent = revenue > 0 ? r2((grossProfit / revenue) * 100) : 0;
  const totalHours = costBreakdown.estimatedTotalHours || 1;
  const ha = hectares || 1;

  return {
    revenue,
    totalCost,
    grossProfit,
    grossMarginPercent,
    revenuePerHour: r2(revenue / totalHours),
    costPerHour: r2(totalCost / totalHours),
    profitPerHour: r2(grossProfit / totalHours),
    revenuePerHectare: r2(revenue / ha),
    costPerHectare: r2(totalCost / ha),
    profitPerHectare: r2(grossProfit / ha),
  };
}

/**
 * Format currency for display (AUD).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Round to 2 decimal places */
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Create a default kit template with typical T50 values.
 */
export function createDefaultKitValues(userId: string): Omit<Kit, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    contractorUserId: userId,
    name: 'DJI T50 — Standard Kit',
    isDefault: true,

    droneModel: 'T50',
    droneCustomName: '',
    dronePurchasePrice: 34500,
    droneLifespanYears: 4,
    tankSizeLitres: 40,

    batteryCount: 4,
    batteryPriceEach: 3850,
    batteryCycleLife: 1500,
    flightMinutesPerCharge: 8,

    chargerPrice: 2380,
    chargerLifespanYears: 5,
    generatorPrice: 8990,
    generatorLifespanYears: 5,
    generatorFuelCostPerHour: 10,

    propsCostPerHour: 1,
    nozzlesCostPerHour: 3,
    filtersCostPerHour: 0.50,
    pumpServiceCostPerHour: 0.50,
    otherConsumablesPerHour: 1,

    vehicleCostPerKm: 0.88,

    publicLiabilityAnnual: 3000,
    hullInsuranceAnnual: 3500,
    workersCompAnnual: 2000,
    professionalIndemnityAnnual: 1200,

    licensingCostsAnnual: 1500,
    softwareCostsAnnual: 2000,

    pilotCostPerHour: 60,
    pilotIncludesSuper: true,

    ppeSafetyAnnual: 1200,
    maintenanceBudgetAnnual: 5000,
    overheadAnnual: 12000,

    estimatedFlightHoursPerYear: 500,
    estimatedJobsPerYear: 150,
    estimatedKmPerYear: 20000,
    estimatedRevenuePerYear: 200000,

    hectaresPerFlightHour: 18,
  };
}

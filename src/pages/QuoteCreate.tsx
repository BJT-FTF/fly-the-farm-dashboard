import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  Alert,
  Autocomplete,
  Divider,
  Chip,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';
import ScienceIcon from '@mui/icons-material/Science';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PrintIcon from '@mui/icons-material/Print';
import {
  getClients,
  getPropertiesByClient,
  getFieldsByProperty,
  getFieldById,
  saveClient,
  updateJob,
} from '../services/fieldManagementStore';
import {
  getQuoteConfig,
  saveQuoteConfig,
  saveQuote,
  updateQuote,
  generateQuoteNumber,
  getKits,
  getDefaultKit,
  getKitById,
} from '../services/quoteStore';
import { PricingMode, QuoteLineItem, QuoteConfig, Kit } from '../types/quote';
import { calculateTotals, computePerHaRate, calculateJobCosts, calculateMultiKitJobCosts, calculateMargin, formatCurrency } from '../utils/quoteCalculator';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import { useAuth } from '../contexts/AuthContext';

const APPLICATION_RATE_OPTIONS = [10, 15, 20, 25, 30, 40, 50, 60, 80, 100, 120, 140];

function newLineItem(partial: Partial<QuoteLineItem>): QuoteLineItem {
  return {
    id: crypto.randomUUID(),
    type: 'custom',
    description: '',
    quantity: 0,
    unitLabel: 'ea',
    unitRate: 0,
    amount: 0,
    sortOrder: 0,
    ...partial,
  };
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          {icon}
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

export default function QuoteCreate() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const userId = user?.id || '';

  // Load or create config
  const existingConfig = useMemo(() => getQuoteConfig(userId), [userId]);
  const config: QuoteConfig = existingConfig || {
    id: '',
    contractorUserId: userId,
    defaultApplicationRateLHa: 30,
    defaultRateMultiplier: 1.8,
    defaultPerHaOverride: null,
    defaultHourlyRate: 250,
    defaultSpotSprayHourlyRate: 300,
    defaultDailyContractRate: 2200,
    defaultTravelRatePerKm: 1.50,
    defaultSetupFee: 150,
    defaultComplexMixFee: 75,
    defaultHazardousPPEHourly: 80,
    defaultComplexitySurchargePerHour: 80,
    defaultChemOperatorRatePerHour: 45,
    defaultChemicalAdminPercent: 10,
    defaultMarkupPercent: 0,
    businessName: '',
    businessABN: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    logoDataUrl: null,
    gstRegistered: true,
    gstRate: 0.10,
    defaultPaymentTermsDays: 14,
    defaultQuoteValidityDays: 30,
    termsAndConditions: '50% deposit required before commencement of work. Balance due on completion. All prices in AUD.',
    createdAt: '',
    updatedAt: '',
  };

  // ─── Form state ────────────────────────────────────────────

  // Client / Property / Field
  const [clientRefresh, setClientRefresh] = useState(0);
  const allClients = useMemo(() => getClients(), [clientRefresh]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);

  // Prefill from job (Task 3)
  const [fromJobId, setFromJobId] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('ftf_quote_prefill');
    if (raw) {
      sessionStorage.removeItem('ftf_quote_prefill');
      try {
        const prefill = JSON.parse(raw);
        if (prefill.clientId) setClientId(prefill.clientId);
        if (prefill.propertyId) setPropertyId(prefill.propertyId);
        if (prefill.fieldIds) setSelectedFieldIds(prefill.fieldIds);
        if (prefill.jobDescription) setJobDescription(prefill.jobDescription);
        setFromJobId(prefill.fromJobId || null);
      } catch { /* ignore bad data */ }
    }
  }, []);

  // Quick-add client dialog (Task 6)
  const [quickClientOpen, setQuickClientOpen] = useState(false);
  const [quickClient, setQuickClient] = useState({ name: '', phone: '', email: '' });

  const clientProperties = useMemo(
    () => (clientId ? getPropertiesByClient(clientId) : []),
    [clientId],
  );
  const propertyFields = useMemo(
    () => (propertyId ? getFieldsByProperty(propertyId) : []),
    [propertyId],
  );

  // Job info
  const [jobDescription, setJobDescription] = useState('');
  const [estimatedDate, setEstimatedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [validityDaysStr, setValidityDaysStr] = useState(String(config.defaultQuoteValidityDays));
  const validityDays = parseInt(validityDaysStr) || 30;

  // Pricing mode
  const [pricingMode, setPricingMode] = useState<PricingMode>('per-hectare');

  // Per-hectare inputs
  const [hectaresStr, setHectaresStr] = useState('');
  const hectares = parseFloat(hectaresStr) || 0;
  const [appRateLHa, setAppRateLHa] = useState(config.defaultApplicationRateLHa);
  const [rateMultiplierStr, setRateMultiplierStr] = useState(String(config.defaultRateMultiplier));
  const rateMultiplier = parseFloat(rateMultiplierStr) || 1.8;
  const [perHaOverride, setPerHaOverride] = useState<string>(
    config.defaultPerHaOverride?.toString() || '',
  );

  // Per-litre inputs
  const [totalLitresStr, setTotalLitresStr] = useState('');
  const [perLitreRateStr, setPerLitreRateStr] = useState('1');
  const totalLitres = parseFloat(totalLitresStr) || 0;
  const perLitreRate = parseFloat(perLitreRateStr) || 0;

  // Per-hour inputs
  const [sprayHoursStr, setSprayHoursStr] = useState('');
  const sprayHours = parseFloat(sprayHoursStr) || 0;
  const [hourlyRateStr, setHourlyRateStr] = useState(String(config.defaultSpotSprayHourlyRate));
  const hourlyRate = parseFloat(hourlyRateStr) || 0;

  // Daily inputs
  const [contractDaysStr, setContractDaysStr] = useState('1');
  const contractDays = parseInt(contractDaysStr) || 0;
  const [dailyRateStr, setDailyRateStr] = useState(String(config.defaultDailyContractRate));
  const dailyRate = parseFloat(dailyRateStr) || 0;

  // Travel
  const [travelKmStr, setTravelKmStr] = useState('');
  const travelKm = parseFloat(travelKmStr) || 0;
  const [travelReturn, setTravelReturn] = useState(true);
  const [travelRateStr, setTravelRateStr] = useState(String(config.defaultTravelRatePerKm));
  const travelRate = parseFloat(travelRateStr) || 0;

  // Setup
  const [locationCountStr, setLocationCountStr] = useState('1');
  const locationCount = parseInt(locationCountStr) || 0;
  const [setupFeeStr, setSetupFeeStr] = useState(String(config.defaultSetupFee));
  const setupFee = parseFloat(setupFeeStr) || 0;

  // Surcharges
  const [hasComplexity, setHasComplexity] = useState(false);
  const [complexityRateStr, setComplexityRateStr] = useState(String(config.defaultComplexitySurchargePerHour));
  const complexityRate = parseFloat(complexityRateStr) || 0;
  const [complexityHoursStr, setComplexityHoursStr] = useState('');
  const complexityHours = parseFloat(complexityHoursStr) || 0;

  const [hasHazPPE, setHasHazPPE] = useState(false);
  const [ppeCostStr, setPpeCostStr] = useState('');
  const ppeCost = parseFloat(ppeCostStr) || 0;
  const [ppeHourlyRateStr, setPpeHourlyRateStr] = useState(String(config.defaultHazardousPPEHourly));
  const ppeHourlyRate = parseFloat(ppeHourlyRateStr) || 0;
  const [ppeHoursStr, setPpeHoursStr] = useState('');
  const ppeHours = parseFloat(ppeHoursStr) || 0;

  // Chemicals
  const [chemSupply, setChemSupply] = useState<'operator' | 'client'>('client');
  const [chemLines, setChemLines] = useState<
    { name: string; costPerUnit: string; unit: string; ratePerHa: string; totalUnits: string }[]
  >([]);
  const [chemAdminPercentStr, setChemAdminPercentStr] = useState(String(config.defaultChemicalAdminPercent));
  const chemAdminPercent = parseFloat(chemAdminPercentStr) || 0;

  // Custom line items
  const [customItems, setCustomItems] = useState<
    { description: string; quantity: string; unitLabel: string; unitRate: string }[]
  >([]);

  // Markup & GST
  const [markupPercentStr, setMarkupPercentStr] = useState(String(config.defaultMarkupPercent));
  const markupPercent = parseFloat(markupPercentStr) || 0;
  const [gstApplicable, setGstApplicable] = useState(config.gstRegistered);

  // Kit & Cost tracking
  const allKits = useMemo(() => getKits(userId), [userId]);
  const defaultKit = useMemo(() => getDefaultKit(userId), [userId]);
  const [kitSelections, setKitSelections] = useState<{ kitId: string; quantity: number }[]>(
    defaultKit ? [{ kitId: defaultKit.id, quantity: 1 }] : []
  );
  const resolvedKits = useMemo(() => {
    return kitSelections
      .map(sel => {
        const kit = allKits.find(k => k.id === sel.kitId);
        return kit ? { kit, quantity: sel.quantity } : null;
      })
      .filter(Boolean) as { kit: Kit; quantity: number }[];
  }, [kitSelections, allKits]);
  const primaryKit = resolvedKits[0]?.kit || null;

  const totalDroneCount = kitSelections.reduce((sum, s) => sum + s.quantity, 0);
  const [pilotCountStr, setPilotCountStr] = useState('1');
  const pilotCount = parseInt(pilotCountStr) || 1;
  const [pilotRateStr, setPilotRateStr] = useState(String(defaultKit?.pilotCostPerHour || 60));
  const pilotRate = parseFloat(pilotRateStr) || 0;
  const [hasChemOp, setHasChemOp] = useState(false);
  const [chemOpRateStr, setChemOpRateStr] = useState(String(config.defaultChemOperatorRatePerHour || 45));
  const chemOpRate = parseFloat(chemOpRateStr) || 0;

  const [estFlightHoursStr, setEstFlightHoursStr] = useState('');
  const estFlightHours = parseFloat(estFlightHoursStr) || 0;
  const [setupTravelHoursStr, setSetupTravelHoursStr] = useState('1');
  const setupTravelHours = parseFloat(setupTravelHoursStr) || 0;

  // Notes
  const [clientNotes, setClientNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [paymentTermsDaysStr, setPaymentTermsDaysStr] = useState(String(config.defaultPaymentTermsDays));
  const paymentTermsDays = parseInt(paymentTermsDaysStr) || 14;

  // ─── Build line items ──────────────────────────────────────

  const lineItems = useMemo(() => {
    const items: QuoteLineItem[] = [];
    let sort = 0;

    // Primary spray line
    if (pricingMode === 'per-hectare' && hectares > 0) {
      const rate = perHaOverride
        ? parseFloat(perHaOverride)
        : computePerHaRate(appRateLHa, rateMultiplier);
      if (rate > 0) {
        items.push(
          newLineItem({
            type: 'broadacre-spray',
            description: `Broadacre spray application — ${appRateLHa} L/ha`,
            quantity: hectares,
            unitLabel: 'ha',
            unitRate: rate,
            amount: Math.round(hectares * rate * 100) / 100,
            applicationRateLHa: appRateLHa,
            sortOrder: sort++,
          }),
        );
      }
    } else if (pricingMode === 'per-litre' && totalLitres > 0 && perLitreRate > 0) {
      items.push(
        newLineItem({
          type: 'per-litre-spray',
          description: 'Spray application — per litre',
          quantity: totalLitres,
          unitLabel: 'L',
          unitRate: perLitreRate,
          amount: Math.round(totalLitres * perLitreRate * 100) / 100,
          sortOrder: sort++,
        }),
      );
    } else if (pricingMode === 'per-hour' && sprayHours > 0) {
      items.push(
        newLineItem({
          type: 'spot-spray',
          description: 'Spot spray / hourly application',
          quantity: sprayHours,
          unitLabel: 'hr',
          unitRate: hourlyRate,
          amount: Math.round(sprayHours * hourlyRate * 100) / 100,
          sortOrder: sort++,
        }),
      );
    } else if (pricingMode === 'daily-contract' && contractDays > 0) {
      items.push(
        newLineItem({
          type: 'daily-contract',
          description: 'Daily contract rate',
          quantity: contractDays,
          unitLabel: 'day',
          unitRate: dailyRate,
          amount: Math.round(contractDays * dailyRate * 100) / 100,
          sortOrder: sort++,
        }),
      );
    }

    // Travel
    if (travelKm > 0 && travelRate > 0) {
      const totalKm = travelReturn ? travelKm * 2 : travelKm;
      items.push(
        newLineItem({
          type: 'travel',
          description: `Travel — ${totalKm} km ${travelReturn ? '(return)' : '(one-way)'}`,
          quantity: totalKm,
          unitLabel: 'km',
          unitRate: travelRate,
          amount: Math.round(totalKm * travelRate * 100) / 100,
          sortOrder: sort++,
        }),
      );
    }

    // Setup
    if (locationCount > 0 && setupFee > 0) {
      items.push(
        newLineItem({
          type: 'setup',
          description: `Setup / pack down — ${locationCount} location${locationCount > 1 ? 's' : ''}`,
          quantity: locationCount,
          unitLabel: 'ea',
          unitRate: setupFee,
          amount: Math.round(locationCount * setupFee * 100) / 100,
          sortOrder: sort++,
        }),
      );
    }

    // Chemicals (operator-supplied)
    if (chemSupply === 'operator') {
      for (const cl of chemLines) {
        const clCost = parseFloat(cl.costPerUnit) || 0;
        const clUnits = parseFloat(cl.totalUnits) || 0;
        if (cl.name && clUnits > 0 && clCost > 0) {
          const base = clCost * clUnits;
          const withAdmin = Math.round(base * (1 + chemAdminPercent / 100) * 100) / 100;
          items.push(
            newLineItem({
              type: 'chemical-cost',
              description: `Chemical: ${cl.name} (${clUnits} ${cl.unit})`,
              quantity: clUnits,
              unitLabel: cl.unit,
              unitRate: Math.round(clCost * (1 + chemAdminPercent / 100) * 100) / 100,
              amount: withAdmin,
              chemicalName: cl.name,
              suppliedBy: 'operator',
              sortOrder: sort++,
            }),
          );
        }
      }

      // Complex mix fee
      const chemCount = chemLines.filter((c) => c.name.trim()).length;
      if (chemCount >= 3 && config.defaultComplexMixFee > 0) {
        items.push(
          newLineItem({
            type: 'complex-mix-fee',
            description: `Complex mix fee (${chemCount} chemicals)`,
            quantity: 1,
            unitLabel: 'ea',
            unitRate: config.defaultComplexMixFee,
            amount: config.defaultComplexMixFee,
            sortOrder: sort++,
          }),
        );
      }
    }

    // Complexity surcharge
    if (hasComplexity && complexityHours > 0 && complexityRate > 0) {
      items.push(
        newLineItem({
          type: 'complexity-surcharge',
          description: 'Task complexity surcharge (terrain/obstacles)',
          quantity: complexityHours,
          unitLabel: 'hr',
          unitRate: complexityRate,
          amount: Math.round(complexityHours * complexityRate * 100) / 100,
          sortOrder: sort++,
        }),
      );
    }

    // Hazardous PPE
    if (hasHazPPE) {
      const ppeTotal = ppeCost + ppeHours * ppeHourlyRate;
      if (ppeTotal > 0) {
        items.push(
          newLineItem({
            type: 'hazardous-ppe',
            description: 'Hazardous chemical PPE and handling',
            quantity: 1,
            unitLabel: 'ea',
            unitRate: ppeTotal,
            amount: Math.round(ppeTotal * 100) / 100,
            sortOrder: sort++,
          }),
        );
      }
    }

    // Custom items
    for (const ci of customItems) {
      const ciQty = parseFloat(ci.quantity) || 0;
      const ciRate = parseFloat(ci.unitRate) || 0;
      if (ci.description && ciQty > 0 && ciRate > 0) {
        items.push(
          newLineItem({
            type: 'custom',
            description: ci.description,
            quantity: ciQty,
            unitLabel: ci.unitLabel,
            unitRate: ciRate,
            amount: Math.round(ciQty * ciRate * 100) / 100,
            sortOrder: sort++,
          }),
        );
      }
    }

    return items;
  }, [
    pricingMode, hectaresStr, appRateLHa, rateMultiplierStr, perHaOverride,
    totalLitresStr, perLitreRateStr,
    sprayHoursStr, hourlyRateStr, contractDaysStr, dailyRateStr,
    travelKmStr, travelReturn, travelRateStr, locationCountStr, setupFeeStr,
    chemSupply, chemLines, chemAdminPercentStr, config.defaultComplexMixFee,
    hasComplexity, complexityHoursStr, complexityRateStr,
    hasHazPPE, ppeCostStr, ppeHoursStr, ppeHourlyRateStr,
    customItems,
  ]);

  const totals = useMemo(
    () => calculateTotals(lineItems, markupPercent, gstApplicable, config.gstRate),
    [lineItems, markupPercentStr, gstApplicable, config.gstRate],
  );

  // Auto-populate hectares from selected fields
  const autoHectares = useMemo(() => {
    return propertyFields
      .filter((f) => selectedFieldIds.includes(f.id))
      .reduce((sum, f) => sum + f.sizeHa, 0);
  }, [propertyFields, selectedFieldIds]);

  // Task 7: Calculate total hectares from field boundaries (works even with prefilled fields)
  const totalHectares = useMemo(() => {
    if (!selectedFieldIds.length) return 0;
    return selectedFieldIds.reduce((sum, fid) => {
      const f = getFieldById(fid);
      return sum + (f?.sizeHa || 0);
    }, 0);
  }, [selectedFieldIds]);

  useEffect(() => {
    if (totalHectares > 0) {
      setHectaresStr(String(Math.round(totalHectares * 100) / 100));
    }
  }, [totalHectares]);

  // Cost & margin analysis
  const operatorChemCost = useMemo(() => {
    if (chemSupply !== 'operator') return 0;
    return chemLines.reduce((sum, cl) => sum + (parseFloat(cl.costPerUnit) || 0) * (parseFloat(cl.totalUnits) || 0), 0);
  }, [chemSupply, chemLines]);

  const costBreakdown = useMemo(() => {
    if (resolvedKits.length === 0 || estFlightHours <= 0) return null;
    return calculateMultiKitJobCosts(
      resolvedKits,
      { pilotCount, pilotRate, hasChemOp, chemOpRate },
      estFlightHours,
      setupTravelHours,
      travelKm,
      operatorChemCost,
      totals.subtotalAfterMarkup,
    );
  }, [resolvedKits, pilotCount, pilotRate, hasChemOp, chemOpRate,
      estFlightHours, setupTravelHours, travelKm, operatorChemCost, totals.subtotalAfterMarkup]);

  const margin = useMemo(() => {
    if (!costBreakdown) return null;
    return calculateMargin(totals.subtotalAfterMarkup, costBreakdown, hectares);
  }, [costBreakdown, totals.subtotalAfterMarkup, hectares]);

  // ─── Handlers ──────────────────────────────────────────────

  const handleSave = () => {
    if (!clientId) return;

    // Save config if first time
    if (!existingConfig) {
      saveQuoteConfig({
        ...config,
        contractorUserId: userId,
      });
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);

    const quote = saveQuote({
      quoteNumber: generateQuoteNumber(userId),
      contractorUserId: userId,
      clientId,
      propertyId: propertyId || undefined,
      fieldIds: selectedFieldIds.length > 0 ? selectedFieldIds : undefined,
      jobIds: fromJobId ? [fromJobId] : undefined,
      status: 'draft',
      pricingMode,
      jobDescription,
      estimatedDate,
      validUntil: validUntil.toISOString().split('T')[0],
      lineItems,
      ...totals,
      paymentTermsDays,
      termsAndConditions: config.termsAndConditions,
      kitId: kitSelections[0]?.kitId || undefined,
      kitSelections: kitSelections.length > 0 ? kitSelections : undefined,
      crew: {
        pilotCount,
        pilotRatePerHour: pilotRate,
        hasChemOperator: hasChemOp,
        chemOperatorRatePerHour: chemOpRate,
      },
      costBreakdown: costBreakdown || undefined,
      margin: margin || undefined,
      notes: internalNotes,
      clientNotes,
      sentAt: null,
      acceptedAt: null,
    });

    // Link quote back to job if created from a job (Task 3)
    if (fromJobId) {
      updateJob(fromJobId, { quoteId: quote.id });
      updateQuote(quote.id, { jobIds: [fromJobId] });
    }

    navigate(`/quotes/${quote.id}`);
  };

  // ─── Section renderer helper ───────────────────────────────


  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/quotes')} sx={{ mb: 2 }}>
        Back to Quotes
      </Button>

      <Typography variant="h4" fontWeight={800} gutterBottom>
        New Quote
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Build a detailed quote for your drone spray services.
      </Typography>

      <Stack spacing={3}>
        {/* ─── Client & Job ─────────────────────────────────── */}
        <SectionCard icon={<ReceiptLongIcon color="primary" />} title="Client & Job Details">
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center">
              <Autocomplete
                options={allClients}
                getOptionLabel={(c) => c.name}
                value={allClients.find((c) => c.id === clientId) || null}
                onChange={(_, v) => {
                  setClientId(v?.id || null);
                  setPropertyId(null);
                  setSelectedFieldIds([]);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Client *" size="small" />
                )}
                sx={{ flex: 1 }}
              />
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setQuickClientOpen(true)}
                sx={{ ml: 1, borderRadius: '10px', fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                New Client
              </Button>
            </Stack>

            <Stack direction="row" spacing={2}>
              {clientId && (
                <Autocomplete
                  options={clientProperties}
                  getOptionLabel={(p) => p.name}
                  value={clientProperties.find((p) => p.id === propertyId) || null}
                  onChange={(_, v) => {
                    setPropertyId(v?.id || null);
                    setSelectedFieldIds([]);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Property" size="small" />
                  )}
                  sx={{ flex: 1 }}
                />
              )}
              {propertyId && propertyFields.length > 0 && (
                <Autocomplete
                  multiple
                  options={propertyFields}
                  getOptionLabel={(f) => `${f.name} (${f.sizeHa} ha)`}
                  value={propertyFields.filter((f) => selectedFieldIds.includes(f.id))}
                  onChange={(_, v) => {
                    const ids = v.map((f) => f.id);
                    setSelectedFieldIds(ids);
                    const totalHa = v.reduce((s, f) => s + f.sizeHa, 0);
                    if (totalHa > 0) setHectaresStr(String(Math.round(totalHa * 100) / 100));
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Fields" size="small" />
                  )}
                  sx={{ flex: 1 }}
                />
              )}
            </Stack>

            <TextField
              label="Job Description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              size="small"
              fullWidth
              placeholder="e.g. Broadacre herbicide application — Paddock 7"
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Estimated Spray Date"
                type="date"
                value={estimatedDate}
                onChange={(e) => setEstimatedDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Quote Valid (days)"
                type="number"
                value={validityDaysStr}
                onChange={(e) => setValidityDaysStr(e.target.value)}
                size="small"
                sx={{ width: 140 }}
              />
            </Stack>
          </Stack>
        </SectionCard>

        {/* ─── Pricing Mode ─────────────────────────────────── */}
        <SectionCard icon={<AgricultureIcon color="primary" />} title="Pricing Mode">
          <ToggleButtonGroup
            value={pricingMode}
            exclusive
            onChange={(_, v) => v && setPricingMode(v)}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="per-hectare" sx={{ px: 3 }}>
              Per Hectare
            </ToggleButton>
            <ToggleButton value="per-litre" sx={{ px: 3 }}>
              Per Litre
            </ToggleButton>
            <ToggleButton value="per-hour" sx={{ px: 3 }}>
              Per Hour
            </ToggleButton>
            <ToggleButton value="daily-contract" sx={{ px: 3 }}>
              Daily Contract
            </ToggleButton>
          </ToggleButtonGroup>

          {pricingMode === 'per-hectare' && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label="Total Hectares"
                  type="number"
                  value={hectaresStr}
                  onChange={(e) => setHectaresStr(e.target.value)}
                  size="small"
                  sx={{ width: 150 }}
                  helperText={autoHectares > 0 ? `From fields: ${autoHectares} ha` : undefined}
                />
                <TextField
                  select
                  label="Application Rate (L/ha)"
                  value={appRateLHa}
                  onChange={(e) => setAppRateLHa(parseInt(e.target.value))}
                  size="small"
                  sx={{ width: 200 }}
                >
                  {APPLICATION_RATE_OPTIONS.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r} L/ha
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Multiplier"
                  type="number"
                  value={rateMultiplierStr}
                  onChange={(e) => setRateMultiplierStr(e.target.value)}
                  size="small"
                  sx={{ width: 120 }}
                  inputProps={{ step: 0.1 }}
                />
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Calculated rate: <strong>{formatCurrency(computePerHaRate(appRateLHa, rateMultiplier))}/ha</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">or</Typography>
                <TextField
                  label="Override $/ha"
                  value={perHaOverride}
                  onChange={(e) => setPerHaOverride(e.target.value)}
                  size="small"
                  sx={{ width: 140 }}
                  placeholder="Custom rate"
                />
              </Stack>
              {hectares > 0 && (
                <Alert severity="info" icon={false}>
                  {hectares} ha × {formatCurrency(
                    perHaOverride ? parseFloat(perHaOverride) : computePerHaRate(appRateLHa, rateMultiplier),
                  )}/ha = <strong>
                    {formatCurrency(
                      hectares * (perHaOverride ? parseFloat(perHaOverride) : computePerHaRate(appRateLHa, rateMultiplier)),
                    )}
                  </strong>
                </Alert>
              )}
            </Stack>
          )}

          {pricingMode === 'per-litre' && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Total Litres"
                  type="number"
                  value={totalLitresStr}
                  onChange={(e) => setTotalLitresStr(e.target.value)}
                  size="small"
                  sx={{ width: 150 }}
                />
                <TextField
                  label="Rate per Litre ($)"
                  type="number"
                  value={perLitreRateStr}
                  onChange={(e) => setPerLitreRateStr(e.target.value)}
                  size="small"
                  sx={{ width: 150 }}
                  inputProps={{ step: 0.1 }}
                />
              </Stack>
              {totalLitres > 0 && (
                <Alert severity="info" icon={false}>
                  {totalLitres} L × {formatCurrency(perLitreRate)}/L = <strong>{formatCurrency(totalLitres * perLitreRate)}</strong>
                </Alert>
              )}
              <Typography variant="caption" color="text.secondary">
                Price based on total spray volume delivered
              </Typography>
            </Stack>
          )}

          {pricingMode === 'per-hour' && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Estimated Hours"
                  type="number"
                  value={sprayHoursStr}
                  onChange={(e) => setSprayHoursStr(e.target.value)}
                  size="small"
                  sx={{ width: 150 }}
                />
                <TextField
                  label="Hourly Rate ($)"
                  type="number"
                  value={hourlyRateStr}
                  onChange={(e) => setHourlyRateStr(e.target.value)}
                  size="small"
                  sx={{ width: 150 }}
                />
              </Stack>
              {sprayHours > 0 && (
                <Alert severity="info" icon={false}>
                  {sprayHours} hrs × {formatCurrency(hourlyRate)}/hr = <strong>{formatCurrency(sprayHours * hourlyRate)}</strong>
                </Alert>
              )}
              <Typography variant="caption" color="text.secondary">
                Industry range: $250 – $325/hr for spot spraying
              </Typography>
            </Stack>
          )}

          {pricingMode === 'daily-contract' && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Number of Days"
                  type="number"
                  value={contractDaysStr}
                  onChange={(e) => setContractDaysStr(e.target.value)}
                  size="small"
                  sx={{ width: 150 }}
                />
                <TextField
                  label="Daily Rate ($)"
                  type="number"
                  value={dailyRateStr}
                  onChange={(e) => setDailyRateStr(e.target.value)}
                  size="small"
                  sx={{ width: 150 }}
                />
              </Stack>
              {contractDays > 0 && (
                <Alert severity="info" icon={false}>
                  {contractDays} day{contractDays > 1 ? 's' : ''} × {formatCurrency(dailyRate)}/day = <strong>{formatCurrency(contractDays * dailyRate)}</strong>
                </Alert>
              )}
            </Stack>
          )}
        </SectionCard>

        {/* ─── Travel ───────────────────────────────────────── */}
        <SectionCard icon={<DirectionsCarIcon color="primary" />} title="Travel">
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Distance (km, one-way)"
                type="number"
                value={travelKmStr}
                onChange={(e) => setTravelKmStr(e.target.value)}
                size="small"
                sx={{ width: 200 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={travelReturn}
                    onChange={(e) => setTravelReturn(e.target.checked)}
                  />
                }
                label="Return trip"
              />
              <TextField
                label="$/km"
                type="number"
                value={travelRateStr}
                onChange={(e) => setTravelRateStr(e.target.value)}
                size="small"
                sx={{ width: 100 }}
                inputProps={{ step: 0.1 }}
              />
            </Stack>
            {travelKm > 0 && (
              <Typography variant="body2" color="text.secondary">
                {travelReturn ? travelKm * 2 : travelKm} km × {formatCurrency(travelRate)}/km ={' '}
                <strong>{formatCurrency((travelReturn ? travelKm * 2 : travelKm) * travelRate)}</strong>
              </Typography>
            )}
          </Stack>
        </SectionCard>

        {/* ─── Setup & Surcharges ───────────────────────────── */}
        <SectionCard icon={<BuildIcon color="primary" />} title="Setup & Surcharges">
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Operating Locations"
                type="number"
                value={locationCountStr}
                onChange={(e) => setLocationCountStr(e.target.value)}
                size="small"
                sx={{ width: 170 }}
                inputProps={{ min: 0 }}
              />
              <TextField
                label="Setup Fee ($/location)"
                type="number"
                value={setupFeeStr}
                onChange={(e) => setSetupFeeStr(e.target.value)}
                size="small"
                sx={{ width: 180 }}
              />
            </Stack>

            <Divider />

            <FormControlLabel
              control={
                <Switch checked={hasComplexity} onChange={(e) => setHasComplexity(e.target.checked)} />
              }
              label="Task complexity surcharge (terrain, obstacles, livestock)"
            />
            {hasComplexity && (
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Hours"
                  type="number"
                  value={complexityHoursStr}
                  onChange={(e) => setComplexityHoursStr(e.target.value)}
                  size="small"
                  sx={{ width: 120 }}
                />
                <TextField
                  label="$/hr"
                  type="number"
                  value={complexityRateStr}
                  onChange={(e) => setComplexityRateStr(e.target.value)}
                  size="small"
                  sx={{ width: 120 }}
                />
              </Stack>
            )}

            <FormControlLabel
              control={
                <Switch checked={hasHazPPE} onChange={(e) => setHasHazPPE(e.target.checked)} />
              }
              label="Hazardous chemical PPE / handling fee"
            />
            {hasHazPPE && (
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Equipment Cost ($)"
                  type="number"
                  value={ppeCostStr}
                  onChange={(e) => setPpeCostStr(e.target.value)}
                  size="small"
                  sx={{ width: 160 }}
                />
                <TextField
                  label="Hours"
                  type="number"
                  value={ppeHoursStr}
                  onChange={(e) => setPpeHoursStr(e.target.value)}
                  size="small"
                  sx={{ width: 100 }}
                />
                <TextField
                  label="$/hr"
                  type="number"
                  value={ppeHourlyRateStr}
                  onChange={(e) => setPpeHourlyRateStr(e.target.value)}
                  size="small"
                  sx={{ width: 100 }}
                />
              </Stack>
            )}
          </Stack>
        </SectionCard>

        {/* ─── Chemicals ────────────────────────────────────── */}
        <SectionCard icon={<ScienceIcon color="primary" />} title="Chemicals">
          <Stack spacing={2}>
            <ToggleButtonGroup
              value={chemSupply}
              exclusive
              onChange={(_, v) => v && setChemSupply(v)}
              size="small"
            >
              <ToggleButton value="client">Client Supplies</ToggleButton>
              <ToggleButton value="operator">Operator Supplies</ToggleButton>
            </ToggleButtonGroup>

            {chemSupply === 'operator' && (
              <>
                {chemLines.map((cl, idx) => (
                  <Stack key={idx} direction="row" spacing={1} alignItems="center">
                    <TextField
                      label="Chemical"
                      value={cl.name}
                      onChange={(e) => {
                        const updated = [...chemLines];
                        updated[idx] = { ...cl, name: e.target.value };
                        setChemLines(updated);
                      }}
                      size="small"
                      sx={{ flex: 2 }}
                    />
                    <TextField
                      label="$/unit"
                      type="number"
                      value={cl.costPerUnit}
                      onChange={(e) => {
                        const updated = [...chemLines];
                        updated[idx] = { ...cl, costPerUnit: e.target.value };
                        setChemLines(updated);
                      }}
                      size="small"
                      sx={{ width: 100 }}
                    />
                    <TextField
                      select
                      label="Unit"
                      value={cl.unit}
                      onChange={(e) => {
                        const updated = [...chemLines];
                        updated[idx] = { ...cl, unit: e.target.value };
                        setChemLines(updated);
                      }}
                      size="small"
                      sx={{ width: 80 }}
                    >
                      <MenuItem value="L">L</MenuItem>
                      <MenuItem value="kg">kg</MenuItem>
                      <MenuItem value="g">g</MenuItem>
                    </TextField>
                    <TextField
                      label="Total Qty"
                      type="number"
                      value={cl.totalUnits}
                      onChange={(e) => {
                        const updated = [...chemLines];
                        updated[idx] = { ...cl, totalUnits: e.target.value };
                        setChemLines(updated);
                      }}
                      size="small"
                      sx={{ width: 100 }}
                    />
                    <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'right' }}>
                      {formatCurrency((parseFloat(cl.costPerUnit) || 0) * (parseFloat(cl.totalUnits) || 0) * (1 + chemAdminPercent / 100))}
                    </Typography>
                    <IconButton size="small" color="error" onClick={() => setChemLines(chemLines.filter((_, i) => i !== idx))}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      setChemLines([...chemLines, { name: '', costPerUnit: '', unit: 'L', ratePerHa: '', totalUnits: '' }])
                    }
                  >
                    Add Chemical
                  </Button>
                  <TextField
                    label="Admin Fee %"
                    type="number"
                    value={chemAdminPercentStr}
                    onChange={(e) => setChemAdminPercentStr(e.target.value)}
                    size="small"
                    sx={{ width: 120 }}
                  />
                </Stack>
              </>
            )}

            {chemSupply === 'client' && (
              <Typography variant="body2" color="text.secondary">
                Client will supply all chemicals. No chemical costs included in quote.
              </Typography>
            )}
          </Stack>
        </SectionCard>

        {/* ─── Custom Line Items ─────────────────────────────── */}
        <SectionCard icon={<AddIcon color="primary" />} title="Additional Items">
          <Stack spacing={2}>
            {customItems.map((ci, idx) => (
              <Stack key={idx} direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Description"
                  value={ci.description}
                  onChange={(e) => {
                    const updated = [...customItems];
                    updated[idx] = { ...ci, description: e.target.value };
                    setCustomItems(updated);
                  }}
                  size="small"
                  sx={{ flex: 2 }}
                />
                <TextField
                  label="Qty"
                  type="number"
                  value={ci.quantity}
                  onChange={(e) => {
                    const updated = [...customItems];
                    updated[idx] = { ...ci, quantity: e.target.value };
                    setCustomItems(updated);
                  }}
                  size="small"
                  sx={{ width: 80 }}
                />
                <TextField
                  label="Unit"
                  value={ci.unitLabel}
                  onChange={(e) => {
                    const updated = [...customItems];
                    updated[idx] = { ...ci, unitLabel: e.target.value };
                    setCustomItems(updated);
                  }}
                  size="small"
                  sx={{ width: 80 }}
                />
                <TextField
                  label="$/unit"
                  type="number"
                  value={ci.unitRate}
                  onChange={(e) => {
                    const updated = [...customItems];
                    updated[idx] = { ...ci, unitRate: e.target.value };
                    setCustomItems(updated);
                  }}
                  size="small"
                  sx={{ width: 100 }}
                />
                <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'right' }}>
                  {formatCurrency((parseFloat(ci.quantity) || 0) * (parseFloat(ci.unitRate) || 0))}
                </Typography>
                <IconButton size="small" color="error" onClick={() => setCustomItems(customItems.filter((_, i) => i !== idx))}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setCustomItems([...customItems, { description: '', quantity: '1', unitLabel: 'ea', unitRate: '' }])}
            >
              Add Line Item
            </Button>
          </Stack>
        </SectionCard>

        {/* ─── Quote Summary & Totals ────────────────────────── */}
        <Card sx={{ borderRadius: 3, border: `2px solid ${theme.palette.primary.main}` }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
              Quote Summary
            </Typography>

            {lineItems.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Qty</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Rate</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lineItems.map((li) => (
                      <TableRow key={li.id}>
                        <TableCell>{li.description}</TableCell>
                        <TableCell align="right">
                          {li.quantity} {li.unitLabel}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(li.unitRate)}</TableCell>
                        <TableCell align="right">{formatCurrency(li.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>
                Add pricing details above to build your quote.
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1.5}>
              {/* Markup */}
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="body2" sx={{ minWidth: 100 }}>
                  Markup
                </Typography>
                <Slider
                  value={markupPercent}
                  onChange={(_, v) => setMarkupPercentStr(String(v as number))}
                  min={0}
                  max={50}
                  step={1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${v}%`}
                  sx={{ flex: 1, maxWidth: 200 }}
                />
                <TextField
                  type="number"
                  value={markupPercentStr}
                  onChange={(e) => setMarkupPercentStr(e.target.value)}
                  size="small"
                  sx={{ width: 80 }}
                  inputProps={{ min: 0, max: 100 }}
                />
                <Typography variant="body2">%</Typography>
              </Stack>

              {/* GST toggle */}
              <FormControlLabel
                control={
                  <Switch checked={gstApplicable} onChange={(e) => setGstApplicable(e.target.checked)} />
                }
                label="Include GST (10%)"
              />

              <Divider />

              {/* Totals */}
              <Stack spacing={0.5} sx={{ pl: 2 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">{formatCurrency(totals.subtotal)}</Typography>
                </Stack>
                {totals.markupAmount > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">
                      Markup ({totals.markupPercent}%)
                    </Typography>
                    <Typography variant="body2">{formatCurrency(totals.markupAmount)}</Typography>
                  </Stack>
                )}
                {totals.markupAmount > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Subtotal (after markup)</Typography>
                    <Typography variant="body2">{formatCurrency(totals.subtotalAfterMarkup)}</Typography>
                  </Stack>
                )}
                {totals.gstApplicable && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">GST (10%)</Typography>
                    <Typography variant="body2">{formatCurrency(totals.gstAmount)}</Typography>
                  </Stack>
                )}
                <Divider />
                <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                  <Typography variant="h6" fontWeight={800}>
                    Total {totals.gstApplicable ? '(inc. GST)' : '(ex. GST)'}
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="primary">
                    {formatCurrency(totals.total)}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* ─── Cost & Margin Analysis ──────────────────────────── */}
        <Card sx={{ borderRadius: 3, border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}` }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <TrendingUpIcon color="secondary" />
              <Typography variant="h6" fontWeight={800}>
                Cost & Margin Analysis
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                (internal only — not shown on quote)
              </Typography>
            </Stack>

            {allKits.length === 0 ? (
              <Alert severity="info" icon={false}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2">
                    Set up an equipment kit in{' '}
                    <Button size="small" onClick={() => navigate('/quotes/settings')} sx={{ textTransform: 'none', fontWeight: 700, p: 0, minWidth: 0 }}>
                      Quote Settings
                    </Button>
                    {' '}to track costs and margins.
                  </Typography>
                </Stack>
              </Alert>
            ) : (
              <Stack spacing={2.5}>
                {/* Kit selector */}
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Equipment</Typography>
                {kitSelections.map((sel, idx) => {
                  const kit = allKits.find(k => k.id === sel.kitId);
                  return (
                    <Stack key={idx} direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                      <TextField
                        select
                        size="small"
                        value={sel.kitId}
                        onChange={(e) => {
                          const updated = [...kitSelections];
                          updated[idx] = { ...sel, kitId: e.target.value };
                          setKitSelections(updated);
                        }}
                        sx={{ flex: 1 }}
                        label="Kit"
                      >
                        {allKits.map((k) => (
                          <MenuItem key={k.id} value={k.id}>{k.name} ({k.droneModel})</MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        label="Qty"
                        type="number"
                        size="small"
                        value={sel.quantity}
                        onChange={(e) => {
                          const updated = [...kitSelections];
                          updated[idx] = { ...sel, quantity: Math.max(1, parseInt(e.target.value) || 1) };
                          setKitSelections(updated);
                        }}
                        sx={{ width: 75 }}
                        inputProps={{ min: 1, max: 10 }}
                      />
                      {kitSelections.length > 1 && (
                        <IconButton size="small" onClick={() => setKitSelections(kitSelections.filter((_, i) => i !== idx))}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  );
                })}
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    if (allKits.length > 0) {
                      setKitSelections([...kitSelections, { kitId: allKits[0].id, quantity: 1 }]);
                    }
                  }}
                  sx={{ mb: 1.5 }}
                >
                  Add Kit
                </Button>
                {totalDroneCount > 1 && (
                  <Chip label={`${totalDroneCount} drones total`} size="small" color="primary" variant="outlined" sx={{ mb: 1 }} />
                )}

                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Crew</Typography>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                  <TextField
                    label="Pilots"
                    type="number"
                    size="small"
                    value={pilotCountStr}
                    onChange={(e) => setPilotCountStr(e.target.value)}
                    sx={{ width: 80 }}
                    inputProps={{ min: 1, max: 10 }}
                    helperText={totalDroneCount > 1 && pilotCount < totalDroneCount ? 'Swarming' : ''}
                  />
                  <TextField
                    label="Pilot $/hr"
                    type="number"
                    size="small"
                    value={pilotRateStr}
                    onChange={(e) => setPilotRateStr(e.target.value)}
                    sx={{ width: 120 }}
                  />
                  <FormControlLabel
                    control={<Switch checked={hasChemOp} onChange={(e) => setHasChemOp(e.target.checked)} size="small" />}
                    label={<Typography variant="body2">Chem Operator</Typography>}
                  />
                  {hasChemOp && (
                    <TextField
                      label="Chem Op $/hr"
                      type="number"
                      size="small"
                      value={chemOpRateStr}
                      onChange={(e) => setChemOpRateStr(e.target.value)}
                      sx={{ width: 120 }}
                    />
                  )}
                </Stack>

                {resolvedKits.length > 0 && (
                  <>
                    {/* Job time estimates */}
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                      <TextField
                        label="Est. Flight Hours"
                        type="number"
                        value={estFlightHoursStr}
                        onChange={(e) => setEstFlightHoursStr(e.target.value)}
                        size="small"
                        sx={{ width: 150 }}
                        helperText={
                          hectares > 0 && primaryKit?.hectaresPerFlightHour && primaryKit.hectaresPerFlightHour > 0
                            ? `~${(hectares / primaryKit.hectaresPerFlightHour).toFixed(1)} hrs for ${hectares} ha`
                            : undefined
                        }
                      />
                      <TextField
                        label="Setup/Travel Hrs"
                        type="number"
                        value={setupTravelHoursStr}
                        onChange={(e) => setSetupTravelHoursStr(e.target.value)}
                        size="small"
                        sx={{ width: 150 }}
                        helperText="Non-flight work time"
                      />
                      {hectares > 0 && primaryKit?.hectaresPerFlightHour && primaryKit.hectaresPerFlightHour > 0 && !estFlightHoursStr && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setEstFlightHoursStr(
                            String(Math.round(hectares / primaryKit!.hectaresPerFlightHour * 10) / 10)
                          )}
                        >
                          Auto-estimate from hectares
                        </Button>
                      )}
                    </Stack>

                    {costBreakdown && margin && (
                      <>
                        {/* Cost breakdown */}
                        <Divider />
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                          {/* Left: cost breakdown */}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                              Cost Breakdown
                            </Typography>
                            <TableContainer>
                              <Table size="small">
                                <TableBody>
                                  <TableRow>
                                    <TableCell sx={{ py: 0.3, fontSize: '0.8rem' }}>Equipment ({estFlightHours} flight hrs)</TableCell>
                                    <TableCell align="right" sx={{ py: 0.3, fontSize: '0.8rem' }}>{formatCurrency(costBreakdown.equipmentCost)}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell sx={{ py: 0.3, fontSize: '0.8rem' }}>
                                      Labour ({pilotCount} pilot{pilotCount > 1 ? 's' : ''} × ${pilotRate}/hr
                                      {hasChemOp ? ` + Chem Op × $${chemOpRate}/hr` : ''})
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 0.3, fontSize: '0.8rem' }}>{formatCurrency(costBreakdown.labourCost)}</TableCell>
                                  </TableRow>
                                  {costBreakdown.vehicleCost > 0 && (
                                    <TableRow>
                                      <TableCell sx={{ py: 0.3, fontSize: '0.8rem' }}>Vehicle ({travelKm > 0 ? `${travelReturn ? travelKm * 2 : travelKm} km` : '0 km'})</TableCell>
                                      <TableCell align="right" sx={{ py: 0.3, fontSize: '0.8rem' }}>{formatCurrency(costBreakdown.vehicleCost)}</TableCell>
                                    </TableRow>
                                  )}
                                  <TableRow>
                                    <TableCell sx={{ py: 0.3, fontSize: '0.8rem' }}>Insurance</TableCell>
                                    <TableCell align="right" sx={{ py: 0.3, fontSize: '0.8rem' }}>{formatCurrency(costBreakdown.insuranceCost)}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell sx={{ py: 0.3, fontSize: '0.8rem' }}>Fixed costs (licensing, software, PPE, overhead)</TableCell>
                                    <TableCell align="right" sx={{ py: 0.3, fontSize: '0.8rem' }}>{formatCurrency(costBreakdown.fixedCostAllocation)}</TableCell>
                                  </TableRow>
                                  {costBreakdown.chemicalCostToOperator > 0 && (
                                    <TableRow>
                                      <TableCell sx={{ py: 0.3, fontSize: '0.8rem' }}>Chemical cost (operator-supplied)</TableCell>
                                      <TableCell align="right" sx={{ py: 0.3, fontSize: '0.8rem' }}>{formatCurrency(costBreakdown.chemicalCostToOperator)}</TableCell>
                                    </TableRow>
                                  )}
                                  <TableRow>
                                    <TableCell sx={{ py: 0.5, fontWeight: 800, borderBottom: 'none' }}>Total Job Cost</TableCell>
                                    <TableCell align="right" sx={{ py: 0.5, fontWeight: 800, borderBottom: 'none' }}>{formatCurrency(costBreakdown.totalCost)}</TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>

                          {/* Right: margin summary */}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                              Margin Summary
                            </Typography>
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: margin.grossMarginPercent >= 40
                                  ? alpha('#4caf50', 0.08)
                                  : margin.grossMarginPercent >= 20
                                    ? alpha('#ff9800', 0.08)
                                    : alpha('#f44336', 0.08),
                                border: `1px solid ${
                                  margin.grossMarginPercent >= 40
                                    ? alpha('#4caf50', 0.2)
                                    : margin.grossMarginPercent >= 20
                                      ? alpha('#ff9800', 0.2)
                                      : alpha('#f44336', 0.2)
                                }`,
                              }}
                            >
                              <Stack spacing={1}>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="body2">Revenue (ex GST)</Typography>
                                  <Typography variant="body2" fontWeight={600}>{formatCurrency(margin.revenue)}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="body2">Total Cost</Typography>
                                  <Typography variant="body2" fontWeight={600}>-{formatCurrency(margin.totalCost)}</Typography>
                                </Stack>
                                <Divider />
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Typography variant="body2" fontWeight={800}>Gross Profit</Typography>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography
                                      variant="h6"
                                      fontWeight={800}
                                      sx={{
                                        color: margin.grossMarginPercent >= 40 ? '#4caf50'
                                          : margin.grossMarginPercent >= 20 ? '#ff9800' : '#f44336',
                                      }}
                                    >
                                      {formatCurrency(margin.grossProfit)}
                                    </Typography>
                                    <Chip
                                      label={`${margin.grossMarginPercent.toFixed(1)}%`}
                                      size="small"
                                      sx={{
                                        fontWeight: 800,
                                        bgcolor: margin.grossMarginPercent >= 40 ? alpha('#4caf50', 0.15)
                                          : margin.grossMarginPercent >= 20 ? alpha('#ff9800', 0.15) : alpha('#f44336', 0.15),
                                        color: margin.grossMarginPercent >= 40 ? '#4caf50'
                                          : margin.grossMarginPercent >= 20 ? '#ff9800' : '#f44336',
                                      }}
                                    />
                                  </Stack>
                                </Stack>

                                {margin.grossMarginPercent < 20 && (
                                  <Alert severity="warning" icon={<WarningIcon fontSize="small" />} sx={{ py: 0 }}>
                                    <Typography variant="caption">Low margin — consider increasing your rate.</Typography>
                                  </Alert>
                                )}
                              </Stack>
                            </Box>

                            {/* Per-unit metrics */}
                            <Stack direction="row" spacing={2} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                              {hectares > 0 && (
                                <Box sx={{ textAlign: 'center', minWidth: 90 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>Profit/ha</Typography>
                                  <Typography variant="body2" fontWeight={700}>{formatCurrency(margin.profitPerHectare)}</Typography>
                                </Box>
                              )}
                              <Box sx={{ textAlign: 'center', minWidth: 90 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>Revenue/hr</Typography>
                                <Typography variant="body2" fontWeight={700}>{formatCurrency(margin.revenuePerHour)}</Typography>
                              </Box>
                              <Box sx={{ textAlign: 'center', minWidth: 90 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>Cost/hr</Typography>
                                <Typography variant="body2" fontWeight={700}>{formatCurrency(margin.costPerHour)}</Typography>
                              </Box>
                              <Box sx={{ textAlign: 'center', minWidth: 90 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>Profit/hr</Typography>
                                <Typography variant="body2" fontWeight={700}>{formatCurrency(margin.profitPerHour)}</Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </Stack>
                      </>
                    )}
                  </>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* ─── Notes & Terms ─────────────────────────────────── */}
        <SectionCard icon={<ReceiptLongIcon color="primary" />} title="Notes & Terms">
          <Stack spacing={2}>
            <TextField
              label="Client-Facing Notes"
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              size="small"
              multiline
              rows={2}
              fullWidth
              placeholder="Notes that will appear on the quote..."
            />
            <TextField
              label="Internal Notes (not on quote)"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              size="small"
              multiline
              rows={2}
              fullWidth
            />
            <TextField
              label="Payment Terms (days)"
              type="number"
              value={paymentTermsDaysStr}
              onChange={(e) => setPaymentTermsDaysStr(e.target.value)}
              size="small"
              sx={{ width: 180 }}
            />
          </Stack>
        </SectionCard>

        {/* ─── Actions ───────────────────────────────────────── */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => navigate('/quotes')} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            disabled={!clientId || lineItems.length === 0}
            onClick={handleSave}
            sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
          >
            Save Quote
          </Button>
        </Stack>
      </Stack>

      {/* Quick Add Client Dialog (Task 6) */}
      <Dialog open={quickClientOpen} onClose={() => setQuickClientOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Quick Add Client</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={quickClient.name} onChange={(e) => setQuickClient({ ...quickClient, name: e.target.value })} fullWidth required />
            <TextField label="Phone" value={quickClient.phone} onChange={(e) => setQuickClient({ ...quickClient, phone: e.target.value })} fullWidth />
            <TextField label="Email" value={quickClient.email} onChange={(e) => setQuickClient({ ...quickClient, email: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setQuickClientOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!quickClient.name.trim()}
            onClick={() => {
              const newClient = saveClient({
                contractorUserId: userId,
                name: quickClient.name.trim(),
                phone: quickClient.phone.trim(),
                email: quickClient.email.trim(),
                notes: '',
              });
              setClientId(newClient.id);
              setClientRefresh((n) => n + 1);
              setQuickClientOpen(false);
              setQuickClient({ name: '', phone: '', email: '' });
            }}
            sx={{ borderRadius: '10px', fontWeight: 700 }}
          >
            Add Client
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

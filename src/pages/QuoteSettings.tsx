import React, { useState, useMemo } from 'react';
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
  Switch,
  FormControlLabel,
  Divider,
  alpha,
  useTheme,
  MenuItem,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StarIcon from '@mui/icons-material/Star';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import { getQuoteConfig, saveQuoteConfig, updateQuoteConfig, getKits, saveKit, updateKit, deleteKit } from '../services/quoteStore';
import { Kit, DroneModel } from '../types/quote';
import { calculateKitHourlyRates, createDefaultKitValues, formatCurrency } from '../utils/quoteCalculator';
import { useAuth } from '../contexts/AuthContext';

const DRONE_MODELS: DroneModel[] = ['T25', 'T40', 'T50', 'T50 (with D-RTK)', 'T100', 'Other'];

const DRONE_PRESETS: Record<string, Partial<Kit>> = {
  T25: {
    dronePurchasePrice: 27000, tankSizeLitres: 20, batteryCount: 3,
    batteryPriceEach: 2800, batteryCycleLife: 1000, flightMinutesPerCharge: 9,
    chargerPrice: 2310, generatorPrice: 5990, hectaresPerFlightHour: 12,
  },
  T40: {
    dronePurchasePrice: 32000, tankSizeLitres: 40, batteryCount: 3,
    batteryPriceEach: 3850, batteryCycleLife: 1000, flightMinutesPerCharge: 8,
    chargerPrice: 2310, generatorPrice: 8990, hectaresPerFlightHour: 18,
  },
  T50: {
    dronePurchasePrice: 34500, tankSizeLitres: 40, batteryCount: 4,
    batteryPriceEach: 3850, batteryCycleLife: 1500, flightMinutesPerCharge: 8,
    chargerPrice: 2380, generatorPrice: 8990, hectaresPerFlightHour: 18,
  },
  'T50 (with D-RTK)': {
    dronePurchasePrice: 42000, tankSizeLitres: 40, batteryCount: 4,
    batteryPriceEach: 3850, batteryCycleLife: 1500, flightMinutesPerCharge: 8,
    chargerPrice: 2380, generatorPrice: 8990, hectaresPerFlightHour: 20,
  },
  T100: {
    dronePurchasePrice: 58000, tankSizeLitres: 70, batteryCount: 4,
    batteryPriceEach: 5200, batteryCycleLife: 1500, flightMinutesPerCharge: 7,
    chargerPrice: 2380, generatorPrice: 15000, hectaresPerFlightHour: 30,
  },
};

export default function QuoteSettings() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const userId = user?.id || '';

  const existing = useMemo(() => getQuoteConfig(userId), [userId]);
  const [saved, setSaved] = useState(false);
  const [kits, setKits] = useState(() => getKits(userId));
  const [kitDialogOpen, setKitDialogOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | null>(null);

  // Business form state
  const [businessName, setBusinessName] = useState(existing?.businessName || '');
  const [businessABN, setBusinessABN] = useState(existing?.businessABN || '');
  const [businessAddress, setBusinessAddress] = useState(existing?.businessAddress || '');
  const [businessPhone, setBusinessPhone] = useState(existing?.businessPhone || '');
  const [businessEmail, setBusinessEmail] = useState(existing?.businessEmail || '');

  const [appRate, setAppRate] = useState(existing?.defaultApplicationRateLHa || 30);
  const [multiplier, setMultiplier] = useState(existing?.defaultRateMultiplier || 1.8);
  const [hourlyRate, setHourlyRate] = useState(existing?.defaultHourlyRate || 250);
  const [spotRate, setSpotRate] = useState(existing?.defaultSpotSprayHourlyRate || 300);
  const [dailyRate, setDailyRate] = useState(existing?.defaultDailyContractRate || 2200);

  const [travelRate, setTravelRate] = useState(existing?.defaultTravelRatePerKm || 1.50);
  const [setupFee, setSetupFee] = useState(existing?.defaultSetupFee || 150);
  const [complexMixFee, setComplexMixFee] = useState(existing?.defaultComplexMixFee || 75);
  const [hazPpeRate, setHazPpeRate] = useState(existing?.defaultHazardousPPEHourly || 80);
  const [complexityRate, setComplexityRate] = useState(existing?.defaultComplexitySurchargePerHour || 80);
  const [chemOperatorRate, setChemOperatorRate] = useState(existing?.defaultChemOperatorRatePerHour || 45);

  const [chemAdmin, setChemAdmin] = useState(existing?.defaultChemicalAdminPercent || 10);
  const [markup, setMarkup] = useState(existing?.defaultMarkupPercent || 0);

  const [gstRegistered, setGstRegistered] = useState(existing?.gstRegistered ?? true);
  const [paymentDays, setPaymentDays] = useState(existing?.defaultPaymentTermsDays || 14);
  const [validityDays, setValidityDays] = useState(existing?.defaultQuoteValidityDays || 30);
  const [terms, setTerms] = useState(
    existing?.termsAndConditions ||
    '50% deposit required before commencement of work. Balance due on completion. All prices in AUD.',
  );

  const handleSave = () => {
    const data = {
      contractorUserId: userId,
      defaultApplicationRateLHa: appRate,
      defaultRateMultiplier: multiplier,
      defaultPerHaOverride: null,
      defaultHourlyRate: hourlyRate,
      defaultSpotSprayHourlyRate: spotRate,
      defaultDailyContractRate: dailyRate,
      defaultTravelRatePerKm: travelRate,
      defaultSetupFee: setupFee,
      defaultComplexMixFee: complexMixFee,
      defaultHazardousPPEHourly: hazPpeRate,
      defaultComplexitySurchargePerHour: complexityRate,
      defaultChemOperatorRatePerHour: chemOperatorRate,
      defaultChemicalAdminPercent: chemAdmin,
      defaultMarkupPercent: markup,
      businessName,
      businessABN,
      businessAddress,
      businessPhone,
      businessEmail,
      logoDataUrl: existing?.logoDataUrl || null,
      gstRegistered,
      gstRate: 0.10,
      defaultPaymentTermsDays: paymentDays,
      defaultQuoteValidityDays: validityDays,
      termsAndConditions: terms,
    };

    if (existing) {
      updateQuoteConfig(userId, data);
    } else {
      saveQuoteConfig(data);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // ─── Kit handlers ──────────────────────────────────

  const handleNewKit = () => {
    setEditingKit(null);
    setKitDialogOpen(true);
  };

  const handleEditKit = (kit: Kit) => {
    setEditingKit(kit);
    setKitDialogOpen(true);
  };

  const handleDuplicateKit = (kit: Kit) => {
    const { id, createdAt, updatedAt, ...rest } = kit;
    saveKit({ ...rest, name: `${kit.name} (copy)`, isDefault: false });
    setKits(getKits(userId));
  };

  const handleDeleteKit = (kit: Kit) => {
    if (window.confirm(`Delete kit "${kit.name}"?`)) {
      deleteKit(kit.id);
      setKits(getKits(userId));
    }
  };

  const handleSetDefault = (kit: Kit) => {
    updateKit(kit.id, { isDefault: true });
    setKits(getKits(userId));
  };

  const handleKitSaved = () => {
    setKits(getKits(userId));
    setKitDialogOpen(false);
    setEditingKit(null);
  };

  const SectionTitle = ({ children }: { children: string }) => (
    <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 2, mb: 1 }}>
      {children}
    </Typography>
  );

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/quotes')} sx={{ mb: 2 }}>
        Back to Quotes
      </Button>

      <Typography variant="h4" fontWeight={800} gutterBottom>
        Quote Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Set your default rates, business details, and manage your equipment kits for accurate cost tracking.
      </Typography>

      {saved && <Alert severity="success" sx={{ mb: 2 }}>Settings saved.</Alert>}

      <Stack spacing={3}>
        {/* ─── Equipment Kits ─────────────────────────────────── */}
        <Card sx={{ borderRadius: 3, border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <PrecisionManufacturingIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Equipment Kits
                </Typography>
              </Stack>
              <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={handleNewKit} sx={{ borderRadius: 2 }}>
                New Kit
              </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Save your drone setups with all associated costs. When quoting, select a kit to automatically calculate your true costs and margin.
            </Typography>

            {kits.length === 0 ? (
              <Alert severity="info" icon={false}>
                No kits yet. Create one to start tracking costs and margins on your quotes.
              </Alert>
            ) : (
              <Stack spacing={2}>
                {kits.map((kit) => {
                  const rates = calculateKitHourlyRates(kit);
                  return (
                    <Card
                      key={kit.id}
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        borderColor: kit.isDefault ? theme.palette.primary.main : undefined,
                        bgcolor: kit.isDefault ? alpha(theme.palette.primary.main, 0.03) : undefined,
                      }}
                    >
                      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="subtitle1" fontWeight={700}>
                                  {kit.name}
                                </Typography>
                                {kit.isDefault && (
                                  <Chip
                                    icon={<StarIcon sx={{ fontSize: 14 }} />}
                                    label="Default"
                                    size="small"
                                    color="primary"
                                    sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
                                  />
                                )}
                              </Stack>
                              <Typography variant="caption" color="text.secondary">
                                {kit.droneModel}{kit.droneCustomName ? ` — ${kit.droneCustomName}` : ''} | {kit.batteryCount} batteries | {kit.tankSizeLitres}L tank
                              </Typography>
                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={0.5}>
                            {!kit.isDefault && (
                              <IconButton size="small" onClick={() => handleSetDefault(kit)} title="Set as default">
                                <StarIcon fontSize="small" />
                              </IconButton>
                            )}
                            <IconButton size="small" onClick={() => handleEditKit(kit)} title="Edit">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDuplicateKit(kit)} title="Duplicate">
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteKit(kit)} title="Delete">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Stack>

                        <Divider sx={{ my: 1.5 }} />

                        <Stack direction="row" spacing={3} flexWrap="wrap">
                          <CostChip label="Equipment" value={`${formatCurrency(rates.totalEquipmentPerHour)}/hr`} />
                          <CostChip label="Labour" value={`${formatCurrency(kit.pilotCostPerHour)}/hr`} />
                          <CostChip label="Insurance" value={`${formatCurrency(rates.insurancePerHour)}/hr`} />
                          <CostChip label="Maintenance" value={`${formatCurrency(rates.maintenancePerHour)}/hr`} />
                          <CostChip label="Vehicle" value={`${formatCurrency(rates.vehicleCostPerKm)}/km`} />
                          <CostChip
                            label="Total Cost/hr"
                            value={formatCurrency(
                              rates.totalEquipmentPerHour +
                              kit.pilotCostPerHour +
                              rates.insurancePerHour +
                              rates.maintenancePerHour,
                            )}
                            primary
                          />
                          <CostChip label="Productivity" value={`${kit.hectaresPerFlightHour} ha/hr`} />
                          <CostChip
                            label="Cost/ha"
                            value={formatCurrency(
                              kit.hectaresPerFlightHour > 0
                                ? (rates.totalEquipmentPerHour + kit.pilotCostPerHour + rates.insurancePerHour + rates.maintenancePerHour) / kit.hectaresPerFlightHour
                                : 0,
                            )}
                            primary
                          />
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <SectionTitle>Business Details</SectionTitle>
            <Stack spacing={2}>
              <TextField label="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} size="small" fullWidth />
              <Stack direction="row" spacing={2}>
                <TextField label="ABN" value={businessABN} onChange={(e) => setBusinessABN(e.target.value)} size="small" sx={{ flex: 1 }} />
                <TextField label="Phone" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} size="small" sx={{ flex: 1 }} />
              </Stack>
              <TextField label="Email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} size="small" fullWidth />
              <TextField label="Address" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} size="small" fullWidth multiline rows={2} />
            </Stack>
          </CardContent>
        </Card>

        {/* Default Rates */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <SectionTitle>Broadacre Defaults</SectionTitle>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField label="Default Application Rate (L/ha)" type="number" value={appRate} onChange={(e) => setAppRate(parseFloat(e.target.value) || 30)} size="small" sx={{ width: 220 }} />
              <TextField label="Rate Multiplier" type="number" value={multiplier} onChange={(e) => setMultiplier(parseFloat(e.target.value) || 1.8)} size="small" sx={{ width: 150 }} inputProps={{ step: 0.1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                = ${(appRate * multiplier).toFixed(2)}/ha
              </Typography>
            </Stack>

            <SectionTitle>Hourly / Daily Defaults</SectionTitle>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField label="Hourly Rate ($)" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)} size="small" sx={{ width: 150 }} />
              <TextField label="Spot Spray $/hr" type="number" value={spotRate} onChange={(e) => setSpotRate(parseFloat(e.target.value) || 0)} size="small" sx={{ width: 150 }} />
              <TextField label="Daily Contract ($)" type="number" value={dailyRate} onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)} size="small" sx={{ width: 150 }} />
            </Stack>

            <SectionTitle>Travel & Setup</SectionTitle>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField label="Travel $/km" type="number" value={travelRate} onChange={(e) => setTravelRate(parseFloat(e.target.value) || 0)} size="small" sx={{ width: 130 }} inputProps={{ step: 0.1 }} />
              <TextField label="Setup Fee ($)" type="number" value={setupFee} onChange={(e) => setSetupFee(parseFloat(e.target.value) || 0)} size="small" sx={{ width: 130 }} />
            </Stack>

            <SectionTitle>Surcharges</SectionTitle>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField label="Complex Mix Fee ($)" type="number" value={complexMixFee} onChange={(e) => setComplexMixFee(parseFloat(e.target.value) || 0)} size="small" sx={{ width: 160 }} />
              <TextField label="Haz PPE $/hr" type="number" value={hazPpeRate} onChange={(e) => setHazPpeRate(parseFloat(e.target.value) || 0)} size="small" sx={{ width: 130 }} />
              <TextField label="Complexity $/hr" type="number" value={complexityRate} onChange={(e) => setComplexityRate(parseFloat(e.target.value) || 0)} size="small" sx={{ width: 140 }} />
              <TextField label="Chem Operator $/hr" type="number" value={chemOperatorRate} onChange={(e) => setChemOperatorRate(parseFloat(e.target.value) || 0)} size="small" sx={{ width: 160 }} />
            </Stack>

            <SectionTitle>Margins</SectionTitle>
            <Stack direction="row" spacing={2}>
              <TextField label="Chemical Admin %" type="number" value={chemAdmin} onChange={(e) => setChemAdmin(parseFloat(e.target.value) || 0)} size="small" sx={{ width: 150 }} />
              <TextField label="Default Markup %" type="number" value={markup} onChange={(e) => setMarkup(parseFloat(e.target.value) || 0)} size="small" sx={{ width: 150 }} />
            </Stack>
          </CardContent>
        </Card>

        {/* GST & Terms */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <SectionTitle>GST & Payment</SectionTitle>
            <Stack spacing={2}>
              <FormControlLabel
                control={<Switch checked={gstRegistered} onChange={(e) => setGstRegistered(e.target.checked)} />}
                label="GST Registered (quotes will include 10% GST)"
              />
              <Stack direction="row" spacing={2}>
                <TextField label="Payment Terms (days)" type="number" value={paymentDays} onChange={(e) => setPaymentDays(parseInt(e.target.value) || 14)} size="small" sx={{ width: 180 }} />
                <TextField label="Quote Validity (days)" type="number" value={validityDays} onChange={(e) => setValidityDays(parseInt(e.target.value) || 30)} size="small" sx={{ width: 180 }} />
              </Stack>
              <TextField
                label="Default Terms & Conditions"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                size="small"
                fullWidth
                multiline
                rows={4}
              />
            </Stack>
          </CardContent>
        </Card>

        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{ borderRadius: 2, px: 4, fontWeight: 700, alignSelf: 'flex-end' }}
        >
          Save Settings
        </Button>
      </Stack>

      {/* ─── Kit Editor Dialog ──────────────────────────────── */}
      <KitEditorDialog
        open={kitDialogOpen}
        onClose={() => { setKitDialogOpen(false); setEditingKit(null); }}
        onSaved={handleKitSaved}
        existingKit={editingKit}
        userId={userId}
      />
    </Box>
  );
}

// ─── Small cost chip component ──────────────────────────────

function CostChip({ label, value, primary }: { label: string; value: string; primary?: boolean }) {
  return (
    <Box sx={{ textAlign: 'center', minWidth: 80 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: primary ? 800 : 600, color: primary ? 'primary.main' : 'text.primary', fontSize: '0.85rem' }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// ─── Kit Editor Dialog ──────────────────────────────────────

function KitEditorDialog({
  open,
  onClose,
  onSaved,
  existingKit,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  existingKit: Kit | null;
  userId: string;
}) {
  const defaults = createDefaultKitValues(userId);
  const initial = existingKit || defaults;

  const [name, setName] = useState(initial.name);
  const [isDefault, setIsDefault] = useState(initial.isDefault);
  const [droneModel, setDroneModel] = useState<DroneModel>(initial.droneModel);
  const [droneCustomName, setDroneCustomName] = useState(initial.droneCustomName);
  const [dronePurchasePrice, setDronePurchasePrice] = useState(String(initial.dronePurchasePrice));
  const [droneLifespanYears, setDroneLifespanYears] = useState(String(initial.droneLifespanYears));
  const [tankSizeLitres, setTankSizeLitres] = useState(String(initial.tankSizeLitres));

  const [batteryCount, setBatteryCount] = useState(String(initial.batteryCount));
  const [batteryPriceEach, setBatteryPriceEach] = useState(String(initial.batteryPriceEach));
  const [batteryCycleLife, setBatteryCycleLife] = useState(String(initial.batteryCycleLife));
  const [flightMinutesPerCharge, setFlightMinutesPerCharge] = useState(String(initial.flightMinutesPerCharge));

  const [chargerPrice, setChargerPrice] = useState(String(initial.chargerPrice));
  const [chargerLifespanYears, setChargerLifespanYears] = useState(String(initial.chargerLifespanYears));
  const [generatorPrice, setGeneratorPrice] = useState(String(initial.generatorPrice));
  const [generatorLifespanYears, setGeneratorLifespanYears] = useState(String(initial.generatorLifespanYears));
  const [generatorFuelCostPerHour, setGeneratorFuelCostPerHour] = useState(String(initial.generatorFuelCostPerHour));

  const [propsCostPerHour, setPropsCostPerHour] = useState(String(initial.propsCostPerHour));
  const [nozzlesCostPerHour, setNozzlesCostPerHour] = useState(String(initial.nozzlesCostPerHour));
  const [filtersCostPerHour, setFiltersCostPerHour] = useState(String(initial.filtersCostPerHour));
  const [pumpServiceCostPerHour, setPumpServiceCostPerHour] = useState(String(initial.pumpServiceCostPerHour));
  const [otherConsumablesPerHour, setOtherConsumablesPerHour] = useState(String(initial.otherConsumablesPerHour));

  const [vehicleCostPerKm, setVehicleCostPerKm] = useState(String(initial.vehicleCostPerKm));

  const [publicLiabilityAnnual, setPublicLiabilityAnnual] = useState(String(initial.publicLiabilityAnnual));
  const [hullInsuranceAnnual, setHullInsuranceAnnual] = useState(String(initial.hullInsuranceAnnual));
  const [workersCompAnnual, setWorkersCompAnnual] = useState(String(initial.workersCompAnnual));
  const [professionalIndemnityAnnual, setProfessionalIndemnityAnnual] = useState(String(initial.professionalIndemnityAnnual));

  const [licensingCostsAnnual, setLicensingCostsAnnual] = useState(String(initial.licensingCostsAnnual));
  const [softwareCostsAnnual, setSoftwareCostsAnnual] = useState(String(initial.softwareCostsAnnual));

  const [pilotCostPerHour, setPilotCostPerHour] = useState(String(initial.pilotCostPerHour));
  const [pilotIncludesSuper, setPilotIncludesSuper] = useState(initial.pilotIncludesSuper);

  const [ppeSafetyAnnual, setPpeSafetyAnnual] = useState(String(initial.ppeSafetyAnnual));
  const [maintenanceBudgetAnnual, setMaintenanceBudgetAnnual] = useState(String(initial.maintenanceBudgetAnnual));
  const [overheadAnnual, setOverheadAnnual] = useState(String(initial.overheadAnnual));

  const [estimatedFlightHoursPerYear, setEstimatedFlightHoursPerYear] = useState(String(initial.estimatedFlightHoursPerYear));
  const [estimatedJobsPerYear, setEstimatedJobsPerYear] = useState(String(initial.estimatedJobsPerYear));
  const [estimatedKmPerYear, setEstimatedKmPerYear] = useState(String(initial.estimatedKmPerYear));
  const [estimatedRevenuePerYear, setEstimatedRevenuePerYear] = useState(String(initial.estimatedRevenuePerYear));
  const [hectaresPerFlightHour, setHectaresPerFlightHour] = useState(String(initial.hectaresPerFlightHour));

  // Reset form when dialog opens with new kit
  React.useEffect(() => {
    if (!open) return;
    const src = existingKit || createDefaultKitValues(userId);
    setName(src.name);
    setIsDefault(src.isDefault);
    setDroneModel(src.droneModel);
    setDroneCustomName(src.droneCustomName);
    setDronePurchasePrice(String(src.dronePurchasePrice));
    setDroneLifespanYears(String(src.droneLifespanYears));
    setTankSizeLitres(String(src.tankSizeLitres));
    setBatteryCount(String(src.batteryCount));
    setBatteryPriceEach(String(src.batteryPriceEach));
    setBatteryCycleLife(String(src.batteryCycleLife));
    setFlightMinutesPerCharge(String(src.flightMinutesPerCharge));
    setChargerPrice(String(src.chargerPrice));
    setChargerLifespanYears(String(src.chargerLifespanYears));
    setGeneratorPrice(String(src.generatorPrice));
    setGeneratorLifespanYears(String(src.generatorLifespanYears));
    setGeneratorFuelCostPerHour(String(src.generatorFuelCostPerHour));
    setPropsCostPerHour(String(src.propsCostPerHour));
    setNozzlesCostPerHour(String(src.nozzlesCostPerHour));
    setFiltersCostPerHour(String(src.filtersCostPerHour));
    setPumpServiceCostPerHour(String(src.pumpServiceCostPerHour));
    setOtherConsumablesPerHour(String(src.otherConsumablesPerHour));
    setVehicleCostPerKm(String(src.vehicleCostPerKm));
    setPublicLiabilityAnnual(String(src.publicLiabilityAnnual));
    setHullInsuranceAnnual(String(src.hullInsuranceAnnual));
    setWorkersCompAnnual(String(src.workersCompAnnual));
    setProfessionalIndemnityAnnual(String(src.professionalIndemnityAnnual));
    setLicensingCostsAnnual(String(src.licensingCostsAnnual));
    setSoftwareCostsAnnual(String(src.softwareCostsAnnual));
    setPilotCostPerHour(String(src.pilotCostPerHour));
    setPilotIncludesSuper(src.pilotIncludesSuper);
    setPpeSafetyAnnual(String(src.ppeSafetyAnnual));
    setMaintenanceBudgetAnnual(String(src.maintenanceBudgetAnnual));
    setOverheadAnnual(String(src.overheadAnnual));
    setEstimatedFlightHoursPerYear(String(src.estimatedFlightHoursPerYear));
    setEstimatedJobsPerYear(String(src.estimatedJobsPerYear));
    setEstimatedKmPerYear(String(src.estimatedKmPerYear));
    setEstimatedRevenuePerYear(String(src.estimatedRevenuePerYear));
    setHectaresPerFlightHour(String(src.hectaresPerFlightHour));
  }, [open, existingKit, userId]);

  const handleModelChange = (model: DroneModel) => {
    setDroneModel(model);
    const preset = DRONE_PRESETS[model];
    if (preset) {
      if (preset.dronePurchasePrice !== undefined) setDronePurchasePrice(String(preset.dronePurchasePrice));
      if (preset.tankSizeLitres !== undefined) setTankSizeLitres(String(preset.tankSizeLitres));
      if (preset.batteryCount !== undefined) setBatteryCount(String(preset.batteryCount));
      if (preset.batteryPriceEach !== undefined) setBatteryPriceEach(String(preset.batteryPriceEach));
      if (preset.batteryCycleLife !== undefined) setBatteryCycleLife(String(preset.batteryCycleLife));
      if (preset.flightMinutesPerCharge !== undefined) setFlightMinutesPerCharge(String(preset.flightMinutesPerCharge));
      if (preset.chargerPrice !== undefined) setChargerPrice(String(preset.chargerPrice));
      if (preset.generatorPrice !== undefined) setGeneratorPrice(String(preset.generatorPrice));
      if (preset.hectaresPerFlightHour !== undefined) setHectaresPerFlightHour(String(preset.hectaresPerFlightHour));
    }
  };

  const p = (s: string) => parseFloat(s) || 0;
  const pi = (s: string) => parseInt(s) || 0;

  // Live cost preview
  const previewKit: Kit = {
    id: '', contractorUserId: userId, createdAt: '', updatedAt: '',
    name, isDefault, droneModel, droneCustomName,
    dronePurchasePrice: p(dronePurchasePrice), droneLifespanYears: p(droneLifespanYears),
    tankSizeLitres: p(tankSizeLitres),
    batteryCount: pi(batteryCount), batteryPriceEach: p(batteryPriceEach),
    batteryCycleLife: pi(batteryCycleLife), flightMinutesPerCharge: p(flightMinutesPerCharge),
    chargerPrice: p(chargerPrice), chargerLifespanYears: p(chargerLifespanYears),
    generatorPrice: p(generatorPrice), generatorLifespanYears: p(generatorLifespanYears),
    generatorFuelCostPerHour: p(generatorFuelCostPerHour),
    propsCostPerHour: p(propsCostPerHour), nozzlesCostPerHour: p(nozzlesCostPerHour),
    filtersCostPerHour: p(filtersCostPerHour), pumpServiceCostPerHour: p(pumpServiceCostPerHour),
    otherConsumablesPerHour: p(otherConsumablesPerHour),
    vehicleCostPerKm: p(vehicleCostPerKm),
    publicLiabilityAnnual: p(publicLiabilityAnnual), hullInsuranceAnnual: p(hullInsuranceAnnual),
    workersCompAnnual: p(workersCompAnnual), professionalIndemnityAnnual: p(professionalIndemnityAnnual),
    licensingCostsAnnual: p(licensingCostsAnnual), softwareCostsAnnual: p(softwareCostsAnnual),
    pilotCostPerHour: p(pilotCostPerHour), pilotIncludesSuper,
    ppeSafetyAnnual: p(ppeSafetyAnnual), maintenanceBudgetAnnual: p(maintenanceBudgetAnnual),
    overheadAnnual: p(overheadAnnual),
    estimatedFlightHoursPerYear: p(estimatedFlightHoursPerYear), estimatedJobsPerYear: pi(estimatedJobsPerYear),
    estimatedKmPerYear: p(estimatedKmPerYear), estimatedRevenuePerYear: p(estimatedRevenuePerYear),
    hectaresPerFlightHour: p(hectaresPerFlightHour),
  };

  const rates = calculateKitHourlyRates(previewKit);
  const totalCostPerHour = rates.totalEquipmentPerHour + previewKit.pilotCostPerHour + rates.insurancePerHour + rates.maintenancePerHour;
  const costPerHa = previewKit.hectaresPerFlightHour > 0 ? totalCostPerHour / previewKit.hectaresPerFlightHour : 0;

  const handleSave = () => {
    const { id, createdAt, updatedAt, ...kitData } = previewKit;
    if (existingKit) {
      updateKit(existingKit.id, kitData);
    } else {
      saveKit(kitData);
    }
    onSaved();
  };

  const F = ({ label, value, onChange, width = 150, step, helperText }: {
    label: string; value: string; onChange: (v: string) => void;
    width?: number; step?: number; helperText?: string;
  }) => (
    <TextField
      label={label}
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      sx={{ width }}
      inputProps={step ? { step } : undefined}
      helperText={helperText}
    />
  );

  const SectionLabel = ({ children }: { children: string }) => (
    <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1.5, mb: 0.5, color: 'primary.main' }}>
      {children}
    </Typography>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>
        {existingKit ? 'Edit Kit' : 'New Equipment Kit'}
      </DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '70vh' }}>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {/* Kit name & default */}
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Kit Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="small"
              fullWidth
              placeholder="e.g. Single T50 — Field Kit"
            />
            <FormControlLabel
              control={<Switch checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />}
              label="Default"
              sx={{ whiteSpace: 'nowrap' }}
            />
          </Stack>

          {/* Drone */}
          <SectionLabel>Drone</SectionLabel>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <TextField
              select
              label="Drone Model"
              value={droneModel}
              onChange={(e) => handleModelChange(e.target.value as DroneModel)}
              size="small"
              sx={{ width: 200 }}
            >
              {DRONE_MODELS.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField>
            <F label="Custom Name" value={droneCustomName} onChange={setDroneCustomName} width={180} />
            <F label="Purchase Price ($)" value={dronePurchasePrice} onChange={setDronePurchasePrice} />
            <F label="Lifespan (years)" value={droneLifespanYears} onChange={setDroneLifespanYears} width={120} />
            <F label="Tank Size (L)" value={tankSizeLitres} onChange={setTankSizeLitres} width={120} />
          </Stack>

          {/* Batteries */}
          <SectionLabel>Batteries</SectionLabel>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <F label="Battery Count" value={batteryCount} onChange={setBatteryCount} width={120} />
            <F label="Price Each ($)" value={batteryPriceEach} onChange={setBatteryPriceEach} />
            <F label="Cycle Life" value={batteryCycleLife} onChange={setBatteryCycleLife} width={120} />
            <F label="Flight Min/Charge" value={flightMinutesPerCharge} onChange={setFlightMinutesPerCharge} width={140} />
          </Stack>

          {/* Charger & Generator */}
          <SectionLabel>Charger & Generator</SectionLabel>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <F label="Charger Price ($)" value={chargerPrice} onChange={setChargerPrice} />
            <F label="Charger Life (yrs)" value={chargerLifespanYears} onChange={setChargerLifespanYears} width={130} />
            <F label="Generator Price ($)" value={generatorPrice} onChange={setGeneratorPrice} />
            <F label="Generator Life (yrs)" value={generatorLifespanYears} onChange={setGeneratorLifespanYears} width={130} />
            <F label="Fuel $/hr" value={generatorFuelCostPerHour} onChange={setGeneratorFuelCostPerHour} width={100} step={0.5} />
          </Stack>

          {/* Consumables */}
          <SectionLabel>Consumables (cost per flight hour)</SectionLabel>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <F label="Props $/hr" value={propsCostPerHour} onChange={setPropsCostPerHour} width={110} step={0.1} />
            <F label="Nozzles $/hr" value={nozzlesCostPerHour} onChange={setNozzlesCostPerHour} width={110} step={0.1} />
            <F label="Filters $/hr" value={filtersCostPerHour} onChange={setFiltersCostPerHour} width={110} step={0.1} />
            <F label="Pump Service $/hr" value={pumpServiceCostPerHour} onChange={setPumpServiceCostPerHour} width={130} step={0.1} />
            <F label="Other $/hr" value={otherConsumablesPerHour} onChange={setOtherConsumablesPerHour} width={110} step={0.1} />
          </Stack>

          {/* Vehicle */}
          <SectionLabel>Vehicle</SectionLabel>
          <Stack direction="row" spacing={2}>
            <F label="Cost per km ($)" value={vehicleCostPerKm} onChange={setVehicleCostPerKm} width={130} step={0.01}
              helperText="ATO rate: $0.88/km"
            />
          </Stack>

          {/* Insurance */}
          <SectionLabel>Insurance (annual)</SectionLabel>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <F label="Public Liability ($)" value={publicLiabilityAnnual} onChange={setPublicLiabilityAnnual} width={160} />
            <F label="Hull/Equipment ($)" value={hullInsuranceAnnual} onChange={setHullInsuranceAnnual} width={160} />
            <F label="Workers Comp ($)" value={workersCompAnnual} onChange={setWorkersCompAnnual} width={150} />
            <F label="Prof. Indemnity ($)" value={professionalIndemnityAnnual} onChange={setProfessionalIndemnityAnnual} width={160} />
          </Stack>

          {/* Licensing & Software */}
          <SectionLabel>Licensing & Software (annual)</SectionLabel>
          <Stack direction="row" spacing={2}>
            <F label="Licensing ($)" value={licensingCostsAnnual} onChange={setLicensingCostsAnnual}
              helperText="ReOC, RePL, CASA, ChemCert"
            />
            <F label="Software ($)" value={softwareCostsAnnual} onChange={setSoftwareCostsAnnual}
              helperText="DJI Terra, mapping, CRM"
            />
          </Stack>

          {/* Labour */}
          <SectionLabel>Labour</SectionLabel>
          <Stack direction="row" spacing={2} alignItems="center">
            <F label="Pilot Cost $/hr" value={pilotCostPerHour} onChange={setPilotCostPerHour}
              helperText="Loaded rate (inc. super)"
            />
            <FormControlLabel
              control={<Switch checked={pilotIncludesSuper} onChange={(e) => setPilotIncludesSuper(e.target.checked)} />}
              label="Includes super"
            />
          </Stack>

          {/* PPE, Maintenance, Overhead */}
          <SectionLabel>PPE, Maintenance & Overhead (annual)</SectionLabel>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <F label="PPE & Safety ($)" value={ppeSafetyAnnual} onChange={setPpeSafetyAnnual} />
            <F label="Maintenance ($)" value={maintenanceBudgetAnnual} onChange={setMaintenanceBudgetAnnual}
              helperText="Repairs, servicing"
            />
            <F label="Overhead ($)" value={overheadAnnual} onChange={setOverheadAnnual}
              helperText="Office, phone, accounting"
            />
          </Stack>

          {/* Estimated Annual Usage */}
          <SectionLabel>Estimated Annual Usage (for cost allocation)</SectionLabel>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <F label="Flight Hours/yr" value={estimatedFlightHoursPerYear} onChange={setEstimatedFlightHoursPerYear} />
            <F label="Jobs/yr" value={estimatedJobsPerYear} onChange={setEstimatedJobsPerYear} width={120} />
            <F label="Km Driven/yr" value={estimatedKmPerYear} onChange={setEstimatedKmPerYear} />
            <F label="Revenue/yr ($)" value={estimatedRevenuePerYear} onChange={setEstimatedRevenuePerYear} width={160} />
          </Stack>

          {/* Productivity */}
          <SectionLabel>Productivity</SectionLabel>
          <Stack direction="row" spacing={2}>
            <F label="Hectares/Flight Hour" value={hectaresPerFlightHour} onChange={setHectaresPerFlightHour}
              helperText="T25: ~12, T50: ~18-21"
            />
          </Stack>

          {/* Live Cost Summary */}
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight={700} color="primary.main">
            Live Cost Summary
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableBody>
                <CostRow label="Drone depreciation" value={`${formatCurrency(rates.droneDepPerHour)}/hr`} />
                <CostRow label="Battery depreciation" value={`${formatCurrency(rates.batteryDepPerHour)}/hr`} />
                <CostRow label="Charger depreciation" value={`${formatCurrency(rates.chargerDepPerHour)}/hr`} />
                <CostRow label="Generator depreciation" value={`${formatCurrency(rates.genDepPerHour)}/hr`} />
                <CostRow label="Consumables" value={`${formatCurrency(rates.consumablesPerHour)}/hr`} />
                <CostRow label="Generator fuel" value={`${formatCurrency(rates.fuelPerHour)}/hr`} />
                <CostRow label="Equipment subtotal" value={`${formatCurrency(rates.totalEquipmentPerHour)}/hr`} bold />
                <CostRow label="Labour" value={`${formatCurrency(previewKit.pilotCostPerHour)}/hr`} />
                <CostRow label="Insurance" value={`${formatCurrency(rates.insurancePerHour)}/hr`} />
                <CostRow label="Maintenance" value={`${formatCurrency(rates.maintenancePerHour)}/hr`} />
                <CostRow label="Licensing (per job)" value={`${formatCurrency(rates.licensingPerJob)}`} />
                <CostRow label="Software (per job)" value={`${formatCurrency(rates.softwarePerJob)}`} />
                <CostRow label="PPE (per job)" value={`${formatCurrency(rates.ppeSafetyPerJob)}`} />
                <CostRow label="Overhead" value={`${rates.overheadPercent.toFixed(1)}% of revenue`} />
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, borderBottom: 'none' }}>Total operating cost</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: 'primary.main', borderBottom: 'none' }}>
                    {formatCurrency(totalCostPerHour)}/hr
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, borderBottom: 'none' }}>Cost per hectare</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: 'primary.main', borderBottom: 'none' }}>
                    {formatCurrency(costPerHa)}/ha
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!name.trim()}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          {existingKit ? 'Update Kit' : 'Save Kit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CostRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <TableRow>
      <TableCell sx={{ py: 0.5, fontWeight: bold ? 700 : 400, fontSize: '0.8rem' }}>{label}</TableCell>
      <TableCell align="right" sx={{ py: 0.5, fontWeight: bold ? 700 : 400, fontSize: '0.8rem' }}>{value}</TableCell>
    </TableRow>
  );
}

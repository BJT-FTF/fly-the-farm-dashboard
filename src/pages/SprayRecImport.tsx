import React, { useState, useMemo, useRef } from 'react';
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
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  alpha,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import ScienceIcon from '@mui/icons-material/Science';
import DescriptionIcon from '@mui/icons-material/Description';
import { parseSprayRec, SprayRecExtraction } from '../services/sprayRecParser';
import {
  getClients,
  saveClient,
  getPropertiesByClient,
  saveProperty,
  getFieldsByProperty,
  saveField,
  saveJob,
} from '../services/fieldManagementStore';
import { Client, Property, Field, SprayRecFileRef, ChemicalEntry, WeatherConditions } from '../types/fieldManagement';
import { AustralianState, ALL_STATES } from '../types/chemical';
import { findTreatmentByBrand, getTreatmentById } from '../data/chemicals';
import { useAuth } from '../contexts/AuthContext';

const STEPS = ['Upload Spray Rec', 'Review & Match', 'Save Job'];

const defaultWeather: WeatherConditions = {
  tempC: null,
  windSpeedKmh: null,
  windDirection: '',
  humidity: null,
  deltaT: null,
};

export default function SprayRecImport() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  // Stepper
  const [activeStep, setActiveStep] = useState(0);

  // Step 1 — Upload
  const [sprayRec, setSprayRec] = useState<SprayRecFileRef | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsingMsg, setParsingMsg] = useState('');
  const [parseError, setParseError] = useState('');
  const [extraction, setExtraction] = useState<SprayRecExtraction | null>(null);

  // Step 2 — Match / Create
  const allClients = useMemo(() => getClients(), []);

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [creatingClient, setCreatingClient] = useState(false);

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyState, setNewPropertyState] = useState<AustralianState>('QLD');
  const [creatingProperty, setCreatingProperty] = useState(false);

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [newFieldName, setNewFieldName] = useState('');
  const [creatingField, setCreatingField] = useState(false);

  // Chemical edits
  const [chemicals, setChemicals] = useState<ChemicalEntry[]>([]);
  const [waterRateLHa, setWaterRateLHa] = useState('');
  const [weedTarget, setWeedTarget] = useState('');
  const [dateSprayed, setDateSprayed] = useState('');
  const [notes, setNotes] = useState('');

  // Derived data
  const clientProperties = useMemo(
    () => (selectedClientId ? getPropertiesByClient(selectedClientId) : []),
    [selectedClientId],
  );
  const propertyFields = useMemo(
    () => (selectedPropertyId ? getFieldsByProperty(selectedPropertyId) : []),
    [selectedPropertyId],
  );

  const selectedClient = useMemo(
    () => allClients.find((c) => c.id === selectedClientId),
    [allClients, selectedClientId],
  );

  // ─── Step 1: Upload & Parse ───────────────────────────────

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const rec: SprayRecFileRef = {
        fileName: file.name,
        sizeBytes: file.size,
        dataUrl,
        uploadedAt: new Date().toISOString(),
      };
      setSprayRec(rec);
      setParseError('');
      setExtraction(null);

      if (file.name.toLowerCase().endsWith('.pdf')) {
        setParsing(true);
        setParsingMsg('Extracting text from PDF...');
        try {
          const result = await parseSprayRec(dataUrl, (msg) => setParsingMsg(msg));
          setExtraction(result);
          applyExtraction(result);
          setActiveStep(1);
        } catch (err) {
          console.error('Parse error:', err);
          setParseError('Could not extract data from this PDF. You can still fill in details manually.');
          setActiveStep(1);
        } finally {
          setParsing(false);
          setParsingMsg('');
        }
      } else {
        setActiveStep(1);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const applyExtraction = (ext: SprayRecExtraction) => {
    // Chemicals
    if (ext.chemicals.length > 0) {
      setChemicals(ext.chemicals);
    }
    if (ext.waterRateLHa) setWaterRateLHa(ext.waterRateLHa);
    if (ext.weedTarget) setWeedTarget(ext.weedTarget);
    if (ext.dateSprayed) {
      // Try to convert DD/MM/YYYY to YYYY-MM-DD for date input
      const parts = ext.dateSprayed.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
      if (parts) {
        let year = parts[3];
        if (year.length === 2) year = `20${year}`;
        const month = parts[2].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        setDateSprayed(`${year}-${month}-${day}`);
      }
    }

    // Try to auto-match client
    if (ext.clientName) {
      const match = allClients.find(
        (c) => c.name.toLowerCase().includes(ext.clientName.toLowerCase()) ||
               ext.clientName.toLowerCase().includes(c.name.toLowerCase()),
      );
      if (match) {
        setSelectedClientId(match.id);
        autoMatchProperty(match.id, ext);
      } else {
        setNewClientName(ext.clientName);
        setCreatingClient(true);
      }
    }

    // Pre-fill field name from extraction
    if (ext.fieldName) {
      setNewFieldName(ext.fieldName);
    }
  };

  const autoMatchProperty = (clientId: string, ext: SprayRecExtraction) => {
    const props = getPropertiesByClient(clientId);
    if (ext.propertyName) {
      const match = props.find(
        (p) => p.name.toLowerCase().includes(ext.propertyName.toLowerCase()) ||
               ext.propertyName.toLowerCase().includes(p.name.toLowerCase()),
      );
      if (match) {
        setSelectedPropertyId(match.id);
        autoMatchField(match.id, ext);
        return;
      }
    }
    // If only one property, auto-select it
    if (props.length === 1) {
      setSelectedPropertyId(props[0].id);
      autoMatchField(props[0].id, ext);
    }
  };

  const autoMatchField = (propertyId: string, ext: SprayRecExtraction) => {
    const fields = getFieldsByProperty(propertyId);
    if (ext.fieldName) {
      const match = fields.find(
        (f) => f.name.toLowerCase().includes(ext.fieldName.toLowerCase()) ||
               ext.fieldName.toLowerCase().includes(f.name.toLowerCase()),
      );
      if (match) {
        setSelectedFieldId(match.id);
        return;
      }
    }
    if (fields.length === 1) {
      setSelectedFieldId(fields[0].id);
    }
  };

  // ─── Step 2: Create entities if needed ─────────────────────

  const handleCreateClient = () => {
    if (!newClientName.trim()) return;
    const client = saveClient({
      contractorUserId: user?.id || '',
      name: newClientName.trim(),
      phone: newClientPhone.trim(),
      email: newClientEmail.trim(),
      addresses: [],
      notes: '',
    });
    setSelectedClientId(client.id);
    setCreatingClient(false);
    setNewClientName('');
  };

  const handleCreateProperty = () => {
    if (!newPropertyName.trim() || !selectedClientId) return;
    const prop = saveProperty({
      clientId: selectedClientId,
      name: newPropertyName.trim(),
      address: '',
      state: newPropertyState,
      locality: '',
      lotPlan: '',
      notes: '',
    });
    setSelectedPropertyId(prop.id);
    setCreatingProperty(false);
    setNewPropertyName('');
  };

  const handleCreateField = () => {
    if (!newFieldName.trim() || !selectedPropertyId) return;
    const field = saveField({
      propertyId: selectedPropertyId,
      name: newFieldName.trim(),
      sizeHa: extraction?.totalHa ? parseFloat(extraction.totalHa) || 0 : 0,
      boundary: null,
      notes: '',
    });
    setSelectedFieldId(field.id);
    setCreatingField(false);
    setNewFieldName('');
  };

  // ─── Step 3: Save Job ──────────────────────────────────────

  const canSave = selectedClientId && selectedPropertyId && selectedFieldId && weedTarget.trim();

  const handleSave = () => {
    if (!selectedClientId || !selectedPropertyId || !selectedFieldId) return;
    const validChemicals = chemicals.filter((c) => c.product.trim());
    const job = saveJob({
      fieldId: selectedFieldId,
      propertyId: selectedPropertyId,
      clientId: selectedClientId,
      weedTarget: weedTarget.trim(),
      chemicals: validChemicals,
      waterRateLHa,
      adjuvants: '',
      dateSprayed: dateSprayed || new Date().toISOString().split('T')[0],
      weather: defaultWeather,
      sprayRec: sprayRec,
      droneModel: '',
      applicatorName: '',
      notes: notes.trim(),
    });
    navigate(`/jobs/client/${selectedClientId}/property/${selectedPropertyId}/field/${selectedFieldId}/job/${job.id}`);
  };

  // ─── Chemical helpers ──────────────────────────────────────

  const updateChemical = (index: number, field: keyof ChemicalEntry, value: string) => {
    setChemicals((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const removeChemical = (index: number) => {
    setChemicals((prev) => prev.filter((_, i) => i !== index));
  };

  const addChemical = () => {
    setChemicals((prev) => [...prev, { product: '', activeIngredient: '', ratePerHa: '', treatmentId: null }]);
  };

  // ─── Render ────────────────────────────────────────────────

  const confidenceColor = (c: 'high' | 'medium' | 'low') =>
    c === 'high' ? 'success' : c === 'medium' ? 'warning' : 'default';

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/jobs')} sx={{ mb: 2 }}>
        Back to Jobs
      </Button>

      <Typography variant="h4" fontWeight={800} gutterBottom>
        Import Spray Rec
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload a spray recommendation PDF to auto-create a job with pre-filled details.
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* ─── STEP 0: Upload ─────────────────────────────────── */}
      {activeStep === 0 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
            <DescriptionIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2, opacity: 0.6 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Upload Spray Recommendation PDF
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
              We'll extract chemicals, rates, client details, field names, dates and more — then help you create the job in seconds.
            </Typography>

            <input ref={fileRef} type="file" accept=".pdf" hidden onChange={handleFileUpload} />

            {parsing ? (
              <Box sx={{ py: 4 }}>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {parsingMsg || 'Processing...'}
                </Typography>
              </Box>
            ) : (
              <Button
                variant="contained"
                size="large"
                startIcon={<UploadFileIcon />}
                onClick={() => fileRef.current?.click()}
                sx={{ borderRadius: 2, px: 5, py: 1.5, fontSize: '1rem' }}
              >
                Choose PDF File
              </Button>
            )}

            {parseError && (
              <Alert severity="warning" sx={{ mt: 3, maxWidth: 500, mx: 'auto' }}>
                {parseError}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── STEP 1: Review & Match ─────────────────────────── */}
      {activeStep >= 1 && (
        <Stack spacing={3}>
          {/* Extraction summary */}
          {extraction && extraction.extractedItems.length > 0 && (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <AutoFixHighIcon color="success" />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Extracted from Spray Rec
                  </Typography>
                  {extraction.ocrUsed && <Chip label="OCR" size="small" color="info" variant="outlined" />}
                  <Chip
                    label={extraction.confidence}
                    size="small"
                    color={confidenceColor(extraction.confidence)}
                    variant="outlined"
                  />
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {extraction.extractedItems.map((item, i) => (
                    <Chip
                      key={i}
                      icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                      label={`${item.label}: ${item.value}`}
                      size="small"
                      color={confidenceColor(item.confidence)}
                      variant="outlined"
                      sx={{ maxWidth: 400, '& .MuiChip-label': { whiteSpace: 'normal' } }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Client selection */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                1. Client
              </Typography>

              {!creatingClient ? (
                <Stack spacing={2}>
                  <Autocomplete
                    options={allClients}
                    getOptionLabel={(c) => c.name}
                    value={allClients.find((c) => c.id === selectedClientId) || null}
                    onChange={(_, v) => {
                      setSelectedClientId(v?.id || null);
                      setSelectedPropertyId(null);
                      setSelectedFieldId(null);
                      if (v && extraction) autoMatchProperty(v.id, extraction);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select existing client"
                        placeholder="Type to search..."
                        size="small"
                      />
                    )}
                  />
                  {extraction?.clientName && !selectedClientId && (
                    <Alert severity="info" sx={{ alignItems: 'center' }}>
                      Extracted client: <strong>{extraction.clientName}</strong> — not found in database.
                      <Button
                        size="small"
                        startIcon={<PersonAddIcon />}
                        onClick={() => {
                          setNewClientName(extraction.clientName);
                          setCreatingClient(true);
                        }}
                        sx={{ ml: 1 }}
                      >
                        Create Client
                      </Button>
                    </Alert>
                  )}
                  <Button
                    size="small"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setCreatingClient(true)}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    New Client
                  </Button>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <TextField
                    label="Client Name"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    size="small"
                    fullWidth
                    autoFocus
                  />
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Phone"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleCreateClient}
                      disabled={!newClientName.trim()}
                    >
                      Create Client
                    </Button>
                    <Button size="small" onClick={() => setCreatingClient(false)}>
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              )}

              {selectedClientId && (
                <Chip
                  label={`Client: ${selectedClient?.name}`}
                  color="success"
                  size="small"
                  icon={<CheckCircleIcon />}
                  sx={{ mt: 1 }}
                />
              )}
            </CardContent>
          </Card>

          {/* Property selection */}
          {selectedClientId && (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                  2. Property
                </Typography>

                {!creatingProperty ? (
                  <Stack spacing={2}>
                    {clientProperties.length > 0 ? (
                      <Autocomplete
                        options={clientProperties}
                        getOptionLabel={(p) => p.name}
                        value={clientProperties.find((p) => p.id === selectedPropertyId) || null}
                        onChange={(_, v) => {
                          setSelectedPropertyId(v?.id || null);
                          setSelectedFieldId(null);
                          if (v && extraction) autoMatchField(v.id, extraction);
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="Select property" size="small" />
                        )}
                      />
                    ) : (
                      <Alert severity="info">No properties yet for this client.</Alert>
                    )}
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setNewPropertyName(extraction?.propertyName || '');
                        setCreatingProperty(true);
                      }}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      New Property
                    </Button>
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    <TextField
                      label="Property Name"
                      value={newPropertyName}
                      onChange={(e) => setNewPropertyName(e.target.value)}
                      size="small"
                      fullWidth
                      autoFocus
                    />
                    <TextField
                      select
                      label="State"
                      value={newPropertyState}
                      onChange={(e) => setNewPropertyState(e.target.value as AustralianState)}
                      size="small"
                      sx={{ maxWidth: 200 }}
                    >
                      {ALL_STATES.map((s) => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                      ))}
                    </TextField>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleCreateProperty}
                        disabled={!newPropertyName.trim()}
                      >
                        Create Property
                      </Button>
                      <Button size="small" onClick={() => setCreatingProperty(false)}>
                        Cancel
                      </Button>
                    </Stack>
                  </Stack>
                )}

                {selectedPropertyId && (
                  <Chip
                    label={`Property: ${clientProperties.find((p) => p.id === selectedPropertyId)?.name}`}
                    color="success"
                    size="small"
                    icon={<CheckCircleIcon />}
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Field selection */}
          {selectedPropertyId && (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                  3. Field / Paddock
                </Typography>

                {!creatingField ? (
                  <Stack spacing={2}>
                    {propertyFields.length > 0 ? (
                      <Autocomplete
                        options={propertyFields}
                        getOptionLabel={(f) => `${f.name} (${f.sizeHa} ha)`}
                        value={propertyFields.find((f) => f.id === selectedFieldId) || null}
                        onChange={(_, v) => setSelectedFieldId(v?.id || null)}
                        renderInput={(params) => (
                          <TextField {...params} label="Select field" size="small" />
                        )}
                      />
                    ) : (
                      <Alert severity="info">No fields yet for this property.</Alert>
                    )}
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setNewFieldName(extraction?.fieldName || '');
                        setCreatingField(true);
                      }}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      New Field
                    </Button>
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    <TextField
                      label="Field Name"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      size="small"
                      fullWidth
                      autoFocus
                    />
                    {extraction?.totalHa && (
                      <Typography variant="caption" color="text.secondary">
                        Size from spray rec: {extraction.totalHa} ha
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleCreateField}
                        disabled={!newFieldName.trim()}
                      >
                        Create Field
                      </Button>
                      <Button size="small" onClick={() => setCreatingField(false)}>
                        Cancel
                      </Button>
                    </Stack>
                  </Stack>
                )}

                {selectedFieldId && (
                  <Chip
                    label={`Field: ${propertyFields.find((f) => f.id === selectedFieldId)?.name}`}
                    color="success"
                    size="small"
                    icon={<CheckCircleIcon />}
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Job details */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                4. Job Details
              </Typography>

              <Stack spacing={2}>
                <TextField
                  label="Target Weed / Pest *"
                  value={weedTarget}
                  onChange={(e) => setWeedTarget(e.target.value)}
                  size="small"
                  fullWidth
                />

                <TextField
                  label="Date Sprayed"
                  type="date"
                  value={dateSprayed}
                  onChange={(e) => setDateSprayed(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{ maxWidth: 220 }}
                />

                <TextField
                  label="Water Rate (L/ha)"
                  value={waterRateLHa}
                  onChange={(e) => setWaterRateLHa(e.target.value)}
                  size="small"
                  sx={{ maxWidth: 220 }}
                />

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" alignItems="center" spacing={1}>
                  <ScienceIcon color="primary" sx={{ fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Chemicals ({chemicals.length})
                  </Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={addChemical}>
                    Add
                  </Button>
                </Stack>

                {chemicals.map((chem, idx) => (
                  <Card
                    key={idx}
                    variant="outlined"
                    sx={{ borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <TextField
                            label="Product"
                            value={chem.product}
                            onChange={(e) => updateChemical(idx, 'product', e.target.value)}
                            size="small"
                            sx={{ flex: 2 }}
                          />
                          <TextField
                            label="Rate/ha"
                            value={chem.ratePerHa}
                            onChange={(e) => updateChemical(idx, 'ratePerHa', e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                          />
                          <Button
                            color="error"
                            size="small"
                            onClick={() => removeChemical(idx)}
                            sx={{ minWidth: 'auto', px: 1 }}
                          >
                            ×
                          </Button>
                        </Stack>
                        <TextField
                          label="Active Ingredient"
                          value={chem.activeIngredient}
                          onChange={(e) => updateChemical(idx, 'activeIngredient', e.target.value)}
                          size="small"
                          fullWidth
                          helperText={
                            chem.activeIngredient
                              ? undefined
                              : chem.treatmentId
                              ? 'Matched in database'
                              : 'Not found in database — will be looked up'
                          }
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                ))}

                <TextField
                  label="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  size="small"
                  multiline
                  rows={2}
                  fullWidth
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => {
                setActiveStep(0);
                setSprayRec(null);
                setExtraction(null);
                setParseError('');
              }}
            >
              Upload Different File
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              disabled={!canSave}
              onClick={handleSave}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Create Job
            </Button>
          </Stack>

          {!canSave && activeStep >= 1 && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Select a client, property, and field, and enter a target weed/pest to save.
            </Alert>
          )}
        </Stack>
      )}
    </Box>
  );
}

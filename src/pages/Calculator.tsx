import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  alpha,
  useTheme,
  Paper,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import OpacityIcon from '@mui/icons-material/Opacity';
import ScienceIcon from '@mui/icons-material/Science';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const CHEMICAL_OPTIONS = [
  'Grazon Extra',
  'Hatchet',
  'Hatchet Extra',
  'Garlon 600',
  'Hotshot',
  'Taskforce 745',
  'Glyphosate 450',
  'Roundup PowerMAX',
  'Weedmaster DST',
  '2,4-D Amine 625',
  'Amicide Advance 700',
  'MCPA 750',
  'Metsulfuron 600 WG',
  'Starane Advanced',
  'Fluroxypyr 333',
  'Kamba 750 (Dicamba)',
  'Lontrel 300 (Clopyralid)',
  'Imazapyr 250',
  'Graslan Aerial',
  'Roundup Biactive',
  'Weedmaster Duo',
  'Hasten',
  'Pulse Penetrant',
  'BS1000',
  'Uptake',
  'Activator',
  'LI-700',
  'Foamex',
  'Flagman Spray Dye',
  'Momentum Dye',
];

interface ChemicalRow {
  id: number;
  name: string;
  unit: 'L' | 'g';
  ratePerHa: number;
}

let nextId = 1;
function createRow(): ChemicalRow {
  return { id: nextId++, name: '', unit: 'L', ratePerHa: 0 };
}

export default function Calculator() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [hectares, setHectares] = useState<number>(50);
  const [applicationRate, setApplicationRate] = useState<number>(100);
  const [tankSize, setTankSize] = useState<number>(500);
  const [chemicals, setChemicals] = useState<ChemicalRow[]>([
    createRow(),
    createRow(),
    createRow(),
  ]);

  // ── Core formulas ──
  // Total spray mix for the entire job
  const totalSprayVolume = applicationRate * hectares;
  // How many batches to complete the job
  const totalBatches = tankSize > 0 ? totalSprayVolume / tankSize : 0;
  // How many hectares one batch covers
  const hectaresPerBatch = applicationRate > 0 ? tankSize / applicationRate : 0;
  // Total liquid chemical (L only) per hectare — displaces water in each batch
  const liquidChemPerHa = chemicals.reduce(
    (sum, r) => sum + (r.unit === 'L' && r.ratePerHa > 0 ? r.ratePerHa : 0), 0,
  );
  // Liquid chemical per batch
  const liquidChemPerBatch = liquidChemPerHa * hectaresPerBatch;
  // Water per batch = tank size minus liquid chemicals
  const waterPerBatch = Math.max(0, tankSize - liquidChemPerBatch);

  const addRow = () => setChemicals((prev) => [...prev, createRow()]);
  const removeRow = (id: number) => {
    setChemicals((prev) => prev.length > 1 ? prev.filter((r) => r.id !== id) : prev);
  };
  const updateRow = (id: number, field: keyof ChemicalRow, value: string | number) => {
    setChemicals((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
  };

  const fmt = (n: number, dp = 2) => {
    if (n === 0) return '—';
    if (Number.isInteger(n) && n < 100000) return n.toLocaleString();
    return n.toFixed(dp).replace(/\.?0+$/, '');
  };

  const hasChemicals = chemicals.some((r) => r.name && r.ratePerHa > 0);

  return (
    <Box>
      {/* Header */}
      <Box className="ftf-animate-in" sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}
          size="small"
        >
          Home
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: '14px',
            bgcolor: alpha(theme.palette.secondary.main, 0.08),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CalculateIcon sx={{ fontSize: 26, color: 'secondary.main' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ color: 'primary.dark', fontWeight: 700 }}>
              Spray Calculator
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Calculate batch mixes and chemical quantities for your spray job
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Job Parameters */}
      <Box className="ftf-animate-in-delay-1">
        <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, borderRadius: '14px', mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <FlightTakeoffIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                Job Parameters
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Hectares to Spray"
                  type="number"
                  value={hectares || ''}
                  onChange={(e) => setHectares(parseFloat(e.target.value) || 0)}
                  fullWidth
                  size="small"
                  slotProps={{ input: { endAdornment: <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>ha</Typography> } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Application Rate"
                  type="number"
                  value={applicationRate || ''}
                  onChange={(e) => setApplicationRate(parseFloat(e.target.value) || 0)}
                  fullWidth
                  size="small"
                  slotProps={{ input: { endAdornment: <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>L/ha</Typography> } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Batch Plant Size"
                  type="number"
                  value={tankSize || ''}
                  onChange={(e) => setTankSize(parseFloat(e.target.value) || 0)}
                  fullWidth
                  size="small"
                  slotProps={{ input: { endAdornment: <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>L</Typography> } }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Key numbers */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total Spray Volume', value: `${fmt(totalSprayVolume, 0)} L`, sub: `${fmt(hectares)} ha × ${fmt(applicationRate)} L/ha`, icon: <OpacityIcon />, color: '#1976d2' },
            { label: 'Batches Required', value: fmt(Math.ceil(totalBatches)), sub: `${fmt(totalSprayVolume, 0)} L ÷ ${fmt(tankSize)} L`, icon: <LocalShippingIcon />, color: theme.palette.secondary.main },
            { label: 'Hectares / Batch', value: `${fmt(hectaresPerBatch)} ha`, sub: `${fmt(tankSize)} L ÷ ${fmt(applicationRate)} L/ha`, icon: <FlightTakeoffIcon />, color: '#1b8a5a' },
          ].map((s) => (
            <Grid size={{ xs: 12, sm: 4 }} key={s.label}>
              <Card elevation={0} sx={{ bgcolor: alpha(s.color, 0.04), border: `1px solid ${alpha(s.color, 0.1)}`, borderRadius: '12px' }}>
                <CardContent sx={{ textAlign: 'center', py: 2.5, '&:last-child': { pb: 2.5 } }}>
                  {React.cloneElement(s.icon, { sx: { fontSize: 22, color: s.color, mb: 0.5 } })}
                  <Typography variant="h4" sx={{ fontWeight: 800, color: s.color, fontFamily: '"Outfit", system-ui, sans-serif', lineHeight: 1.2 }}>
                    {s.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha(s.color, 0.7), fontWeight: 600, display: 'block' }}>
                    {s.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                    {s.sub}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Chemical Inputs */}
      <Box className="ftf-animate-in-delay-2">
        <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, borderRadius: '14px' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScienceIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                  Chemicals
                </Typography>
              </Box>
              <Button size="small" startIcon={<AddIcon />} onClick={addRow} sx={{ fontWeight: 600 }}>
                Add Chemical
              </Button>
            </Box>

            {chemicals.map((row, idx) => (
              <Box key={row.id}>
                {idx > 0 && <Divider sx={{ my: 2 }} />}
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Autocomplete
                      freeSolo
                      options={CHEMICAL_OPTIONS}
                      value={row.name}
                      onInputChange={(_e, val) => updateRow(row.id, 'name', val)}
                      renderInput={(params) => (
                        <TextField {...params} label={`Chemical ${idx + 1}`} size="small" placeholder="Select or type..." />
                      )}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 5, sm: 2 }}>
                    <ToggleButtonGroup
                      value={row.unit}
                      exclusive
                      onChange={(_e, val) => { if (val) updateRow(row.id, 'unit', val); }}
                      size="small"
                      fullWidth
                      sx={{
                        '& .MuiToggleButton-root': { fontWeight: 700, fontSize: '0.8rem', py: 0.75 },
                        '& .Mui-selected': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1) + ' !important',
                          color: theme.palette.primary.main + ' !important',
                        },
                      }}
                    >
                      <ToggleButton value="L">L/ha</ToggleButton>
                      <ToggleButton value="g">g/ha</ToggleButton>
                    </ToggleButtonGroup>
                  </Grid>
                  <Grid size={{ xs: 5, sm: 3 }}>
                    <TextField
                      label={`Rate (${row.unit}/ha)`}
                      type="number"
                      value={row.ratePerHa || ''}
                      onChange={(e) => updateRow(row.id, 'ratePerHa', parseFloat(e.target.value) || 0)}
                      fullWidth
                      size="small"
                      slotProps={{ input: { endAdornment: <Typography variant="caption" color="text.secondary">{row.unit}/ha</Typography> } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 2, sm: 1 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton
                      size="small"
                      onClick={() => removeRow(row.id)}
                      disabled={chemicals.length <= 1}
                      sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>

      {/* What goes in each batch — always visible when there are liquid chemicals */}
      {liquidChemPerBatch > 0 && (
        <Box sx={{ mt: 3 }}>
          <Card elevation={0} sx={{ border: `2px solid ${alpha('#1976d2', 0.2)}`, borderRadius: '14px', bgcolor: alpha('#1976d2', 0.02) }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }}>
                What Goes In Each {fmt(tankSize)} L Batch
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 4 }}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: '12px', bgcolor: alpha('#1976d2', 0.06) }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#1976d2', fontFamily: '"Outfit", system-ui, sans-serif' }}>
                      {fmt(waterPerBatch, 1)} L
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1976d2' }}>Water</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 1 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h5" sx={{ color: 'text.disabled', fontWeight: 300 }}>+</Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: '12px', bgcolor: alpha(theme.palette.secondary.main, 0.06) }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.secondary.main, fontFamily: '"Outfit", system-ui, sans-serif' }}>
                      {fmt(liquidChemPerBatch, 1)} L
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>Chemical</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 1 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h5" sx={{ color: 'text.disabled', fontWeight: 300 }}>=</Typography>
                </Grid>
                <Grid size={{ xs: 2 }}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: '12px', bgcolor: alpha('#1b8a5a', 0.06) }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#1b8a5a', fontFamily: '"Outfit", system-ui, sans-serif' }}>
                      {fmt(tankSize)} L
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1b8a5a' }}>Batch</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Results Table */}
      {hasChemicals && (
        <Box className="ftf-animate-in-delay-3" sx={{ mt: 3 }}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha('#1b8a5a', 0.15)}`, borderRadius: '14px', overflow: 'hidden' }}>
            <Box sx={{ bgcolor: alpha('#1b8a5a', 0.04), px: 3, py: 2, borderBottom: `1px solid ${alpha('#1b8a5a', 0.1)}` }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1b8a5a' }}>
                Batch Mix Breakdown
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Each batch covers {fmt(hectaresPerBatch)} ha &bull; {Math.ceil(totalBatches)} batches to complete {fmt(hectares)} ha
              </Typography>
            </Box>
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', py: 1.5 } }}>
                    <TableCell>Product</TableCell>
                    <TableCell align="center">Rate / ha</TableCell>
                    <TableCell align="center">Per Batch ({fmt(hectaresPerBatch)} ha)</TableCell>
                    <TableCell align="center">Total Job ({fmt(hectares)} ha)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chemicals
                    .filter((r) => r.name && r.ratePerHa > 0)
                    .map((row) => {
                      const perBatch = row.ratePerHa * hectaresPerBatch;
                      const totalJob = row.ratePerHa * hectares;
                      const unit = row.unit;
                      return (
                        <TableRow key={row.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">{fmt(row.ratePerHa)} {unit}/ha</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.primary.main }}>
                              {fmt(perBatch)} {unit}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={700} sx={{ color: '#1b8a5a' }}>
                              {fmt(totalJob)} {unit}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  {/* Water row — reduced by liquid chemical volume */}
                  <TableRow sx={{ bgcolor: alpha('#1976d2', 0.04), '& td': { borderTop: `2px solid ${alpha('#1976d2', 0.15)}` } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#1976d2' }}>Water</Typography>
                      {liquidChemPerBatch > 0 && (
                        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                          {fmt(tankSize)} L tank − {fmt(liquidChemPerBatch)} L chemical
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ color: '#1976d2' }}>—</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#1976d2' }}>
                        {fmt(waterPerBatch, 1)} L
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#1976d2' }}>
                        {fmt(waterPerBatch * Math.ceil(totalBatches), 0)} L
                      </Typography>
                    </TableCell>
                  </TableRow>

                  {/* Batch total row */}
                  <TableRow sx={{ bgcolor: alpha('#1b8a5a', 0.04), '& td': { borderTop: `2px solid ${alpha('#1b8a5a', 0.15)}` } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#1b8a5a' }}>Batch Total</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ color: '#1b8a5a' }}>{fmt(applicationRate)} L/ha</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#1b8a5a' }}>
                        {fmt(tankSize)} L
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#1b8a5a' }}>
                        {fmt(totalSprayVolume, 0)} L
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}

      {/* Disclaimer */}
      <Box sx={{ mt: 3, mb: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          This calculator is for reference only. Always read the product label and verify rates before mixing.
          Check label compatibility before tank mixing multiple products.
        </Typography>
      </Box>
    </Box>
  );
}

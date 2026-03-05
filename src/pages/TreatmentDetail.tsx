import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PublicIcon from '@mui/icons-material/Public';
import FlightIcon from '@mui/icons-material/Flight';
import SpeedIcon from '@mui/icons-material/Speed';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ScienceIcon from '@mui/icons-material/Science';
import GavelIcon from '@mui/icons-material/Gavel';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import OpacityIcon from '@mui/icons-material/Opacity';
import { getTreatmentById, getTreatmentsForWeed } from '../data/chemicals';
import DroneStatusChip from '../components/DroneStatusChip';
import ChemicalCard from '../components/ChemicalCard';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <TableRow>
      <TableCell sx={{
        fontWeight: 600, color: 'text.secondary', border: 'none', py: 1.5, pl: 0,
        width: '35%', verticalAlign: 'top', fontSize: '0.8125rem',
      }}>
        {label}
      </TableCell>
      <TableCell sx={{ border: 'none', py: 1.5, fontSize: '0.9375rem' }}>{value}</TableCell>
    </TableRow>
  );
}

function SectionCard({ title, icon, color, children }: {
  title: string; icon: React.ReactNode; color: string; children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Card elevation={0} sx={{ height: '100%', border: `1px solid ${alpha(color, 0.1)}` }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '10px',
            bgcolor: alpha(color, 0.08),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {React.cloneElement(icon as React.ReactElement<any>, { sx: { fontSize: 18, color } })}
          </Box>
          <Typography variant="h6" sx={{ fontSize: '0.95rem' }}>{title}</Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

export default function TreatmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const treatment = getTreatmentById(id || '');

  if (!treatment) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
        <Alert severity="error">Treatment not found.</Alert>
      </Box>
    );
  }

  const relatedTreatments = getTreatmentsForWeed(treatment.weed).filter((t) => t.id !== treatment.id);

  const statusSeverity = treatment.droneStatus === 'permitted' || treatment.droneStatus === 'permitted-granular'
    ? 'success' as const
    : treatment.droneStatus.startsWith('not-')
      ? 'error' as const
      : 'warning' as const;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{
          mb: 3,
          color: 'text.secondary',
          fontWeight: 600,
          '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) },
        }}
      >
        Back to results
      </Button>

      {/* APVMA source banner */}
      {treatment.source === 'apvma-auto' && (
        <Alert
          severity="info"
          icon={<PublicIcon />}
          className="ftf-animate-in"
          sx={{ mb: 3 }}
        >
          <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
            APVMA Register Entry — Unverified for Drone Use
          </Typography>
          <Typography variant="body2">
            This product was automatically saved from the APVMA PubCRIS register.
            Drone-specific application data has not been verified. Always check the product label
            for aerial application directions before use.
          </Typography>
        </Alert>
      )}

      {/* Header */}
      <Box className="ftf-animate-in" sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
          <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2rem' } }}>
            {treatment.source === 'apvma-auto' ? treatment.brands : treatment.weed}
          </Typography>
          <DroneStatusChip status={treatment.droneStatus} />
        </Box>
        {treatment.source !== 'apvma-auto' && (
          <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {treatment.brands}
          </Typography>
        )}
        <Typography variant="body2" sx={{ color: alpha(theme.palette.text.secondary, 0.6) }}>
          {treatment.activeIngredient}
        </Typography>
        {treatment.apvmaNumber && (
          <Typography variant="body2" sx={{ color: alpha(theme.palette.text.secondary, 0.6), mt: 0.5 }}>
            APVMA No: {treatment.apvmaNumber}
            {treatment.registrant && ` — ${treatment.registrant}`}
            {treatment.formulation && ` — ${treatment.formulation}`}
            {treatment.poisonSchedule && ` — ${treatment.poisonSchedule}`}
          </Typography>
        )}
        {treatment.labelUrl && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<DescriptionIcon />}
            endIcon={<OpenInNewIcon sx={{ fontSize: '14px !important' }} />}
            href={treatment.labelUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              mt: 2,
              fontWeight: 600,
              borderColor: alpha(theme.palette.primary.main, 0.2),
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            View Product Label (APVMA)
          </Button>
        )}
      </Box>

      {/* Drone Status Banner */}
      <Alert
        severity={statusSeverity}
        className="ftf-animate-in-delay-1"
        sx={{
          mb: 4,
          '& .MuiAlert-message': { width: '100%' },
        }}
      >
        <Typography variant="body2" fontWeight={700}>
          {treatment.droneStatusNote}
        </Typography>
      </Alert>

      {/* Main Data Grid */}
      <Grid container spacing={3} className="ftf-animate-in-delay-2">
        {/* Aerial Rate & Water */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Aerial Application" icon={<FlightIcon />} color={theme.palette.primary.main}>
            <Table size="small">
              <TableBody>
                <DetailRow label="Aerial Rate" value={
                  <Typography variant="body1" sx={{ fontWeight: 800, color: 'primary.main', fontFamily: '"Outfit", system-ui, sans-serif' }}>
                    {treatment.aerialRate}
                  </Typography>
                } />
                <DetailRow label="Water Volume" value={
                  <Typography variant="body1" sx={{ fontWeight: 800, color: 'primary.main', fontFamily: '"Outfit", system-ui, sans-serif' }}>
                    {treatment.waterLHa} L/ha
                  </Typography>
                } />
                <DetailRow label="Drone Status" value={
                  <Typography variant="body2" color="text.secondary">{treatment.droneStatusNote}</Typography>
                } />
              </TableBody>
            </Table>
          </SectionCard>
        </Grid>

        {/* Water Rate & Droplet Requirements */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Water Rate & Droplet Requirements" icon={<OpacityIcon />} color={theme.palette.secondary.dark}>
            <Table size="small">
              <TableBody>
                <DetailRow label="Min. Water Volume" value={
                  <Typography variant="body1" sx={{ fontWeight: 800, color: theme.palette.secondary.dark, fontFamily: '"Outfit", system-ui, sans-serif' }}>
                    {treatment.waterLHa === '—' ? 'N/A' : `${treatment.waterLHa} L/ha`}
                  </Typography>
                } />
                <DetailRow label="Droplet Category" value={
                  treatment.droneParams ? (
                    <Typography variant="body1" sx={{ fontWeight: 700, color: theme.palette.secondary.dark }}>
                      {treatment.droneParams.dropletSize}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {treatment.droneStatus === 'permitted-granular' ? 'N/A — Granular application' : 'N/A'}
                    </Typography>
                  )
                } />
              </TableBody>
            </Table>
            <Box sx={{
              mt: 1.5, p: 1.5, borderRadius: '8px',
              bgcolor: alpha(theme.palette.secondary.dark, 0.04),
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                Water volumes and droplet categories are per the product label.
                Always confirm label requirements — drone operators must meet minimum water rates for aerial application.
              </Typography>
            </Box>
          </SectionCard>
        </Grid>

        {/* Drone Flight Parameters */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Drone Flight Parameters" icon={<SpeedIcon />} color="#5b7a3a">
            {treatment.droneParams ? (
              <Table size="small">
                <TableBody>
                  <DetailRow label="Flight Height" value={
                    <Typography variant="body1" fontWeight={700}>{treatment.droneParams.flightHeightM}</Typography>
                  } />
                  <DetailRow label="Speed" value={
                    <Typography variant="body1" fontWeight={700}>{treatment.droneParams.speedMs}</Typography>
                  } />
                </TableBody>
              </Table>
            ) : (
              <Box sx={{
                p: 2, borderRadius: '10px',
                bgcolor: alpha(theme.palette.text.secondary, 0.04),
              }}>
                <Typography variant="body2" color="text.secondary">
                  N/A &mdash; {treatment.droneStatus === 'permitted-granular'
                    ? 'Granular spread application'
                    : 'Drone application not permitted for this treatment'}
                </Typography>
              </Box>
            )}
          </SectionCard>
        </Grid>

        {/* Best Timing */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Best Timing" icon={<ScheduleIcon />} color="#2e9e3c">
            <Typography variant="body1" fontWeight={600} sx={{ lineHeight: 1.6 }}>
              {treatment.bestTiming}
            </Typography>
          </SectionCard>
        </Grid>

        {/* Adjuvant Notes */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Adjuvant Notes" icon={<ScienceIcon />} color="#7b3fa0">
            <Typography variant="body1" fontWeight={600} sx={{ lineHeight: 1.6 }}>
              {treatment.adjuvantNotes}
            </Typography>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Related Treatments */}
      {relatedTreatments.length > 0 && (
        <Box className="ftf-animate-in-delay-3">
          <Divider sx={{ my: 5 }} />
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
            Other Treatments for {treatment.weed}
          </Typography>
          <Grid container spacing={2}>
            {relatedTreatments.map((t) => (
              <Grid size={{ xs: 12, md: 6 }} key={t.id}>
                <ChemicalCard treatment={t} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Box className="ftf-animate-in-delay-4">
        <Divider sx={{ my: 5 }} />
        <Alert
          severity="info"
          icon={<GavelIcon sx={{ fontSize: 20 }} />}
          sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}
        >
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            Always read and follow the product label. This information is based on the Gold Standard Field
            Job Card and is for reference only. Drones are classified as aircraft under APVMA. Check
            current APVMA permits and state regulations before application.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  Divider,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FlightIcon from '@mui/icons-material/Flight';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SpeedIcon from '@mui/icons-material/Speed';
import OpacityIcon from '@mui/icons-material/Opacity';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ScienceIcon from '@mui/icons-material/Science';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { WeedTreatment } from '../types/chemical';

interface Props {
  query: string;
  treatments: WeedTreatment[];
}

export default function WeedRecommendations({ query, treatments }: Props) {
  const navigate = useNavigate();
  const theme = useTheme();

  const sorted = [...treatments].sort((a, b) => {
    const order = { permitted: 0, 'permitted-granular': 1, 'permitted-helicopter-caution': 2, 'permitted-fallow-only': 3, 'not-permitted': 4, 'not-permitted-aquatic': 5 };
    return (order[a.droneStatus] ?? 99) - (order[b.droneStatus] ?? 99);
  });
  const top3 = sorted.slice(0, 3);

  if (top3.length === 0) return null;

  const statusConfig = (t: WeedTreatment) => {
    if (t.droneStatus === 'permitted' || t.droneStatus === 'permitted-granular')
      return { bg: '#1b8a5a', label: t.droneStatus === 'permitted' ? 'Drone Permitted' : 'Granular Aerial OK', icon: <CheckCircleIcon /> };
    if (t.droneStatus === 'permitted-helicopter-caution' || t.droneStatus === 'permitted-fallow-only')
      return { bg: '#d4860a', label: t.droneStatus === 'permitted-helicopter-caution' ? 'Permitted (Caution)' : 'Fallow Only', icon: <CheckCircleIcon /> };
    return { bg: '#c23b22', label: t.droneStatus === 'not-permitted-aquatic' ? 'Not Permitted (Aquatic)' : 'Not Permitted', icon: <CancelIcon /> };
  };

  return (
    <Box sx={{ mb: 4 }} className="ftf-animate-in">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: '10px',
          bgcolor: alpha('#4cb85a', 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <EmojiEventsIcon sx={{ color: '#2e9e3c', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ lineHeight: 1.2 }}>
            Top Treatments for "{query}"
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Ranked by drone application suitability
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2.5} sx={{ mt: 1 }}>
        {top3.map((treatment, index) => {
          const status = statusConfig(treatment);
          return (
            <Grid size={{ xs: 12, md: 4 }} key={treatment.id} className={`ftf-animate-in-delay-${index + 1}`}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  overflow: 'visible',
                  ...(index === 0 && {
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: -2,
                      borderRadius: '16px',
                      padding: '2px',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      maskComposite: 'xor',
                      WebkitMaskComposite: 'xor',
                      pointerEvents: 'none',
                    },
                  }),
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 32px rgba(2,51,53,0.12)',
                  },
                }}
              >
                {index === 0 && (
                  <Box sx={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: '8px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    fontFamily: '"Outfit", system-ui, sans-serif',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    whiteSpace: 'nowrap',
                  }}>
                    Best Match
                  </Box>
                )}
                <CardActionArea onClick={() => navigate(`/treatment/${treatment.id}`)} sx={{ height: '100%' }}>
                  <CardContent sx={{ pt: index === 0 ? 3.5 : 2.5, px: 2.5, pb: 2.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.25, lineHeight: 1.3 }}>
                      {treatment.brands}
                    </Typography>
                    <Typography variant="caption" sx={{ color: alpha(theme.palette.text.secondary, 0.6), display: 'block', mb: 2 }}>
                      {treatment.activeIngredient}
                    </Typography>

                    {/* Status banner */}
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 1, mb: 1.5,
                      p: 1.5, borderRadius: '10px', bgcolor: status.bg, color: 'white',
                    }}>
                      {React.cloneElement(status.icon, { sx: { fontSize: 18 } })}
                      <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8125rem' }}>
                        {status.label}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, lineHeight: 1.4 }}>
                      {treatment.droneStatusNote}
                    </Typography>

                    <Divider sx={{ mb: 1.5 }} />

                    <Stack spacing={0.75}>
                      {treatment.aerialRate !== '\u2014' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <FlightIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                          <Typography variant="caption"><strong>Rate:</strong> {treatment.aerialRate}</Typography>
                        </Box>
                      )}
                      {treatment.waterLHa !== '\u2014' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <OpacityIcon sx={{ fontSize: 14, color: 'secondary.dark' }} />
                          <Typography variant="caption"><strong>Water:</strong> {treatment.waterLHa} L/ha</Typography>
                        </Box>
                      )}
                      {treatment.droneParams && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <SpeedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption">
                            <strong>Drone:</strong> {treatment.droneParams.flightHeightM} @ {treatment.droneParams.speedMs}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <ScheduleIcon sx={{ fontSize: 14, color: '#2e9e3c' }} />
                        <Typography variant="caption"><strong>Timing:</strong> {treatment.bestTiming}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <ScienceIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption"><strong>Adjuvant:</strong> {treatment.adjuvantNotes}</Typography>
                      </Box>
                    </Stack>

                    {treatment.droneParams && (
                      <>
                        <Divider sx={{ my: 1.5 }} />
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                          <Chip label={treatment.droneParams.dropletSize} size="small" variant="outlined" color="primary"
                            sx={{ fontSize: '0.7rem', height: 24 }} />
                          <Chip label={treatment.droneParams.flightHeightM} size="small" variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 24 }} />
                          <Chip label={treatment.droneParams.speedMs} size="small" variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 24 }} />
                        </Box>
                      </>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <ArrowForwardIcon sx={{ fontSize: 16, color: 'primary.main', opacity: 0.4 }} />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

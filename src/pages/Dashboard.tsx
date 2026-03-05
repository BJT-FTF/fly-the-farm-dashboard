import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CancelIcon from '@mui/icons-material/Cancel';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ScienceIcon from '@mui/icons-material/Science';
import GrassIcon from '@mui/icons-material/Grass';
import VerifiedIcon from '@mui/icons-material/Verified';
import BlockIcon from '@mui/icons-material/Block';
import PublicIcon from '@mui/icons-material/Public';
import SearchBar from '../components/SearchBar';
import { treatments, getAllWeeds, getSavedAPVMACount } from '../data/chemicals';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const weeds = getAllWeeds();

  const permitted = treatments.filter((t) => t.droneStatus === 'permitted' || t.droneStatus === 'permitted-granular').length;
  const caution = treatments.filter((t) => t.droneStatus === 'permitted-helicopter-caution' || t.droneStatus === 'permitted-fallow-only').length;
  const notPermitted = treatments.filter((t) => t.droneStatus.startsWith('not-')).length;

  const savedAPVMA = getSavedAPVMACount();

  const statCards = [
    { value: treatments.length, label: 'Curated Treatments', icon: <ScienceIcon />, color: theme.palette.primary.main },
    { value: weeds.length, label: 'Weeds Covered', icon: <GrassIcon />, color: theme.palette.secondary.main },
    { value: permitted, label: 'Drone Permitted', icon: <VerifiedIcon />, color: '#1b8a5a' },
    { value: savedAPVMA, label: 'APVMA Saved', icon: <PublicIcon />, color: '#7b3fa0' },
  ];

  return (
    <Box>
      {/* Hero section */}
      <Box
        className="ftf-animate-in"
        sx={{
          textAlign: 'center',
          mb: 5,
          mt: { xs: 1, md: 3 },
          position: 'relative',
        }}
      >
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 1,
          bgcolor: alpha(theme.palette.primary.main, 0.06),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: '20px', px: 2, py: 0.5, mb: 2.5,
        }}>
          <FlightTakeoffIcon sx={{ fontSize: 14, color: 'primary.main' }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '0.04em' }}>
            Aerial Chemical Reference
          </Typography>
        </Box>

        <Typography
          variant="h3"
          sx={{
            color: 'primary.dark',
            mb: 1.5,
            fontSize: { xs: '1.75rem', md: '2.25rem' },
          }}
        >
          G'day{user?.name ? `, ${user.name}` : ''}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 560, mx: 'auto', lineHeight: 1.7 }}
        >
          Search our drone weed control database for aerial application rates, drone settings, and
          regulatory status &mdash; based on the Gold Standard Field Job Card.
        </Typography>
        <Box sx={{ maxWidth: 580, mx: 'auto' }}>
          <SearchBar />
        </Box>
      </Box>

      {/* Stats row */}
      <Box className="ftf-animate-in-delay-1">
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1.5 }}>
          Database Overview
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {statCards.map((stat) => (
            <Grid size={{ xs: 6, sm: 3 }} key={stat.label}>
              <Card elevation={0} sx={{ bgcolor: alpha(stat.color, 0.04), border: `1px solid ${alpha(stat.color, 0.1)}` }}>
                <CardContent sx={{ textAlign: 'center', py: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Box sx={{
                    width: 40, height: 40, borderRadius: '11px',
                    bgcolor: alpha(stat.color, 0.1),
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 1.5,
                  }}>
                    {React.cloneElement(stat.icon, { sx: { fontSize: 20, color: stat.color } })}
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontFamily: '"Outfit", system-ui, sans-serif',
                      fontWeight: 800,
                      color: stat.color,
                      fontSize: { xs: '1.75rem', md: '2rem' },
                      lineHeight: 1,
                      mb: 0.5,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha(stat.color, 0.7), fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Status category cards */}
      <Box className="ftf-animate-in-delay-2">
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1.5 }}>
          Browse by Drone Status
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            {
              label: 'Permitted',
              desc: `${permitted} treatments approved for drone aerial`,
              icon: <CheckCircleIcon />,
              color: '#1b8a5a',
              bg: '#e8f5ed',
              status: 'permitted',
            },
            {
              label: 'Use Caution',
              desc: `${caution} treatments with conditions`,
              icon: <WarningIcon />,
              color: '#d4860a',
              bg: '#fff3e0',
              status: 'caution',
            },
            {
              label: 'Not Permitted',
              desc: `${notPermitted} treatments restricted`,
              icon: <CancelIcon />,
              color: '#c23b22',
              bg: '#fde8e4',
              status: 'not-permitted',
            },
          ].map((cat) => (
            <Grid size={{ xs: 12, sm: 4 }} key={cat.label}>
              <Card
                elevation={0}
                sx={{
                  border: `1px solid ${alpha(cat.color, 0.12)}`,
                  '&:hover': {
                    borderColor: alpha(cat.color, 0.3),
                    bgcolor: cat.bg,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardActionArea onClick={() => navigate(`/search?q=&mode=chemical&status=${cat.status}`)}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
                    <Box sx={{
                      width: 48, height: 48, borderRadius: '13px',
                      bgcolor: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {React.cloneElement(cat.icon, { sx: { fontSize: 24, color: cat.color } })}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ color: cat.color, fontSize: '1rem', lineHeight: 1.3 }}>
                        {cat.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cat.desc}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Weed tags */}
      <Box className="ftf-animate-in-delay-3">
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1.5 }}>
          Browse by Weed
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {weeds.map((weed) => (
            <Chip
              key={weed}
              label={weed}
              clickable
              onClick={() => navigate(`/search?q=${encodeURIComponent(weed)}&mode=weed`)}
              variant="outlined"
              sx={{
                borderColor: alpha(theme.palette.primary.main, 0.15),
                color: 'text.primary',
                fontWeight: 500,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  borderColor: theme.palette.primary.main,
                },
              }}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import OpacityIcon from '@mui/icons-material/Opacity';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SpeedIcon from '@mui/icons-material/Speed';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PublicIcon from '@mui/icons-material/Public';
import { WeedTreatment } from '../types/chemical';
import DroneStatusChip from './DroneStatusChip';

export default function ChemicalCard({ treatment }: { treatment: WeedTreatment }) {
  const navigate = useNavigate();
  const theme = useTheme();

  const isAPVMA = treatment.source === 'apvma-auto';

  return (
    <Card
      sx={{
        height: '100%',
        ...(isAPVMA && {
          border: `1.5px dashed ${alpha(theme.palette.primary.main, 0.15)}`,
          bgcolor: alpha(theme.palette.primary.main, 0.015),
        }),
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.2),
          transform: 'translateY(-2px)',
          '& .card-arrow': {
            opacity: 1,
            transform: 'translateX(0)',
          },
        },
      }}
    >
      <CardActionArea onClick={() => navigate(`/treatment/${treatment.id}`)} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 2.5 }}>
          {isAPVMA && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
              <PublicIcon sx={{ fontSize: 13, opacity: 0.4 }} />
              <Typography variant="caption" sx={{ opacity: 0.5, fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.04em' }}>
                APVMA Register — unverified for drone use
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
            <Typography variant="h6" component="h3" sx={{ lineHeight: 1.25, fontSize: '1.05rem' }}>
              {isAPVMA ? treatment.brands : treatment.weed}
            </Typography>
            <DroneStatusChip status={treatment.droneStatus} />
          </Box>

          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.25 }}>
            {treatment.brands}
          </Typography>
          <Typography variant="caption" sx={{ color: alpha(theme.palette.text.secondary, 0.7), display: 'block', mb: 2 }}>
            {treatment.activeIngredient}
          </Typography>

          <Stack spacing={1}>
            {treatment.aerialRate !== '\u2014' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 28, height: 28, borderRadius: '7px',
                  bgcolor: alpha(theme.palette.primary.main, 0.07),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <FlightIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                </Box>
                <Typography variant="body2">
                  <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>{treatment.aerialRate}</Box>
                </Typography>
              </Box>
            )}
            {treatment.waterLHa !== '\u2014' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 28, height: 28, borderRadius: '7px',
                  bgcolor: alpha(theme.palette.secondary.main, 0.07),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <OpacityIcon sx={{ fontSize: 15, color: 'secondary.dark' }} />
                </Box>
                <Typography variant="body2">
                  <Box component="span" sx={{ fontWeight: 600 }}>{treatment.waterLHa}</Box> L/ha water
                </Typography>
              </Box>
            )}
            {treatment.droneParams && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 28, height: 28, borderRadius: '7px',
                  bgcolor: alpha('#5b7a3a', 0.08),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <SpeedIcon sx={{ fontSize: 15, color: '#5b7a3a' }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                  {treatment.droneParams.dropletSize}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 28, height: 28, borderRadius: '7px',
                bgcolor: alpha('#4cb85a', 0.1),
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <ScheduleIcon sx={{ fontSize: 15, color: '#2e9e3c' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                {treatment.bestTiming}
              </Typography>
            </Box>
          </Stack>

          {treatment.labelUrl && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5, opacity: 0.5 }}>
              <DescriptionIcon sx={{ fontSize: 12 }} />
              <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                Product label available
              </Typography>
            </Box>
          )}

          <Box className="card-arrow" sx={{
            display: 'flex', justifyContent: 'flex-end', mt: 1.5,
            opacity: 0, transform: 'translateX(-8px)', transition: 'all 0.2s ease',
          }}>
            <ArrowForwardIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

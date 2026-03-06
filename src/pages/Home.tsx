import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  alpha,
  useTheme,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import GrassIcon from '@mui/icons-material/Grass';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const tools = [
    {
      title: 'Weed & Chemical Database',
      description: 'Search aerial application rates, drone settings, tank mix recipes, and regulatory status for Australian weeds and chemicals.',
      icon: <GrassIcon />,
      color: theme.palette.primary.main,
      path: '/database',
      ready: true,
    },
    {
      title: 'Chemical & Batch Calculator',
      description: 'Calculate mix rates, batch volumes, and chemical quantities for your spray jobs. Coming soon.',
      icon: <CalculateIcon />,
      color: theme.palette.secondary.main,
      path: '/calculator',
      ready: false,
    },
  ];

  return (
    <Box>
      {/* Hero */}
      <Box
        className="ftf-animate-in"
        sx={{
          textAlign: 'center',
          mb: 6,
          mt: { xs: 2, md: 5 },
        }}
      >
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 1,
          bgcolor: alpha(theme.palette.primary.main, 0.06),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: '20px', px: 2, py: 0.5, mb: 3,
        }}>
          <FlightTakeoffIcon sx={{ fontSize: 14, color: 'primary.main' }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '0.04em' }}>
            Drone Pilot Tools
          </Typography>
        </Box>

        <Typography
          variant="h3"
          sx={{
            color: 'primary.dark',
            mb: 1.5,
            fontSize: { xs: '1.75rem', md: '2.5rem' },
            fontWeight: 800,
          }}
        >
          G'day{user?.name ? `, ${user.name}` : ''}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 1, maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}
        >
          Your toolkit for aerial spraying in Australia. Choose a tool to get started.
        </Typography>
      </Box>

      {/* Tool cards */}
      <Box className="ftf-animate-in-delay-1" sx={{ maxWidth: 700, mx: 'auto' }}>
        <Grid container spacing={3}>
          {tools.map((tool) => (
            <Grid size={{ xs: 12, sm: 6 }} key={tool.title}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  border: `1.5px solid ${alpha(tool.color, 0.15)}`,
                  borderRadius: '16px',
                  position: 'relative',
                  overflow: 'visible',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: alpha(tool.color, 0.4),
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 32px ${alpha(tool.color, 0.12)}`,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(tool.path)}
                  sx={{ height: '100%', borderRadius: '16px' }}
                >
                  <CardContent sx={{ p: 3.5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2 }}>
                    <Box sx={{
                      width: 64, height: 64, borderRadius: '16px',
                      bgcolor: alpha(tool.color, 0.08),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {React.cloneElement(tool.icon, { sx: { fontSize: 32, color: tool.color } })}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ color: tool.color, fontWeight: 700, mb: 1, fontSize: '1.1rem' }}>
                        {tool.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {tool.description}
                      </Typography>
                    </Box>
                    {!tool.ready && (
                      <Box sx={{
                        px: 1.5, py: 0.25, borderRadius: '8px',
                        bgcolor: alpha(tool.color, 0.08),
                        border: `1px solid ${alpha(tool.color, 0.15)}`,
                      }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: tool.color, letterSpacing: '0.03em' }}>
                          Coming Soon
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

import React from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Divider,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import OpacityIcon from '@mui/icons-material/Opacity';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MergeIcon from '@mui/icons-material/Merge';
import { TankMixRecipe, WeedTreatment } from '../types/chemical';
import { getRecipesForWeed } from '../data/tankMixes';

interface Props {
  weed: string;
  results?: WeedTreatment[];
}

export default function TankMixRecommendations({ weed, results }: Props) {
  const theme = useTheme();

  // Try matching by query first, then by weed names found in search results
  let recipes = getRecipesForWeed(weed);
  if (recipes.length === 0 && results && results.length > 0) {
    const weedNames = Array.from(new Set(results.map((r) => r.weed)));
    for (const name of weedNames) {
      const found = getRecipesForWeed(name);
      if (found.length > 0) {
        recipes = found;
        break;
      }
    }
  }
  recipes = recipes.slice(0, 3);

  if (recipes.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }} className="ftf-animate-in-delay-1">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: '10px',
          bgcolor: alpha('#7b3fa0', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ScienceIcon sx={{ color: '#7b3fa0', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ lineHeight: 1.2 }}>
            Recommended Brew Recipes
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Common tank mixes for "{weed}" — ranked by effectiveness
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2.5} sx={{ mt: 1 }}>
        {recipes.map((recipe, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={recipe.id} className={`ftf-animate-in-delay-${index + 2}`}>
            <Card
              sx={{
                height: '100%',
                position: 'relative',
                overflow: 'visible',
                ...(index === 0 && {
                  border: `2px solid ${alpha('#7b3fa0', 0.25)}`,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -2,
                    borderRadius: '16px',
                    padding: '2px',
                    background: `linear-gradient(135deg, #7b3fa0, ${theme.palette.primary.main})`,
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
                  bgcolor: '#7b3fa0',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: '8px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  fontFamily: '"Outfit", system-ui, sans-serif',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  boxShadow: `0 4px 12px ${alpha('#7b3fa0', 0.3)}`,
                  whiteSpace: 'nowrap',
                }}>
                  Recommended
                </Box>
              )}
              <CardContent sx={{ pt: index === 0 ? 3.5 : 2.5, px: 2.5, pb: 2.5 }}>
                {/* Recipe name */}
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.25, lineHeight: 1.3 }}>
                  {recipe.name}
                </Typography>
                <Typography variant="caption" sx={{ color: alpha(theme.palette.text.secondary, 0.7), display: 'block', mb: 1.5, lineHeight: 1.4 }}>
                  {recipe.description}
                </Typography>

                {/* Drone compatible badge */}
                {recipe.droneCompatible && (
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5,
                    p: 1, borderRadius: '8px', bgcolor: alpha('#1b8a5a', 0.08),
                  }}>
                    <CheckCircleIcon sx={{ fontSize: 16, color: '#1b8a5a' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1b8a5a', fontSize: '0.75rem' }}>
                      Drone Compatible
                    </Typography>
                  </Box>
                )}

                {/* Chemical ingredients */}
                <Box sx={{
                  p: 1.5, borderRadius: '10px', mb: 1.5,
                  bgcolor: alpha('#7b3fa0', 0.04),
                  border: `1px solid ${alpha('#7b3fa0', 0.08)}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <MergeIcon sx={{ fontSize: 13, color: '#7b3fa0' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#7b3fa0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {recipe.chemicals.length > 1 ? 'Tank Mix' : 'Single Product'}
                    </Typography>
                  </Box>
                  <Stack spacing={0.75}>
                    {recipe.chemicals.map((chem, i) => (
                      <Box key={i}>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem', lineHeight: 1.3 }}>
                          {chem.product}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.3 }}>
                          {chem.activeIngredient} — <strong>{chem.rate}</strong>
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                {/* Application details */}
                <Stack spacing={0.75}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <OpacityIcon sx={{ fontSize: 14, color: 'secondary.dark' }} />
                    <Typography variant="caption"><strong>Water:</strong> {recipe.waterLHa} L/ha</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <SpeedIcon sx={{ fontSize: 14, color: '#5b7a3a' }} />
                    <Typography variant="caption"><strong>Droplet:</strong> {recipe.dropletSize}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <ScienceIcon sx={{ fontSize: 14, color: '#7b3fa0' }} />
                    <Typography variant="caption"><strong>Adjuvant:</strong> {recipe.adjuvant}</Typography>
                  </Box>
                </Stack>

                {/* Notes */}
                <Box sx={{
                  mt: 1.5, p: 1.25, borderRadius: '8px',
                  bgcolor: alpha(theme.palette.text.secondary, 0.04),
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: '0.7rem' }}>
                    {recipe.notes}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{
        mt: 2, p: 1.5, borderRadius: '8px',
        bgcolor: alpha('#7b3fa0', 0.04),
        border: `1px dashed ${alpha('#7b3fa0', 0.15)}`,
      }}>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
          <strong>Always read and follow product labels.</strong> Tank mix compatibility should be confirmed via jar test before large-scale application.
          Rates shown are general guides — check labels for your specific situation, crop, and state requirements.
        </Typography>
      </Box>
    </Box>
  );
}

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PublicIcon from '@mui/icons-material/Public';
import { APVMAProduct } from '../types/chemical';

const categoryColors: Record<string, string> = {
  HERBICIDE: '#1b8a5a',
  INSECTICIDE: '#c23b22',
  FUNGICIDE: '#7b3fa0',
  PLANT_GROWTH_REGULATOR: '#0a6166',
};

export default function APVMACard({ product }: { product: APVMAProduct }) {
  const theme = useTheme();
  const catColor = categoryColors[product.category] || '#4a6163';

  return (
    <Card
      sx={{
        border: `1.5px dashed ${alpha(theme.palette.primary.main, 0.15)}`,
        bgcolor: alpha(theme.palette.primary.main, 0.015),
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.25),
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PublicIcon sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.5 }} />
            <Typography variant="h6" component="h3" sx={{ lineHeight: 1.25, fontSize: '1.05rem' }}>
              {product.productName}
            </Typography>
          </Box>
          <Chip
            label={(product.category || 'N/A').replace(/_/g, ' ')}
            size="small"
            sx={{
              bgcolor: alpha(catColor, 0.1),
              color: catColor,
              fontWeight: 700,
              fontSize: '0.68rem',
              textTransform: 'capitalize',
              border: `1px solid ${alpha(catColor, 0.15)}`,
            }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {product.registrant}
        </Typography>

        <Stack spacing={0.75} sx={{ mb: 2 }}>
          {[
            ['APVMA No', product.apvmaNumber],
            ['Formulation', product.formulation],
            ['Schedule', product.poisonSchedule],
            ['Status', product.registrationStatus],
            ['Registered', product.registrationDate],
            ...(product.expiryDate !== '\u2014' ? [['Expires', product.expiryDate]] : []),
          ].map(([label, value]) => (
            <Box key={label} sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 80 }}>
                {label}
              </Typography>
              <Typography variant="caption">{value}</Typography>
            </Box>
          ))}
        </Stack>

        <Box sx={{
          display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.5,
          bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: '10px',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.06)}`,
        }}>
          <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.25, opacity: 0.5 }} />
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            Source: APVMA PubCRIS Register &mdash; drone-specific settings not available.
            Always check the product label for aerial application permissions.
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ display: 'block', mt: 1.5, opacity: 0.4, fontSize: '0.65rem' }}>
          APVMA PubCRIS &mdash; CC BY 3.0 AU
        </Typography>
      </CardContent>
    </Card>
  );
}

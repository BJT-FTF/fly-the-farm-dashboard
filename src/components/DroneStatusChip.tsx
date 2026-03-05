import React from 'react';
import { Chip, alpha } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CancelIcon from '@mui/icons-material/Cancel';
import { DroneStatus } from '../types/chemical';

const statusConfig: Record<DroneStatus, { label: string; color: string; bgColor: string; Icon: typeof CheckCircleIcon }> = {
  permitted: {
    label: 'Drone Permitted',
    color: '#146b45',
    bgColor: '#e8f5ed',
    Icon: CheckCircleIcon,
  },
  'permitted-helicopter-caution': {
    label: 'Permitted (Caution)',
    color: '#a86a08',
    bgColor: '#fef3e0',
    Icon: WarningIcon,
  },
  'permitted-granular': {
    label: 'Granular Aerial',
    color: '#146b45',
    bgColor: '#e8f5ed',
    Icon: CheckCircleIcon,
  },
  'permitted-fallow-only': {
    label: 'Fallow Only',
    color: '#a86a08',
    bgColor: '#fef3e0',
    Icon: WarningIcon,
  },
  'not-permitted': {
    label: 'Not Permitted',
    color: '#962d1a',
    bgColor: '#fde8e4',
    Icon: CancelIcon,
  },
  'not-permitted-aquatic': {
    label: 'Not Permitted',
    color: '#962d1a',
    bgColor: '#fde8e4',
    Icon: CancelIcon,
  },
};

export default function DroneStatusChip({ status }: { status: DroneStatus }) {
  const config = statusConfig[status];
  const IconComp = config.Icon;
  return (
    <Chip
      icon={<IconComp sx={{ fontSize: 16, color: `${config.color} !important` }} />}
      label={config.label}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: '0.75rem',
        bgcolor: config.bgColor,
        color: config.color,
        border: `1px solid ${alpha(config.color, 0.15)}`,
        '& .MuiChip-icon': {
          color: config.color,
        },
      }}
    />
  );
}

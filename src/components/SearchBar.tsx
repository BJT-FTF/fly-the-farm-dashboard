import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  InputBase,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  alpha,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ScienceIcon from '@mui/icons-material/Science';
import GrassIcon from '@mui/icons-material/Grass';

interface SearchBarProps {
  initialQuery?: string;
  initialMode?: 'chemical' | 'weed';
}

export default function SearchBar({ initialQuery = '', initialMode = 'chemical' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState<'chemical' | 'weed'>(initialMode);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}&mode=${mode}`);
    }
  };

  return (
    <Box>
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(_, v) => v && setMode(v)}
        size="small"
        sx={{ mb: 1.5 }}
      >
        <ToggleButton value="chemical" sx={{ gap: 0.75 }}>
          <ScienceIcon sx={{ fontSize: 17 }} />
          Chemical / Brand
        </ToggleButton>
        <ToggleButton value="weed" sx={{ gap: 0.75 }}>
          <GrassIcon sx={{ fontSize: 17 }} />
          Weed / Pest
        </ToggleButton>
      </ToggleButtonGroup>
      <Paper
        component="form"
        onSubmit={handleSearch}
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2.5,
          py: 0.75,
          borderRadius: '14px',
          border: `2px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          bgcolor: 'white',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:focus-within': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.08)}, 0 4px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
          },
        }}
      >
        <SearchIcon sx={{ color: 'text.secondary', mr: 1.5, fontSize: 22 }} />
        <InputBase
          placeholder={mode === 'chemical' ? 'Search chemical name or active ingredient...' : 'Search weed or pest name...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{
            flex: 1,
            fontSize: '1.05rem',
            py: 1,
            fontFamily: '"Source Sans 3", system-ui, sans-serif',
            '& input::placeholder': {
              color: alpha(theme.palette.text.primary, 0.35),
              opacity: 1,
            },
          }}
          autoFocus
        />
        <IconButton
          type="submit"
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            width: 40,
            height: 40,
            borderRadius: '10px',
            '&:hover': {
              bgcolor: 'primary.light',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <SearchIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Paper>
    </Box>
  );
}

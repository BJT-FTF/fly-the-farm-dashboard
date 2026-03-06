import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Typography,
  Box,
  Grid,
  Alert,
  Divider,
  CircularProgress,
  Chip,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SearchBar from '../components/SearchBar';
import ChemicalCard from '../components/ChemicalCard';
import APVMACard from '../components/APVMACard';
import WeedRecommendations from '../components/WeedRecommendations';
import TankMixRecommendations from '../components/TankMixRecommendations';
import { useSearch } from '../hooks/useSearch';
import { getSeasonsForTreatment, getStatesForTreatment } from '../data/chemicals';
import { AustralianState, Season, ALL_STATES, ALL_SEASONS } from '../types/chemical';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const mode = (searchParams.get('mode') || 'chemical') as 'chemical' | 'weed';
  const theme = useTheme();

  const [stateFilter, setStateFilter] = useState<AustralianState | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<Season | null>(null);

  const { localResults, apvmaResults, apvmaLoading, apvmaError } = useSearch(query, mode);

  const filteredResults = useMemo(() => {
    let results = localResults;
    if (stateFilter) {
      results = results.filter((t) => getStatesForTreatment(t).includes(stateFilter));
    }
    if (seasonFilter) {
      results = results.filter((t) => getSeasonsForTreatment(t).includes(seasonFilter));
    }
    return results;
  }, [localResults, stateFilter, seasonFilter]);

  return (
    <Box>
      <Box sx={{ maxWidth: 580, mx: 'auto', mb: 4 }} className="ftf-animate-in">
        <SearchBar initialQuery={query} initialMode={mode} />
      </Box>

      {query && (
        <Box className="ftf-animate-in-delay-1" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{filteredResults.length}</Box>
              {filteredResults.length !== localResults.length && (
                <Box component="span" sx={{ color: 'text.secondary' }}> of {localResults.length}</Box>
              )}
              {' '}result{filteredResults.length !== 1 ? 's' : ''} for
            </Typography>
            <Chip
              label={`"${query}"`}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                color: 'primary.main',
              }}
            />
            <Chip
              label={mode === 'weed' ? 'Weed search' : 'Chemical search'}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>

          {/* State & Season Filters */}
          {localResults.length > 0 && (
            <Box sx={{
              p: 2, borderRadius: '12px',
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            }}>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {/* State filter */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <PlaceIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      State
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    <Chip
                      label="All"
                      size="small"
                      variant={stateFilter === null ? 'filled' : 'outlined'}
                      onClick={() => setStateFilter(null)}
                      sx={{
                        fontWeight: 600, fontSize: '0.7rem',
                        ...(stateFilter === null && {
                          bgcolor: 'primary.main', color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' },
                        }),
                      }}
                    />
                    {ALL_STATES.map((s) => (
                      <Chip
                        key={s}
                        label={s}
                        size="small"
                        variant={stateFilter === s ? 'filled' : 'outlined'}
                        onClick={() => setStateFilter(stateFilter === s ? null : s)}
                        sx={{
                          fontWeight: 600, fontSize: '0.7rem',
                          ...(stateFilter === s && {
                            bgcolor: 'primary.main', color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' },
                          }),
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Season filter */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <CalendarMonthIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      Season
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    <Chip
                      label="All"
                      size="small"
                      variant={seasonFilter === null ? 'filled' : 'outlined'}
                      onClick={() => setSeasonFilter(null)}
                      sx={{
                        fontWeight: 600, fontSize: '0.7rem',
                        ...(seasonFilter === null && {
                          bgcolor: 'secondary.main', color: 'white',
                          '&:hover': { bgcolor: 'secondary.dark' },
                        }),
                      }}
                    />
                    {ALL_SEASONS.map((s) => (
                      <Chip
                        key={s}
                        label={s}
                        size="small"
                        variant={seasonFilter === s ? 'filled' : 'outlined'}
                        onClick={() => setSeasonFilter(seasonFilter === s ? null : s)}
                        sx={{
                          fontWeight: 600, fontSize: '0.7rem',
                          ...(seasonFilter === s && {
                            bgcolor: 'secondary.main', color: 'white',
                            '&:hover': { bgcolor: 'secondary.dark' },
                          }),
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {query && filteredResults.length === 0 && localResults.length === 0 && !apvmaLoading && apvmaResults.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }} className="ftf-animate-in-delay-1">
          No results found for "{query}" in our curated database or the APVMA register.
          This weed or chemical may not be registered in Australia or may use a different name.
        </Alert>
      )}

      {query && filteredResults.length === 0 && localResults.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }} className="ftf-animate-in-delay-1">
          No treatments match your current filters. Try adjusting state or season.
        </Alert>
      )}

      {/* Weed mode: show top 3 recommendations, brew recipes, then remaining */}
      {mode === 'weed' && filteredResults.length > 0 && (
        <>
          <WeedRecommendations query={query} treatments={filteredResults} />
          <TankMixRecommendations weed={query} results={filteredResults} />
          {filteredResults.length > 3 && (
            <>
              <Divider sx={{ my: 4 }} />
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
                All Matching Treatments
              </Typography>
              <Grid container spacing={2}>
                {filteredResults.slice(3).map((t) => (
                  <Grid size={{ xs: 12, md: 6 }} key={t.id}>
                    <ChemicalCard treatment={t} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      )}

      {/* Chemical mode: show standard card list + brew recipes */}
      {mode === 'chemical' && filteredResults.length > 0 && (
        <>
          <Grid container spacing={2} className="ftf-animate-in-delay-1" sx={{ mb: 3 }}>
            {filteredResults.map((t) => (
              <Grid size={{ xs: 12, md: 6 }} key={t.id}>
                <ChemicalCard treatment={t} />
              </Grid>
            ))}
          </Grid>
          <TankMixRecommendations weed={query} results={filteredResults} />
        </>
      )}

      {/* APVMA Fallback Results */}
      {apvmaLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 4 }}>
          <CircularProgress size={20} sx={{ color: 'primary.main' }} />
          <Typography variant="body2" color="text.secondary">
            Searching APVMA register...
          </Typography>
        </Box>
      )}

      {apvmaError && (
        <Alert severity="warning" sx={{ my: 3 }}>
          Could not reach the APVMA register: {apvmaError}
        </Alert>
      )}

      {apvmaResults.length > 0 && (
        <Box className="ftf-animate-in-delay-2">
          <Divider sx={{ my: 4 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px',
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PublicIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ lineHeight: 1.2 }}>APVMA Register Results</Typography>
              <Typography variant="caption" color="text.secondary">
                {apvmaResults.length} registered product{apvmaResults.length !== 1 ? 's' : ''} from PubCRIS
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, mt: 1 }}>
            Official APVMA registrations &mdash; drone-specific application data is not available from this source.
          </Typography>
          <Grid container spacing={2}>
            {apvmaResults.map((product) => (
              <Grid size={{ xs: 12, md: 6 }} key={product.id}>
                <APVMACard product={product} />
              </Grid>
            ))}
          </Grid>
          <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.4, fontSize: '0.65rem' }}>
            Data sourced from APVMA PubCRIS &mdash; Licensed under Creative Commons Attribution 3.0 Australia
          </Typography>
        </Box>
      )}
    </Box>
  );
}

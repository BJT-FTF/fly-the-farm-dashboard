import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  TextField,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Typography,
  CircularProgress,
  alpha,
  useTheme,
  InputAdornment,
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import SearchIcon from '@mui/icons-material/Search';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AustralianState } from '../types/chemical';

// Fix Leaflet default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Types ──────────────────────────────────────────────────

export interface AddressResult {
  address: string;
  locality: string;
  state: AustralianState;
  postcode: string;
  lat: number;
  lng: number;
  displayName: string;
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    housenumber?: string;
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    osm_value?: string;
    type?: string;
  };
}

interface Props {
  onSelect: (result: AddressResult) => void;
  initialValue?: string;
  label?: string;
  size?: 'small' | 'medium';
  showMap?: boolean;
  mapHeight?: number;
  lat?: number;
  lng?: number;
}

// ─── State Mapping ──────────────────────────────────────────

const STATE_MAP: Record<string, AustralianState> = {
  'new south wales': 'NSW',
  'nsw': 'NSW',
  'queensland': 'QLD',
  'qld': 'QLD',
  'victoria': 'VIC',
  'vic': 'VIC',
  'south australia': 'SA',
  'sa': 'SA',
  'western australia': 'WA',
  'wa': 'WA',
  'tasmania': 'TAS',
  'tas': 'TAS',
  'northern territory': 'NT',
  'nt': 'NT',
  'australian capital territory': 'ACT',
  'act': 'ACT',
};

function mapState(raw: string): AustralianState {
  return STATE_MAP[raw.toLowerCase()] || 'NSW';
}

// ─── Map Recenter Component ─────────────────────────────────

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14, { animate: true });
  }, [map, lat, lng]);
  return null;
}

// ─── Component ──────────────────────────────────────────────

export default function AddressAutocomplete({
  onSelect,
  initialValue = '',
  label = 'Search Address',
  size = 'small',
  showMap = true,
  mapHeight = 220,
  lat,
  lng,
}: Props) {
  const theme = useTheme();
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update map center when external lat/lng props change
  useEffect(() => {
    if (lat && lng) {
      setMapCenter({ lat, lng });
    }
  }, [lat, lng]);

  const searchAddress = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      // Strip unit/lot prefixes that break Photon (e.g. "7/1", "Unit 3/", "Lot 5")
      // We'll re-attach them to results afterwards
      const unitMatch = q.match(/^(\d+[a-zA-Z]?\s*\/\s*\d+[a-zA-Z]?|[Uu]nit\s+\d+[a-zA-Z]?\s*\/?\s*\d*|[Ll]ot\s+\d+[a-zA-Z]?|[Ss]uite\s+\d+[a-zA-Z]?)\s*,?\s*/);
      const unitPrefix = unitMatch ? unitMatch[1].trim() : '';
      const cleanQuery = unitMatch ? q.substring(unitMatch[0].length) : q;

      const params = new URLSearchParams({
        q: (cleanQuery || q) + ', Australia',
        limit: '8',
        lat: '-25.0',
        lon: '134.0',
        lang: 'en',
      });
      const resp = await fetch(`https://photon.komoot.io/api/?${params}`);
      const data = await resp.json();
      const features: PhotonFeature[] = data.features || [];

      // Strict filter: must be in Australia (country match + coordinate bounds)
      const AU_BOUNDS = { latMin: -44, latMax: -10, lngMin: 112, lngMax: 154 };
      const mapped: AddressResult[] = features
        .filter((f) => {
          const [fLng, fLat] = f.geometry.coordinates;
          const country = (f.properties.country || '').toLowerCase();
          const inBounds = fLat >= AU_BOUNDS.latMin && fLat <= AU_BOUNDS.latMax
            && fLng >= AU_BOUNDS.lngMin && fLng <= AU_BOUNDS.lngMax;
          return (country === 'australia' || country === 'au') && inBounds;
        })
        .map((f) => {
          const p = f.properties;
          const [lng, lat] = f.geometry.coordinates;
          const streetParts: string[] = [];
          if (p.housenumber) streetParts.push(p.housenumber);
          if (p.street) streetParts.push(p.street);
          let street = streetParts.join(' ') || p.name || '';

          // Re-attach the user's unit/lot number that we stripped for the API call
          if (unitPrefix && !street.toLowerCase().startsWith(unitPrefix.toLowerCase())) {
            street = `${unitPrefix} ${street}`;
          }

          const locality = p.city || p.name || '';
          const state = mapState(p.state || '');
          const postcode = p.postcode || '';

          const displayParts = [street, locality, state, postcode].filter(Boolean);

          return {
            address: street,
            locality,
            state,
            postcode,
            lat,
            lng,
            displayName: displayParts.join(', '),
          };
        });

      const limited = mapped.slice(0, 5);
      setResults(limited);
      setOpen(limited.length > 0);
    } catch (err) {
      console.error('Address search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => searchAddress(val), 350);
  };

  const handleSelect = (result: AddressResult) => {
    setQuery(result.displayName);
    setMapCenter({ lat: result.lat, lng: result.lng });
    setOpen(false);
    setResults([]);
    onSelect(result);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <Box ref={containerRef}>
      <Box sx={{ position: 'relative' }}>
        <TextField
          label={label}
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          size={size}
          fullWidth
          placeholder="Start typing an address..."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: loading ? (
                <InputAdornment position="end">
                  <CircularProgress size={18} />
                </InputAdornment>
              ) : undefined,
            },
          }}
        />

        {open && results.length > 0 && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1300,
              mt: 0.5,
              borderRadius: '12px',
              maxHeight: 280,
              overflow: 'auto',
            }}
          >
            <List dense disablePadding>
              {results.map((r, idx) => (
                <ListItemButton
                  key={idx}
                  onClick={() => handleSelect(r)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PlaceIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {r.address || r.locality}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {[r.locality, r.state, r.postcode].filter(Boolean).join(', ')}
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {/* Map Display */}
      {showMap && mapCenter && (
        <Box
          sx={{
            mt: 1.5,
            borderRadius: '12px',
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            height: mapHeight,
            '& .leaflet-container': { height: '100%', width: '100%', borderRadius: '12px' },
          }}
        >
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[mapCenter.lat, mapCenter.lng]} />
            <MapRecenter lat={mapCenter.lat} lng={mapCenter.lng} />
          </MapContainer>
        </Box>
      )}
    </Box>
  );
}

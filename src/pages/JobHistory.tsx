import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  Chip,
  MenuItem,
  alpha,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScienceIcon from '@mui/icons-material/Science';
import BugReportIcon from '@mui/icons-material/BugReport';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import GrassIcon from '@mui/icons-material/Grass';
import StarIcon from '@mui/icons-material/Star';
import AssignmentIcon from '@mui/icons-material/Assignment';
import {
  getJobs,
  getClients,
  getProperties,
  getFields,
  getOutcomeByJob,
} from '../services/fieldManagementStore';

export default function JobHistory() {
  const navigate = useNavigate();
  const theme = useTheme();

  const allJobs = useMemo(() => getJobs().sort((a, b) => b.dateSprayed.localeCompare(a.dateSprayed)), []);
  const allClients = useMemo(() => getClients(), []);
  const allProperties = useMemo(() => getProperties(), []);
  const allFields = useMemo(() => getFields(), []);

  const clientMap = useMemo(() => new Map(allClients.map((c) => [c.id, c])), [allClients]);
  const propertyMap = useMemo(() => new Map(allProperties.map((p) => [p.id, p])), [allProperties]);
  const fieldMap = useMemo(() => new Map(allFields.map((f) => [f.id, f])), [allFields]);

  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'recorded' | 'pending' | 'follow-up'>('all');

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const client = clientMap.get(job.clientId);
        const property = propertyMap.get(job.propertyId);
        const field = fieldMap.get(job.fieldId);
        const chemNames = job.chemicals?.map((c) => c.product).join(' ') || job.chemicalUsed || '';
        const searchable = [
          job.weedTarget, chemNames, client?.name, property?.name, field?.name, job.applicatorName,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      // Client filter
      if (clientFilter && job.clientId !== clientFilter) return false;

      // Outcome filter
      if (outcomeFilter !== 'all') {
        const outcome = getOutcomeByJob(job.id);
        if (outcomeFilter === 'recorded' && !outcome) return false;
        if (outcomeFilter === 'pending' && outcome) return false;
        if (outcomeFilter === 'follow-up') {
          if (!outcome || !outcome.followUpRequired) return false;
        }
      }

      return true;
    });
  }, [allJobs, search, clientFilter, outcomeFilter, clientMap, propertyMap, fieldMap]);

  const getEfficacyColor = (rating: number) => {
    if (rating >= 4) return { bg: alpha('#4caf50', 0.1), color: '#2e7d32' };
    if (rating >= 3) return { bg: alpha('#ff9800', 0.1), color: '#e65100' };
    return { bg: alpha('#f44336', 0.1), color: '#c62828' };
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/jobs')}
        sx={{ mb: 3, color: 'text.secondary', fontWeight: 600, '&:hover': { color: 'primary.main' } }}
      >
        All Clients
      </Button>

      <Box className="ftf-animate-in" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.dark', fontSize: { xs: '1.5rem', md: '2rem' }, mb: 0.5 }}>
          Job History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {allJobs.length} job{allJobs.length !== 1 ? 's' : ''} across all clients
        </Typography>
      </Box>

      {/* Filters */}
      <Box className="ftf-animate-in-delay-1" sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ maxWidth: 300 }}
          />
          <TextField
            select
            label="Client"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All Clients</MenuItem>
            {allClients.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField
            select
            label="Outcome"
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value as any)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="recorded">Outcome Recorded</MenuItem>
            <MenuItem value="pending">Outcome Pending</MenuItem>
            <MenuItem value="follow-up">Follow-up Required</MenuItem>
          </TextField>
        </Stack>

        {filteredJobs.length !== allJobs.length && (
          <Typography variant="caption" color="text.secondary">
            Showing {filteredJobs.length} of {allJobs.length} jobs
          </Typography>
        )}
      </Box>

      {/* Jobs list */}
      {filteredJobs.length === 0 ? (
        <Card elevation={0} sx={{ border: `1.5px dashed ${alpha(theme.palette.primary.main, 0.15)}`, borderRadius: '14px' }}>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <AssignmentIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.secondary, 0.3), mb: 1.5 }} />
            <Typography variant="body2" color="text.secondary">
              {allJobs.length === 0 ? 'No spray jobs recorded yet.' : 'No jobs match your filters.'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2} className="ftf-animate-in-delay-1">
          {filteredJobs.map((job) => {
            const client = clientMap.get(job.clientId);
            const property = propertyMap.get(job.propertyId);
            const field = fieldMap.get(job.fieldId);
            const outcome = getOutcomeByJob(job.id);
            const chemDisplay = job.chemicals?.length > 0
              ? job.chemicals.map((c) => c.product).filter(Boolean).join(', ')
              : job.chemicalUsed || '';

            return (
              <Card
                key={job.id}
                elevation={0}
                sx={{
                  border: `1.5px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderRadius: '14px',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    transform: 'translateY(-1px)',
                  },
                }}
                onClick={() => navigate(`/jobs/client/${job.clientId}/property/${job.propertyId}/field/${job.fieldId}/job/${job.id}`)}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                        <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="subtitle2" fontWeight={700}>
                          {new Date(job.dateSprayed).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Typography>
                      </Stack>

                      {/* Location breadcrumb */}
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: 'wrap' }} useFlexGap>
                        {client && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <PersonIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                            <Typography variant="caption" color="text.secondary">{client.name}</Typography>
                          </Box>
                        )}
                        {property && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <BusinessIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                            <Typography variant="caption" color="text.secondary">{property.name}</Typography>
                          </Box>
                        )}
                        {field && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <GrassIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                            <Typography variant="caption" color="text.secondary">{field.name}</Typography>
                          </Box>
                        )}
                      </Stack>

                      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BugReportIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">{job.weedTarget || 'No target'}</Typography>
                        </Box>
                        {chemDisplay && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ScienceIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {chemDisplay.length > 50 ? chemDisplay.slice(0, 50) + '...' : chemDisplay}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 1 }}>
                      {outcome ? (
                        <Chip
                          icon={<StarIcon sx={{ fontSize: 14 }} />}
                          label={`${outcome.efficacyRating}/5`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: getEfficacyColor(outcome.efficacyRating).bg,
                            color: getEfficacyColor(outcome.efficacyRating).color,
                          }}
                        />
                      ) : (
                        <Chip label="Pending" size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                      )}
                      {outcome?.followUpRequired && (
                        <Chip label="Follow-up" size="small" color="error" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                      )}
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

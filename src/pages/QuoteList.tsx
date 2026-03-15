import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Button,
  Stack,
  Chip,
  Alert,
  alpha,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getQuotes, getQuoteConfig } from '../services/quoteStore';
import { getClients } from '../services/fieldManagementStore';
import { Quote, QuoteStatus } from '../types/quote';
import { formatCurrency } from '../utils/quoteCalculator';
import { useAuth } from '../contexts/AuthContext';

const STATUS_COLORS: Record<QuoteStatus, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  draft: 'default',
  sent: 'info',
  accepted: 'success',
  declined: 'error',
  expired: 'warning',
  invoiced: 'success',
};

export default function QuoteList() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const userId = user?.id || '';

  const quotes = useMemo(() => getQuotes(userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [userId]);
  const clients = useMemo(() => getClients(), []);
  const config = useMemo(() => getQuoteConfig(userId), [userId]);

  const getClientName = (clientId: string) =>
    clients.find((c) => c.id === clientId)?.name || 'Unknown Client';

  const totalDraft = quotes.filter((q) => q.status === 'draft').length;
  const totalSent = quotes.filter((q) => q.status === 'sent').length;
  const totalAccepted = quotes.filter((q) => q.status === 'accepted').length;
  const totalValue = quotes
    .filter((q) => q.status === 'accepted' || q.status === 'invoiced')
    .reduce((s, q) => s + q.total, 0);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Quotes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Build and manage quotes for your drone spray services.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => navigate('/quotes/settings')}
            sx={{ borderRadius: '10px', fontWeight: 700 }}
          >
            Settings
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/quotes/new')}
            sx={{ borderRadius: '10px', px: 3, fontWeight: 700 }}
          >
            New Quote
          </Button>
        </Stack>
      </Stack>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Draft', value: totalDraft, color: theme.palette.grey[600] },
          { label: 'Sent', value: totalSent, color: theme.palette.info.main },
          { label: 'Accepted', value: totalAccepted, color: theme.palette.success.main },
          { label: 'Won Value', value: formatCurrency(totalValue), color: theme.palette.primary.main },
        ].map((s) => (
          <Grid key={s.label} size={{ xs: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>
                  {s.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {s.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {!config && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Set up your default rates and business details in{' '}
          <Button size="small" onClick={() => navigate('/quotes/settings')}>
            Quote Settings
          </Button>{' '}
          to speed up quote creation.
        </Alert>
      )}

      {/* Quote Cards */}
      {quotes.length === 0 ? (
        <Card sx={{ borderRadius: 3, textAlign: 'center', py: 6 }}>
          <CardContent>
            <ReceiptLongIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No quotes yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first quote to get started.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/quotes/new')}
            >
              New Quote
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {quotes.map((q) => (
            <Card key={q.id} sx={{ borderRadius: 3 }}>
              <CardActionArea onClick={() => navigate(`/quotes/${q.id}`)} sx={{ p: 0 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={700}>
                          {q.quoteNumber}
                        </Typography>
                        <Chip
                          label={q.status}
                          size="small"
                          color={STATUS_COLORS[q.status]}
                          sx={{ fontWeight: 700, textTransform: 'capitalize' }}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {getClientName(q.clientId)}
                        {q.jobDescription ? ` — ${q.jobDescription}` : ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created {new Date(q.createdAt).toLocaleDateString('en-AU')}
                        {q.estimatedDate ? ` · Spray date: ${q.estimatedDate}` : ''}
                      </Typography>
                    </Stack>
                    <Stack alignItems="flex-end" spacing={0.5}>
                      <Typography variant="h6" fontWeight={800} color="primary">
                        {formatCurrency(q.total)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {q.lineItems.length} item{q.lineItems.length !== 1 ? 's' : ''}
                      </Typography>
                      <ArrowForwardIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                    </Stack>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}


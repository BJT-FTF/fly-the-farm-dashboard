import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
  useTheme,
  type Theme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { getActuals, getFinancialsSummary } from '../services/financialsStore';
import { getClientById } from '../services/fieldManagementStore';
import { formatCurrency } from '../utils/quoteCalculator';
import { useAuth } from '../contexts/AuthContext';

function getMarginColor(margin: number, theme: Theme) {
  if (margin >= 40) return theme.palette.success.main;
  if (margin >= 20) return theme.palette.warning.main;
  return theme.palette.error.main;
}

function getMarginChipColor(margin: number): 'success' | 'warning' | 'error' {
  if (margin >= 40) return 'success';
  if (margin >= 20) return 'warning';
  return 'error';
}

export default function FinancialsList() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const userId = user?.id || '';

  const summary = useMemo(() => getFinancialsSummary(userId), [userId]);

  const actuals = useMemo(
    () =>
      getActuals(userId).sort(
        (a, b) => b.startDate.localeCompare(a.startDate),
      ),
    [userId],
  );

  const getClientName = (clientId?: string) => {
    if (!clientId) return '—';
    const client = getClientById(clientId);
    return client?.name || 'Unknown Client';
  };

  const marginCardColor = getMarginColor(summary.avgMargin, theme);

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 3 }}
        className="ftf-animate-in"
      >
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Financials
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track job actuals, revenue and profitability.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/financials/new')}
          sx={{ borderRadius: '10px', px: 3, fontWeight: 700 }}
        >
          New Actual
        </Button>
      </Stack>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }} className="ftf-animate-in">
        {[
          {
            label: 'Total Revenue',
            value: formatCurrency(summary.totalRevenue),
            color: theme.palette.primary.main,
          },
          {
            label: 'Total Costs',
            value: formatCurrency(summary.totalCosts),
            color: theme.palette.grey[600],
          },
          {
            label: 'Total Profit',
            value: formatCurrency(summary.totalProfit),
            color: theme.palette.success.main,
          },
          {
            label: 'Avg Margin %',
            value: `${summary.avgMargin}%`,
            color: marginCardColor,
          },
        ].map((s) => (
          <Grid key={s.label} size={{ xs: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: '16px',
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ color: s.color }}
                >
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

      {/* Table or Empty State */}
      {actuals.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            borderRadius: '16px',
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            textAlign: 'center',
            py: 6,
          }}
          className="ftf-animate-in-delay-1"
        >
          <CardContent>
            <AccountBalanceIcon
              sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No job actuals recorded yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first job actual to start tracking profitability.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/financials/new')}
            >
              New Actual
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card
          elevation={0}
          sx={{
            borderRadius: '16px',
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          }}
          className="ftf-animate-in-delay-1"
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Revenue
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Total Cost
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Margin %
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actuals.map((actual) => (
                  <TableRow
                    key={actual.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/financials/${actual.id}`)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {actual.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getClientName(actual.clientId)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(actual.startDate + 'T00:00:00').toLocaleDateString('en-AU')}
                        {actual.startDate !== actual.endDate && (
                          <> &ndash; {new Date(actual.endDate + 'T00:00:00').toLocaleDateString('en-AU')}</>
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrency(actual.revenue)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrency(actual.totalCost)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${actual.grossMarginPercent.toFixed(1)}%`}
                        size="small"
                        color={getMarginChipColor(actual.grossMarginPercent)}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={actual.status}
                        size="small"
                        color={
                          actual.status === 'finalised' ? 'success' : 'default'
                        }
                        sx={{ fontWeight: 700, textTransform: 'capitalize' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}

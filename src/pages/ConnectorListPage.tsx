// ---------------------------------------
// src/pages/ConnectorListPage.tsx
// ---------------------------------------
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useHost } from '../context/HostContext';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  Button,
  CircularProgress,
  TextField,
  InputLabel,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ConnectorTable from '../components/ConnectorTable';
import SummaryBar from '../components/SummaryBar';
import { fetchWithTimeout } from '../utils/api';

export type ConnectorInfo = {
  name: string;
  status: string;
  tasks: any[];
  type: string;
};

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Running', value: 'RUNNING' },
  { label: 'Paused', value: 'PAUSED' },
  { label: 'Failed', value: 'FAILED' },
];

const ConnectorListPage: React.FC = () => {
  const { state } = useHost();
  const [connectors, setConnectors] = useState<ConnectorInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const isConnected = state.healthy && !!state.host;

  /** Fetch connectors list + status */
  const loadConnectors = useCallback(async () => {
    if (!isConnected) {
      setConnectors([]);
      return;
    }
    try {
      setLoading(true);
      const res = await fetchWithTimeout(`${state.host}/connectors`, {}, 5000);
      if (!res.ok) throw new Error('Failed to fetch connectors');
      const names: string[] = await res.json();
      const details = await Promise.all(
        names.map(async (name) => {
          const r = await fetchWithTimeout(`${state.host}/connectors/${name}/status`, {}, 5000);
          if (!r.ok) throw new Error('Status error');
          const d = await r.json();
          return {
            name,
            status: d.connector.state,
            tasks: d.tasks,
            type: d.type,
          } as ConnectorInfo;
        })
      );
      setConnectors(details);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [isConnected, state.host]);

  /** initial + host/health change */
  useEffect(() => {
    loadConnectors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.host, state.healthy]);

  /** manual refresh event (from TopBar -> Home) */
  useEffect(() => {
    const handler = () => loadConnectors();
    window.addEventListener('refresh-connectors', handler);
    return () => window.removeEventListener('refresh-connectors', handler);
  }, [loadConnectors]);

  /** Derived KPI + filtered list */
  const { running, failed, paused } = useMemo(() => {
    return connectors.reduce(
      (acc, c) => {
        if (c.status === 'RUNNING') acc.running += 1;
        else if (c.status === 'FAILED') acc.failed += 1;
        else if (c.status === 'PAUSED') acc.paused += 1;
        return acc;
      },
      { running: 0, failed: 0, paused: 0 }
    );
  }, [connectors]);

  const filtered = useMemo(() => {
    return connectors.filter((c) => {
      const matchStatus = statusFilter ? c.status === statusFilter : true;
      const matchName = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchName;
    });
  }, [connectors, searchTerm, statusFilter]);

  /** ----------------------------------------------------------- */
  return (
    <Box>
      {/* Page hero card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5">Connectors Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and manage Debezium connectors in real time.
          </Typography>
        </CardContent>
      </Card>

      {/* KPI Summary */}
      <SummaryBar running={running} failed={failed} paused={paused} />

      {/* Toolbar: search / filter / actions */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Search by name"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FormControl sx={{ minWidth: 160 }} size="small">
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            label="Status"
            value={statusFilter}
            onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="outlined" onClick={loadConnectors} disabled={!isConnected || loading}>
          Refresh
        </Button>
        <Button variant="contained" component={RouterLink} to="/create">
          Create Connector
        </Button>
      </Stack>

      {/* Connector table */}
      <Card>
        <CardContent>
          {!isConnected && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Disconnected: Debezium Connect REST server not reachable.
            </Alert>
          )}
          {loading && <CircularProgress size={24} sx={{ mt: 2 }} />}
          {isConnected && !loading && (
            <ConnectorTable connectors={filtered} onActionComplete={loadConnectors} />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ConnectorListPage;

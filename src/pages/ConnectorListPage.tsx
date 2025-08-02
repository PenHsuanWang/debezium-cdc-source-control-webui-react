// src/pages/ConnectorListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useHost } from '../context/HostContext';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  Button,
  CircularProgress,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ConnectorTable from '../components/ConnectorTable';
import { fetchWithTimeout } from '../utils/api';

type ConnectorInfo = {
  name: string;
  status: string;
  tasks: any[];
  type: string;
};

const ConnectorListPage: React.FC = () => {
  const { state } = useHost();
  const [connectors, setConnectors] = useState<ConnectorInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const isConnected = state.healthy && !!state.host;

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

  useEffect(() => {
    loadConnectors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.host, state.healthy]);

  useEffect(() => {
    const handler = () => loadConnectors();
    window.addEventListener('refresh-connectors', handler);
    return () => window.removeEventListener('refresh-connectors', handler);
  }, [loadConnectors]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Connectors Dashboard
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={loadConnectors}
          disabled={!isConnected || loading}
        >
          Refresh
        </Button>
        <Button variant="contained" component={RouterLink} to="/create">
          Create Connector
        </Button>
      </Box>

      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Disconnected: Debezium Connect REST server not reachable. No connector data to display.
        </Alert>
      )}

      <Card>
        <CardContent>
          {loading ? (
            <CircularProgress size={24} sx={{ mt: 2 }} />
          ) : (
            <ConnectorTable connectors={connectors} onActionComplete={loadConnectors} />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ConnectorListPage;

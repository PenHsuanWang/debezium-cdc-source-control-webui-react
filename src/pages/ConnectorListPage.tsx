// src/pages/ConnectorListPage.tsx
import React from 'react';
import { useHost } from '../context/HostContext';
import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Box, Alert } from '@mui/material';

const ConnectorListPage: React.FC = () => {
  const { state } = useHost();

  // In a real app, you would fetch connector data, but for now, show empty if not connected.
  const isConnected = state.healthy && !!state.host;

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5">Connectors Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage all Debezium connectors.
          </Typography>
        </CardContent>
      </Card>

      {/* Table for Connectors */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Active Connectors
          </Typography>
          {!isConnected && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Disconnected: Debezium Connect REST server not reachable. No connector data to display.
            </Alert>
          )}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Tasks</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isConnected ? (
                // Map your connectors here
                <TableRow>
                  <TableCell colSpan={5}>Loading connectors...</TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No data. Please configure a host and ensure Debezium is running.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ConnectorListPage;

// src/components/TopBar.tsx
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { useHost } from '../context/HostContext';
import HealthPoller from './HealthPoller'; // <-- Fix here

const TopBar: React.FC = () => {
  const { state } = useHost();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Debezium UI ({state.host || 'No host selected'})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip
            label={state.healthy ? 'Healthy' : 'Disconnected'}
            color={state.healthy ? 'success' : 'error'}
            size="small"
          />
          <HealthPoller />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;

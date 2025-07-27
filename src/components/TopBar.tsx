// src/components/TopBar.tsx
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useHost } from '../context/HostContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import HealthPoller from './HealthPoller';

const TopBar: React.FC = () => {
  const { state } = useHost();
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
    window.dispatchEvent(new Event('refresh-connectors'));
  };
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
          <Button color="inherit" component={RouterLink} to="/host">
            Change Host
          </Button>
          <Button color="inherit" onClick={goHome}>
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/create">
            New Connector
          </Button>
          <HealthPoller />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;

// src/pages/HostPage.tsx
import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useHost } from '../context/HostContext';

const HostPage: React.FC = () => {
  const { state, dispatch } = useHost();
  const [host, setHost] = useState(state.host || 'http://localhost:8083');
  const navigate = useNavigate();

  const saveHost = () => {
    dispatch({ type: 'SET_HOST', payload: host });
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Configure Debezium Host</Typography>
      <TextField
        label="Debezium Connect URL"
        value={host}
        onChange={(e) => setHost(e.target.value)}
      />
      <Box>
        <Button variant="contained" onClick={saveHost}>
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default HostPage;

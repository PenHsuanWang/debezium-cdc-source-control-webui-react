// src/components/AlertSnackbar.tsx
import React from 'react';
import { Snackbar, Alert } from '@mui/material';

interface Props {
  message: string;
  onClose: () => void;
}

const AlertSnackbar: React.FC<Props> = ({ message, onClose }) => (
  <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={onClose}>
    <Alert severity={message.startsWith('Error') ? 'error' : 'success'} onClose={onClose}>
      {message}
    </Alert>
  </Snackbar>
);
export default AlertSnackbar;

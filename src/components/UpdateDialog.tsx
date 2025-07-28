import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box
} from '@mui/material';
import { useForm, FormProvider, Control } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useHost } from '../context/HostContext';
import { fetchWithTimeout } from '../utils/api';
import AlertSnackbar from './AlertSnackbar';
import ConnectorFormFields, { ConnectorFieldValues } from './ConnectorFormFields';

interface UpdateDialogProps {
  open: boolean;
  connector: string | null;
  onClose: () => void;
  onUpdated: () => void;
}

const schema = yup.object({
  name: yup.string(),
  host: yup.string().required('Host is required'),
  port: yup.string().required('Port is required').matches(/^\d+$/, 'Port must be a number'),
  username: yup.string().required('User is required'),
  password: yup.string().required('Password is required'),
  database: yup.string().required('Database name is required'),
});

const UpdateDialog: React.FC<UpdateDialogProps> = ({ open, connector, onClose, onUpdated }) => {
  const { state } = useHost();
  const methods = useForm<ConnectorFieldValues>({ resolver: yupResolver(schema) });
  const { control, reset, handleSubmit, formState } = methods;
  const [baseConfig, setBaseConfig] = useState<any | null>(null);
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !connector) return;
    const load = async () => {
      try {
        const res = await fetchWithTimeout(
          `${state.host}/connectors/${connector}/config`,
          {},
          5000
        );
        if (!res.ok) throw new Error('Failed to fetch config');
        const cfg = await res.json();
        setBaseConfig(cfg);
        reset({
          name: connector,
          host: cfg['database.hostname'] || '',
          port: String(cfg['database.port'] || ''),
          username: cfg['database.user'] || '',
          password: cfg['database.password'] || '',
          database: cfg['database.dbname'] || '',
        });
      } catch (e: any) {
        setSnackbarMsg('Error: ' + e.message);
      }
    };
    load();
  }, [open, connector, state.host, reset]);

  const handleUpdate = async (data: ConnectorFieldValues) => {
    if (!connector || !baseConfig) return;
    try {
      const newConfig = {
        ...baseConfig,
        'database.hostname': data.host,
        'database.port': Number(data.port),
        'database.user': data.username,
        'database.password': data.password,
        'database.dbname': data.database,
      };
      const res = await fetchWithTimeout(
        `${state.host}/connectors/${connector}/config`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newConfig),
        },
        5000
      );
      if (!res.ok) throw new Error('Update failed');
      setSnackbarMsg('Update succeeded');
      onUpdated();
      onClose();
    } catch (e: any) {
      setSnackbarMsg('Error: ' + e.message);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Update {connector}</DialogTitle>
        <FormProvider {...methods}>
          <Box component="form" onSubmit={handleSubmit(handleUpdate)}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <ConnectorFormFields control={control as unknown as Control<ConnectorFieldValues>} disableName />
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Cancel</Button>
              <Button variant="contained" type="submit" disabled={!formState.isValid}>Update</Button>
            </DialogActions>
          </Box>
        </FormProvider>
      </Dialog>
      {snackbarMsg && (
        <AlertSnackbar message={snackbarMsg} onClose={() => setSnackbarMsg(null)} />
      )}
    </>
  );
};

export default UpdateDialog;

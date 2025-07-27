// src/components/CreateWizard.tsx
import React, { useState } from 'react';
import {
  Stepper, Step, StepLabel, Button, Box, Typography, TextField, FormControl, MenuItem
} from '@mui/material';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useHost } from '../context/HostContext';
import AlertSnackbar from './AlertSnackbar';
import ConfigEditor from './ConfigEditor';
import connectorTemplates from '../templates';

type ConnectorForm = {
  type: string;
  name: string;
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
};

const connectorTypes = [
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sqlserver', label: 'SQL Server' },
  { value: 'cassandra', label: 'Cassandra' },
];

const schema = yup.object({
  type: yup.string().required('Type is required'),
  name: yup.string().required('Connector name is required'),
  host: yup.string().required('Host is required'),
  port: yup.string().required('Port is required').matches(/^\d+$/, 'Port must be a number'),
  username: yup.string().required('User is required'),
  password: yup.string().required('Password is required'),
  database: yup.string().required('Database name is required'),
});

const CreateWizard: React.FC = () => {
  const methods = useForm<ConnectorForm>({
    defaultValues: {
      type: '',
      name: '',
      host: '',
      port: '',
      username: '',
      password: '',
      database: ''
    },
    resolver: yupResolver(schema),
    mode: 'onChange'
  });
  const { handleSubmit, control, watch, getValues, formState } = methods;
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { state } = useHost();

  const type = watch('type');
  const steps = ['Connector Type', 'Properties', 'Review'];

  const onNext = () => setActiveStep((prev) => prev + 1);
  const onBack = () => setActiveStep((prev) => prev - 1);

  // Compose config
  const buildConfig = () => {
    const data = getValues();
    const configTemplate = connectorTemplates[data.type] || {};
    return {
      ...configTemplate,
      'database.hostname': data.host,
      'database.port': Number(data.port),
      'database.user': data.username,
      'database.password': data.password,
      'database.dbname': data.database,
      // Debezium 2.x uses topic.prefix instead of database.server.name
      'topic.prefix': data.name,
      // Provide a sensible default for internal history
      'schema.history.internal.kafka.bootstrap.servers':
        configTemplate['schema.history.internal.kafka.bootstrap.servers'] ||
        'kafka:9092',
      // (add or override more fields if necessary)
    };
  };

  const onSubmit = async () => {
    const data = getValues();
    const config = buildConfig();

    // Safety: ensure host is set
    if (!state.host) {
      setSnackbar('Please set the Debezium Connect host before creating a connector.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${state.host}/connectors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, config }),
      });
      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(errorBody || 'Failed to create connector');
      }
      setSnackbar('Connector created successfully');
      setTimeout(() => navigate('/'), 1000);
    } catch (err: any) {
      setSnackbar(`Failed to create connector: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <Box>
        <Stepper activeStep={activeStep} sx={{ marginBottom: 3 }}>
          {steps.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {/* Step 1: Type Selection */}
        {activeStep === 0 && (
          <FormControl fullWidth>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField select label="Connector Type" {...field} required>
                  {connectorTypes.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Box sx={{ mt: 2 }}>
              <Button onClick={onNext} disabled={!type}>Next</Button>
            </Box>
          </FormControl>
        )}

        {/* Step 2: Properties */}
        {activeStep === 1 && (
          <Box component="form" noValidate onSubmit={handleSubmit(onNext)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField label="Connector Name" {...field} error={!!fieldState.error} helperText={fieldState.error?.message} required />
              )}
            />
            <Controller
              name="host"
              control={control}
              render={({ field, fieldState }) => (
                <TextField label="Host" {...field} error={!!fieldState.error} helperText={fieldState.error?.message} required />
              )}
            />
            <Controller
              name="port"
              control={control}
              render={({ field, fieldState }) => (
                <TextField label="Port" type="number" {...field} error={!!fieldState.error} helperText={fieldState.error?.message} required />
              )}
            />
            <Controller
              name="username"
              control={control}
              render={({ field, fieldState }) => (
                <TextField label="User" {...field} error={!!fieldState.error} helperText={fieldState.error?.message} required />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <TextField label="Password" type="password" {...field} error={!!fieldState.error} helperText={fieldState.error?.message} required />
              )}
            />
            <Controller
              name="database"
              control={control}
              render={({ field, fieldState }) => (
                <TextField label="Database Name" {...field} error={!!fieldState.error} helperText={fieldState.error?.message} required />
              )}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={onBack}>Back</Button>
              <Button type="submit" variant="contained" disabled={!formState.isValid}>Next</Button>
            </Box>
          </Box>
        )}

        {/* Step 3: Review */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6">Review Configuration JSON</Typography>
            <ConfigEditor readOnly value={JSON.stringify({
              name: getValues('name'),
              config: buildConfig()
            }, null, 2)} />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={onBack}>Back</Button>
              <Button variant="contained" onClick={onSubmit} disabled={submitting}>Finish</Button>
            </Box>
          </Box>
        )}

        <AlertSnackbar message={snackbar || ''} onClose={() => setSnackbar(null)} />
      </Box>
    </FormProvider>
  );
};

export default CreateWizard;
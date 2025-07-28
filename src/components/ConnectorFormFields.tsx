import React from 'react';
import { TextField } from '@mui/material';
import { Controller, Control } from 'react-hook-form';

export interface ConnectorFieldValues {
  name: string;
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

interface Props {
  control: Control<ConnectorFieldValues>;
  disableName?: boolean;
}

const ConnectorFormFields: React.FC<Props> = ({ control, disableName }) => (
  <>
    <Controller
      name="name"
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          label="Connector Name"
          {...field}
          disabled={disableName}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          required
        />
      )}
    />
    <Controller
      name="host"
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          label="Host"
          {...field}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          required
        />
      )}
    />
    <Controller
      name="port"
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          label="Port"
          type="number"
          {...field}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          required
        />
      )}
    />
    <Controller
      name="username"
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          label="User"
          {...field}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          required
        />
      )}
    />
    <Controller
      name="password"
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          label="Password"
          type="password"
          {...field}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          required
        />
      )}
    />
    <Controller
      name="database"
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          label="Database Name"
          {...field}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          required
        />
      )}
    />
  </>
);

export default ConnectorFormFields;

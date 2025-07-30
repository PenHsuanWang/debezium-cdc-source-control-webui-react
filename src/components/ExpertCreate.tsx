import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import ConfigEditor from './ConfigEditor';
import AlertSnackbar from './AlertSnackbar';
import { useHost } from '../context/HostContext';
import { useNavigate } from 'react-router-dom';

const defaultJson = `{
  "name": "my-connector",
  "config": {
    "connector.class": "",
    "database.hostname": "",
    "database.user": "",
    "database.password": ""
  }
}`;

const ExpertCreate: React.FC = () => {
  const [json, setJson] = useState(defaultJson);
  const [error, setError] = useState<string | null>(null);
  const { state } = useHost();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    let payload: any;
    try {
      payload = JSON.parse(json);
    } catch (e: any) {
      setError('Invalid JSON');
      return;
    }

    if (!state.host) {
      setError('Please set the Debezium Connect host before creating a connector.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${state.host}/connectors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create connector');
      navigate('/');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Expert Connector Configuration</Typography>
      <TextField
        multiline
        minRows={10}
        value={json}
        onChange={(e) => setJson(e.target.value)}
        label="Connector JSON"
      />
      <Typography variant="subtitle1">Preview</Typography>
      <ConfigEditor value={json} readOnly />
      <Box>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          Submit
        </Button>
      </Box>
      {error && (
        <AlertSnackbar message={error} onClose={() => setError(null)} />
      )}
    </Box>
  );
};

export default ExpertCreate;

// src/components/ConfigEditor.tsx
import React from 'react';
import { Box } from '@mui/material';

interface ConfigEditorProps {
  value: string;
  readOnly?: boolean;
}

const ConfigEditor: React.FC<ConfigEditorProps> = ({ value, readOnly = false }) => {
  // For simplicity, a preformatted text block; in a real app, use a code editor component
  return (
    <Box component="pre" sx={{ backgroundColor: '#f5f5f5', p: 2, overflowX: 'auto' }}>
      {value}
    </Box>
  );
};
export default ConfigEditor;

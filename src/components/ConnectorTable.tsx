// src/components/ConnectorTable.tsx
import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Collapse, Box, Typography, Chip, Menu, MenuItem, Button
} from '@mui/material';
import {
  KeyboardArrowDown, KeyboardArrowUp, MoreVert
} from '@mui/icons-material';
import { useHost } from '../context/HostContext';
import ConfirmDialog from './ConfirmDialog';
import AlertSnackbar from './AlertSnackbar';
import { fetchWithTimeout } from '../utils/api';

type ConnectorInfo = {
  name: string;
  status: string;
  tasks: any[];
  type: string;
};

interface Props {
  connectors: ConnectorInfo[];
}

const ConnectorTable: React.FC<Props> = ({ connectors }) => {
  const { state } = useHost();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConnector, setSelectedConnector] = useState<ConnectorInfo | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [actionType, setActionType] = useState<string>('');
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, connector: ConnectorInfo) => {
    setAnchorEl(event.currentTarget);
    setSelectedConnector(connector);
  };
  const handleMenuClose = () => setAnchorEl(null);

  // Confirm dialog open for delete
  const confirmDelete = () => {
    setActionType('delete');
    setOpenDialog(true);
    handleMenuClose();
  };

  // Execute pause/resume/restart/delete
  const handleAction = async (action: string) => {
    if (!selectedConnector) return;
    const name = selectedConnector.name;
    try {
      let url = `${state.host}/connectors/${name}`;
      if (action === 'pause') url += '/pause';
      if (action === 'resume') url += '/resume';
      if (action === 'restart') url += '/restart';
      if (action === 'delete') {
        url += ''; // DELETE at connector endpoint
      }
      const method = (action === 'delete' ? 'DELETE' : 'PUT');
      const res = await fetchWithTimeout(url, { method }, 5000);
      if (!res.ok) throw new Error(`${action} failed`);
      setSnackbarMsg(`${action.charAt(0).toUpperCase() + action.slice(1)} succeeded`);
    } catch (e: any) {
      setSnackbarMsg(`Error: ${e.message}`);
    }
    setOpenDialog(false);
  };

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Tasks</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {connectors.map((conn) => (
              <React.Fragment key={conn.name}>
                <TableRow>
                  <TableCell>
                    <IconButton size="small">
                      <KeyboardArrowDown />
                    </IconButton>
                  </TableCell>
                  <TableCell>{conn.name}</TableCell>
                  <TableCell>{conn.type}</TableCell>
                  <TableCell>
                    <Chip
                      label={conn.status}
                      color={conn.status === 'RUNNING' ? 'success' : (conn.status === 'FAILED' ? 'error' : 'warning')}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {conn.tasks.length} ({conn.tasks.filter(t => t.state === 'RUNNING').length} running)
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => handleMenuClick(e, conn)}>
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={false} timeout="auto" unmountOnExit>
                      <Box margin={1}>
                        <Typography variant="h6" gutterBottom>
                          Tasks Details
                        </Typography>
                        {/* Additional tasks or metrics can be added here */}
                        <Typography>No additional details implemented.</Typography>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {selectedConnector?.status === 'RUNNING' && (
          <MenuItem onClick={() => { handleAction('pause'); handleMenuClose(); }}>Pause</MenuItem>
        )}
        {selectedConnector?.status === 'PAUSED' && (
          <MenuItem onClick={() => { handleAction('resume'); handleMenuClose(); }}>Resume</MenuItem>
        )}
        <MenuItem onClick={() => { handleAction('restart'); handleMenuClose(); }}>Restart</MenuItem>
        <MenuItem onClick={confirmDelete} color="error">Delete</MenuItem>
      </Menu>
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={openDialog}
        title="Delete Connector"
        content={`Are you sure you want to delete connector "${selectedConnector?.name}"?`}
        onClose={() => setOpenDialog(false)}
        onConfirm={() => handleAction('delete')}
      />
      {/* Snackbar for notifications */}
      {snackbarMsg && (
        <AlertSnackbar message={snackbarMsg} onClose={() => setSnackbarMsg(null)} />
      )}
    </>
  );
};

export default ConnectorTable;

// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ConnectorListPage from './pages/ConnectorListPage';
import HostPage from './pages/HostPage';
import CreateWizard from './components/CreateWizard';
import ExpertCreate from './components/ExpertCreate';
import TopBar from './components/TopBar';
import Container from '@mui/material/Container';

const App: React.FC = () => (
  <div>
    <TopBar />
    <Container sx={{ marginTop: 4 }}>
      <Routes>
        <Route path="/" element={<ConnectorListPage />} />
        <Route path="/host" element={<HostPage />} />
        <Route path="/create" element={<CreateWizard />} />
        <Route path="/create/expert" element={<ExpertCreate />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Container>
  </div>
);

export default App;

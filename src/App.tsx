// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ConnectorListPage from './pages/ConnectorListPage';
import TopBar from './components/TopBar';
import Container from '@mui/material/Container';

const App: React.FC = () => (
  <div>
    <TopBar />
    <Container sx={{ marginTop: 4 }}>
      <Routes>
        <Route path="/" element={<ConnectorListPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Container>
  </div>
);

export default App;

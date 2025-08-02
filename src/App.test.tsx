import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { HostProvider } from './context/HostContext';

test('renders Debezium UI title', () => {
  render(
    <HostProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HostProvider>
  );
  const title = screen.getByText(/Debezium UI/i);
  expect(title).toBeInTheDocument();
});

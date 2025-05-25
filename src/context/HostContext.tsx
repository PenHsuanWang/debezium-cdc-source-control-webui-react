// src/context/HostContext.tsx
import React, { createContext, useReducer, useContext, ReactNode } from 'react';

type HostState = {
  host: string;
  healthy: boolean;
  // ... add other fields as needed
};
const initialState: HostState = {
  host: '',
  healthy: false,
};

type HostContextType = {
  state: HostState;
  dispatch: React.Dispatch<any>;
};

const HostContext = createContext<HostContextType | undefined>(undefined);

type HostProviderProps = {
  children: ReactNode;
};

export const HostProvider: React.FC<HostProviderProps> = ({ children }) => {
  // Dummy reducer; replace with your actual logic
  const [state, dispatch] = useReducer(
    (state: HostState, action: any) => ({ ...state, ...action }),
    initialState
  );

  return (
    <HostContext.Provider value={{ state, dispatch }}>
      {children}
    </HostContext.Provider>
  );
};

export const useHost = () => {
  const context = useContext(HostContext);
  if (!context) {
    throw new Error('useHost must be used within a HostProvider');
  }
  return context;
};

// src/context/HostContext.tsx
import React, { createContext, useReducer, useContext, ReactNode } from 'react';

type HostState = {
  host: string;
  healthy: boolean;
  // ... add other fields as needed
};
const storedHost =
  typeof window !== 'undefined' ? localStorage.getItem('debezium-host') || '' : '';

const initialState: HostState = {
  host: storedHost,
  healthy: false,
};

type HostAction =
  | { type: 'SET_HOST'; payload: string }
  | { type: 'SET_HEALTH'; payload: boolean };

type HostContextType = {
  state: HostState;
  dispatch: React.Dispatch<HostAction>;
};

const HostContext = createContext<HostContextType | undefined>(undefined);

type HostProviderProps = {
  children: ReactNode;
};

function reducer(state: HostState, action: HostAction): HostState {
  switch (action.type) {
    case 'SET_HOST':
      return { ...state, host: action.payload };
    case 'SET_HEALTH':
      return { ...state, healthy: action.payload };
    default:
      return state;
  }
}

export const HostProvider: React.FC<HostProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  React.useEffect(() => {
    if (state.host) {
      localStorage.setItem('debezium-host', state.host);
    } else {
      localStorage.removeItem('debezium-host');
    }
  }, [state.host]);

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

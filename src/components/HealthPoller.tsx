// src/components/HealthPoller.tsx
import { useEffect } from 'react';
import { useHost } from '../context/HostContext';
import { fetchWithTimeout } from '../utils/api';

const HealthPoller: React.FC = () => {
  const { state, dispatch } = useHost();
  useEffect(() => {
    if (!state.host) return;
    const controller = new AbortController();
    const checkHealth = async () => {
      try {
        const res = await fetchWithTimeout(`${state.host}/connectors`, {}, 5000, controller);
        if (!res.ok) throw new Error('Network response was not ok');
        dispatch({ type: 'SET_HEALTH', payload: true });
      } catch (e) {
        dispatch({ type: 'SET_HEALTH', payload: false });
      }
    };
    checkHealth();
    const id = setInterval(checkHealth, 10000);
    return () => {
      clearInterval(id);
      controller.abort();
    };
  }, [state.host, dispatch]);
  return null;
};

export default HealthPoller;

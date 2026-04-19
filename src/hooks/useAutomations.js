import { useEffect, useState } from 'react';
import { getAutomations } from '../api/mockApi';

/**
 * Loads automation definitions for the Automated Step node form.
 */
export default function useAutomations() {
  const [automations, setAutomations] = useState([]);

  useEffect(() => {
    let active = true;
    getAutomations().then((result) => {
      if (active) setAutomations(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return automations;
}

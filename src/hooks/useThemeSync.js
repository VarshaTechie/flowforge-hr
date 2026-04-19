import { useEffect } from 'react';

/**
 * Syncs workflow theme into the document root.
 */
export default function useThemeSync(theme) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
}

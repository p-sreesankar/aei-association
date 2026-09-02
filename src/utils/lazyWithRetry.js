import { lazy } from 'react';

/**
 * A wrapper around React.lazy that retries importing the component if it fails.
 * This typically happens in SPAs when a new deployment invalidates old chunk hashes,
 * causing users with the old index.html to fail when navigating to a lazy-loaded route.
 * It performs a full page reload if the import fails, but only once to avoid an infinite loop.
 *
 * @param {Function} componentImport - The dynamic import function, e.g., () => import('./Component')
 * @returns {React.LazyExoticComponent}
 */
export const lazyWithRetry = (componentImport) => {
  return lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      // On success, reset the refresh flag
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Assume the error is due to an outdated chunk hash and refresh the page
        // to get the latest index.html with correct hashes.
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        
        // Return an empty component to prevent React from throwing while it reloads
        return { default: () => null };
      }

      // If it still fails after a refresh, throw the error
      throw error;
    }
  });
};

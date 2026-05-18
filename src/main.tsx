import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import ErrorScreen from './components/ui/ErrorScreen';
import { SentryErrorBoundary, initSentry } from './lib/sentry';
import './index.css';

initSentry();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SentryErrorBoundary
      fallback={({ resetError }) => <ErrorScreen resetError={resetError} />}
    >
      <App />
    </SentryErrorBoundary>
  </StrictMode>,
);

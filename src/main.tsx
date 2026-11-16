import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './app/zod-config';
import './app/i18n';
import './styles/index.css';
import { App } from './app/App';
import { applyTheme } from './lib/theme';

// D-322: the chosen theme before the first paint, so there is no flash of the light one
applyTheme();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

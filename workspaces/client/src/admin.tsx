import ReactDOM from 'react-dom/client';

import { AdminApp } from '@wsh-2024/admin/src/index';

import { registerServiceWorker } from './utils/registerServiceWorker';

const main = async () => {
  document.addEventListener('DOMContentLoaded', () => {
    ReactDOM.createRoot(document.getElementById('root')!).render(<AdminApp />);
  });

  await registerServiceWorker();
};

main().catch(console.error);

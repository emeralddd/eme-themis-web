import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css';
import './css/addition.css';
import './css/animation.css';
import './css/prism-vsc-dark-plus.css';
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';

const queryClient = new QueryClient();

axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </StrictMode>,
);

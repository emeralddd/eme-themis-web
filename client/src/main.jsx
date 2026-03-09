import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css';
import './css/addition.css';
import './css/animation.css';
import './css/prism-vsc-dark-plus.css';
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import HR from './hr.jsx'

const path = window.location.pathname;
const root = createRoot(document.getElementById('root'));

if (path === '/hr') {
  root.render(<StrictMode><HR /></StrictMode>);
} else {
  root.render(<StrictMode><App /></StrictMode>);
}
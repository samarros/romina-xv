import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { MotionProvider } from './motion/MotionProvider';
import './styles/tokens.css';
import './styles/global.css';
import './motion/microinteractions.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><MotionProvider><App /></MotionProvider></StrictMode>,
);

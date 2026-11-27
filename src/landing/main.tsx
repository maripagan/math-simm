import 'katex/dist/katex.min.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HeroLab } from './HeroLab';
import './lab.css';

createRoot(document.getElementById('hero-lab')!).render(
  <StrictMode>
    <HeroLab />
  </StrictMode>,
);

import { PresetCategory, PresetScene } from '../../types';
import { VariableGlossaryItem } from '../physics/types';

export const MATH_CATEGORIES: Array<{
  id: PresetCategory | 'todos';
  label: string;
}> = [
  { id: 'todos', label: 'Todos' },
  { id: 'matematica', label: 'Funções & Ondas' },
  { id: 'complexos', label: 'Números Complexos (ℂ)' },
];

export const EULER_PRESET_ID = 'euler-phasor';

export const EULER_PARAMETERS: VariableGlossaryItem[] = [
  { symbol: 'r', name: 'Módulo do fasor', unit: '' },
  { symbol: 'w', name: 'Frequência angular ω', unit: 'rad/s' },
];

export const MATH_PRESETS: PresetScene[] = [
  {
    id: 'wave-beat',
    category: 'matematica',
    title: 'Onda Viajante & Envelope',
    description:
      'Senoide animada no tempo t com amplitude e frequência controladas por sliders.',
    formulas: [
      { raw: 'y = a * sin(b * x - t)', color: '#38bdf8' },
      { raw: 'y = a * exp(-0.15 * x^2)', color: '#f472b6' },
    ],
    parameters: {
      a: { value: 2.5, min: 0.2, max: 5, step: 0.1 },
      b: { value: 1.8, min: 0.2, max: 6, step: 0.1 },
    },
    viewport: { centerX: 0, centerY: 0, scale: 60 },
  },
  {
    id: 'parabola-tangent',
    category: 'matematica',
    title: 'Parábola & Reta Secante/Tangente',
    description:
      'Explore raízes e interseções ajustando inclinação m e deslocamento k.',
    formulas: [
      { raw: 'y = a * x^2 + c', color: '#a78bfa' },
      { raw: 'y = m * x + k', color: '#fbbf24' },
    ],
    parameters: {
      a: { value: 0.5, min: -2, max: 2, step: 0.1 },
      c: { value: -2, min: -5, max: 5, step: 0.2 },
      m: { value: 1, min: -4, max: 4, step: 0.1 },
      k: { value: 0.5, min: -5, max: 5, step: 0.2 },
    },
    viewport: { centerX: 0, centerY: 0, scale: 60 },
  },
  {
    id: 'inequality-region',
    category: 'matematica',
    title: 'Região de Desigualdades',
    description:
      'Interseção visual de áreas com fronteiras tracejadas (<, >) e contínuas (<=, >=).',
    formulas: [
      { raw: 'y <= -0.3 * x^2 + 3', color: '#38bdf8' },
      { raw: 'y > sin(x)', color: '#f472b6' },
    ],
    parameters: {},
    viewport: { centerX: 0, centerY: 0.5, scale: 60 },
  },
  {
    id: EULER_PRESET_ID,
    category: 'complexos',
    title: 'Fórmula de Euler & Fasor (ℂ)',
    description:
      'Fasor z(t) = r·e^(i·w·t) girando no plano complexo junto com e^(i·x) (Re contínua, Im pontilhada).',
    formulas: [
      { raw: 'z(t) = r * e^(i * w * t)', color: '#38bdf8' },
      {
        raw: 'z(t) = r * e^(i * w * t) + 0.6 * e^(i * 3 * w * t)',
        color: '#f472b6',
      },
      { raw: 'y = r * e^(i * x)', color: '#34d399' },
    ],
    parameters: {
      r: { value: 2.0, min: 0.5, max: 4, step: 0.1 },
      w: { value: 1.2, min: 0.2, max: 5, step: 0.1 },
    },
    viewport: { centerX: 0, centerY: 0, scale: 70 },
  },
  {
    id: 'complex-sqrt',
    category: 'complexos',
    title: 'Raiz Complexa & Vetor z (ℂ)',
    description:
      'Veja √(x) gerar parte imaginária para x < 0 junto com um número complexo ajustável z = a + bi.',
    formulas: [
      { raw: 'y = √(x)', color: '#a78bfa' },
      { raw: 'z = a + b * i', color: '#fbbf24' },
    ],
    parameters: {
      a: { value: 2, min: -5, max: 5, step: 0.2 },
      b: { value: 1.5, min: -5, max: 5, step: 0.2 },
    },
    viewport: { centerX: 0, centerY: 0, scale: 65 },
  },
];

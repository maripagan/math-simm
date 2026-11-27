export interface ModeResult {
  values: number[];
  frequency: number;
  kind: 'amodal' | 'unimodal' | 'multimodal';
}

export interface SummaryStats {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  mode: ModeResult;
  range: number;
  variance: number;
  stdDev: number;
}

export interface HistogramBin {
  start: number;
  end: number;
  midpoint: number;
  count: number;
  density: number;
}

export function mean(values: number[]): number {
  if (values.length === 0) return Number.NaN;
  let sum = 0;
  for (let i = 0; i < values.length; i += 1) {
    sum += values[i];
  }
  return sum / values.length;
}

export function median(values: number[]): number {
  if (values.length === 0) return Number.NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

export function mode(values: number[], precision = 1): ModeResult {
  if (values.length === 0) {
    return { values: [], frequency: 0, kind: 'amodal' };
  }
  const factor = 10 ** precision;
  const counts = new Map<number, number>();
  for (const raw of values) {
    const rounded = Math.round(raw * factor) / factor;
    counts.set(rounded, (counts.get(rounded) ?? 0) + 1);
  }

  let maxFreq = 0;
  for (const freq of counts.values()) {
    if (freq > maxFreq) maxFreq = freq;
  }

  if (maxFreq <= 1) {
    return { values: [], frequency: maxFreq, kind: 'amodal' };
  }

  const topValues: number[] = [];
  for (const [val, freq] of counts.entries()) {
    if (freq === maxFreq) topValues.push(val);
  }
  topValues.sort((a, b) => a - b);

  // If every distinct value has the exact same frequency (>1) and there are multiple distinct values, treat as amodal
  if (topValues.length === counts.size && counts.size > 1) {
    return { values: [], frequency: maxFreq, kind: 'amodal' };
  }

  return {
    values: topValues,
    frequency: maxFreq,
    kind: topValues.length === 1 ? 'unimodal' : 'multimodal',
  };
}

export function range(values: number[]): number {
  if (values.length === 0) return Number.NaN;
  let minVal = values[0];
  let maxVal = values[0];
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] < minVal) minVal = values[i];
    if (values[i] > maxVal) maxVal = values[i];
  }
  return maxVal - minVal;
}

/** Variância populacional: (1/n) * sum((x_i - mean)^2) */
export function variance(values: number[]): number {
  if (values.length === 0) return Number.NaN;
  const m = mean(values);
  let sumSq = 0;
  for (let i = 0; i < values.length; i += 1) {
    const d = values[i] - m;
    sumSq += d * d;
  }
  return sumSq / values.length;
}

/** Desvio padrão populacional: sqrt(variance) */
export function stdDev(values: number[]): number {
  const v = variance(values);
  return Number.isNaN(v) ? Number.NaN : Math.sqrt(v);
}

export function summarize(values: number[], modePrecision = 1): SummaryStats {
  if (values.length === 0) {
    return {
      count: 0,
      min: Number.NaN,
      max: Number.NaN,
      mean: Number.NaN,
      median: Number.NaN,
      mode: { values: [], frequency: 0, kind: 'amodal' },
      range: Number.NaN,
      variance: Number.NaN,
      stdDev: Number.NaN,
    };
  }
  let minVal = values[0];
  let maxVal = values[0];
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] < minVal) minVal = values[i];
    if (values[i] > maxVal) maxVal = values[i];
  }
  const m = mean(values);
  let sumSq = 0;
  for (let i = 0; i < values.length; i += 1) {
    const d = values[i] - m;
    sumSq += d * d;
  }
  const v = sumSq / values.length;
  return {
    count: values.length,
    min: minVal,
    max: maxVal,
    mean: m,
    median: median(values),
    mode: mode(values, modePrecision),
    range: maxVal - minVal,
    variance: v,
    stdDev: Math.sqrt(v),
  };
}

export function buildHistogramBins(
  values: number[],
  binCount: number,
  domainMin?: number,
  domainMax?: number,
): HistogramBin[] {
  const safeBins = Math.max(2, Math.min(30, Math.round(binCount)));
  if (values.length === 0) {
    const start = domainMin ?? 0;
    const end = domainMax ?? safeBins;
    const width = (end - start) / safeBins || 1;
    return Array.from({ length: safeBins }, (_, i) => ({
      start: start + i * width,
      end: start + (i + 1) * width,
      midpoint: start + (i + 0.5) * width,
      count: 0,
      density: 0,
    }));
  }

  let minVal = domainMin ?? values[0];
  let maxVal = domainMax ?? values[0];
  if (domainMin === undefined || domainMax === undefined) {
    for (const v of values) {
      if (domainMin === undefined && v < minVal) minVal = v;
      if (domainMax === undefined && v > maxVal) maxVal = v;
    }
  }
  if (maxVal <= minVal) {
    minVal -= 1;
    maxVal += 1;
  }

  const width = (maxVal - minVal) / safeBins;
  const counts = new Array<number>(safeBins).fill(0);

  for (const v of values) {
    if (v < minVal || v > maxVal) continue;
    const idx = Math.min(safeBins - 1, Math.floor((v - minVal) / width));
    counts[idx] += 1;
  }

  return counts.map((count, i) => {
    const start = minVal + i * width;
    const end = start + width;
    return {
      start,
      end,
      midpoint: (start + end) / 2,
      count,
      density: count / (values.length * width),
    };
  });
}

export function normalPdf(x: number, mu: number, sigma: number): number {
  if (sigma <= 0) return 0;
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

/**
 * Gera uma amostra determinística (reprodutível) com média e desvio padrão exatos.
 * Útil para comparar duas distribuições A e B no histograma em tempo real.
 */
export function generateDeterministicSample(
  targetMean: number,
  targetStdDev: number,
  count = 160,
  skew = 0,
  seed = 42,
): number[] {
  const n = Math.max(8, Math.round(count));
  const raw: number[] = [];

  // PRNG linear congruential determinístico + Box-Muller
  let state = (seed >>> 0) || 1;
  const nextRand = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return (state + 0.5) / 4294967296;
  };

  for (let i = 0; i < n; i += 2) {
    const u1 = Math.max(1e-7, nextRand());
    const u2 = nextRand();
    const r = Math.sqrt(-2 * Math.log(u1));
    const theta = 2 * Math.PI * u2;
    const z1 = r * Math.cos(theta);
    const z2 = r * Math.sin(theta);
    raw.push(z1);
    if (raw.length < n) raw.push(z2);
  }

  const transformed =
    Math.abs(skew) < 1e-6
      ? raw
      : raw.map((z) => {
          // Aplica assimetria suave preservando monotonicidade
          const k = Math.max(-0.85, Math.min(0.85, skew));
          return Math.exp(k * z * 0.6) * (k >= 0 ? 1 : -1);
        });

  const currentMean = mean(transformed);
  const currentSd = stdDev(transformed);

  if (currentSd < 1e-9 || targetStdDev <= 0) {
    return transformed.map(() => targetMean);
  }

  return transformed.map(
    (x) => targetMean + ((x - currentMean) / currentSd) * targetStdDev,
  );
}

export function parseNumberList(raw: string): number[] {
  return raw
    .split(/[;,\s]+/)
    .map((s) => Number(s.trim().replace(',', '.')))
    .filter((n) => Number.isFinite(n));
}

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildHistogramBins,
  generateDeterministicSample,
  normalPdf,
  summarize,
} from './statisticsMath';
import { StatisticsStageState } from './statisticsPresets';

interface StatisticsStageProps {
  state: StatisticsStageState;
  interactive?: boolean;
  highContrast?: boolean;
  onChangeDotValue?: (index: number, nextValue: number) => void;
}

interface DotScreenPos {
  index: number;
  x: number;
  y: number;
  value: number;
  isMode: boolean;
}

function fmt(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function StatisticsStage({
  state,
  interactive = true,
  highContrast = false,
  onChangeDotValue,
}: StatisticsStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotPositionsRef = useRef<DotScreenPos[]>([]);
  const plotBoundsRef = useRef({ left: 60, right: 600, min: 0, max: 20 });

  const [size, setSize] = useState({ width: 720, height: 420 });
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const dotStats = useMemo(() => summarize(state.dotValues, 1), [state.dotValues]);

  const sampleA = useMemo(
    () =>
      generateDeterministicSample(state.meanA, state.stdA, 180, state.skewA, 42),
    [state.meanA, state.stdA, state.skewA],
  );
  const sampleB = useMemo(
    () =>
      state.showB
        ? generateDeterministicSample(state.meanB, state.stdB, 180, state.skewB, 99)
        : [],
    [state.meanB, state.stdB, state.skewB, state.showB],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 10 && rect.height > 10) {
        setSize({ width: rect.width, height: rect.height });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(240, size.width);
    const height = Math.max(220, size.height);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const bg = highContrast ? '#0f172a' : '#ffffff';
    const ink = highContrast ? '#f8fafc' : '#162033';
    const muted = highContrast ? '#cbd5e1' : '#4b5b75';
    const grid = highContrast ? 'rgba(148, 163, 184, 0.22)' : '#e2e8f0';
    const axisColor = highContrast ? '#94a3b8' : '#64748b';
    const blue = highContrast ? '#38bdf8' : '#2563eb';
    const green = highContrast ? '#34d399' : '#059669';
    const amber = highContrast ? '#fbbf24' : '#d97706';
    const rose = highContrast ? '#fb7185' : '#e11d48';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const padLeft = 58;
    const padRight = 32;
    const padTop = 58;
    const padBottom = 64;
    const plotW = Math.max(120, width - padLeft - padRight);
    const plotH = Math.max(100, height - padTop - padBottom);

    if (state.scenario === 'dotplot') {
      const dataMin = Math.min(...state.dotValues, state.dotDomainMin);
      const dataMax = Math.max(...state.dotValues, state.dotDomainMax);
      const minX = Math.min(state.dotDomainMin, Math.floor(dataMin));
      const maxX = Math.max(state.dotDomainMax, Math.ceil(dataMax));
      const span = Math.max(1, maxX - minX);
      const toX = (v: number) => padLeft + ((v - minX) / span) * plotW;

      plotBoundsRef.current = {
        left: padLeft,
        right: padLeft + plotW,
        min: minX,
        max: maxX,
      };

      const axisY = padTop + plotH * 0.78;

      // Grid vertical e eixo X
      const tickCount = width < 480 ? 5 : 10;
      ctx.font = '500 12px "DM Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let i = 0; i <= tickCount; i += 1) {
        const val = minX + (span * i) / tickCount;
        const x = toX(val);
        ctx.strokeStyle = grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, padTop);
        ctx.lineTo(x, axisY);
        ctx.stroke();

        ctx.fillStyle = muted;
        ctx.fillText(fmt(val, span <= 12 ? 1 : 0), x, axisY + 10);
      }

      // Linha do eixo X
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padLeft, axisY);
      ctx.lineTo(padLeft + plotW, axisY);
      ctx.stroke();

      // Título do eixo
      ctx.fillStyle = muted;
      ctx.font = '600 12px "Instrument Sans", system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(
        `${state.dotLabel}${state.dotUnit ? ` (${state.dotUnit})` : ''}`,
        padLeft + plotW,
        axisY + 32,
      );

      // Empilhamento (dotplot)
      const modeSet = new Set(dotStats.mode.values.map((v) => v.toFixed(1)));
      const sortedIndices = state.dotValues
        .map((value, index) => ({ value, index }))
        .sort((a, b) => a.value - b.value);

      const radius = highContrast ? 10 : 8.5;
      const placed: DotScreenPos[] = [];
      for (const item of sortedIndices) {
        const x = toX(item.value);
        let stack = 0;
        for (const p of placed) {
          if (Math.abs(p.x - x) < radius * 1.95) {
            stack += 1;
          }
        }
        const y = axisY - radius - 8 - stack * (radius * 2.15);
        const isMode = modeSet.has((Math.round(item.value * 10) / 10).toFixed(1));
        placed.push({ index: item.index, x, y, value: item.value, isMode });
      }
      dotPositionsRef.current = placed;

      // Faixa de +/- 1 desvio padrão em torno da média
      if (Number.isFinite(dotStats.mean) && Number.isFinite(dotStats.stdDev)) {
        const xLo = Math.max(padLeft, toX(dotStats.mean - dotStats.stdDev));
        const xHi = Math.min(padLeft + plotW, toX(dotStats.mean + dotStats.stdDev));
        ctx.fillStyle = highContrast
          ? 'rgba(56, 189, 248, 0.12)'
          : 'rgba(37, 99, 235, 0.08)';
        ctx.fillRect(xLo, padTop, Math.max(0, xHi - xLo), axisY - padTop);
      }

      // Linha da Mediana (sólida)
      const medX = toX(dotStats.median);
      const meanX = toX(dotStats.mean);
      const labelsClose = Math.abs(medX - meanX) < 110;

      if (Number.isFinite(dotStats.median)) {
        ctx.save();
        ctx.strokeStyle = green;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(medX, padTop + 14);
        ctx.lineTo(medX, axisY);
        ctx.stroke();

        const label = `Mediana ${fmt(dotStats.median)}`;
        ctx.font = '600 12px "Instrument Sans", system-ui, sans-serif';
        const tw = ctx.measureText(label).width + 16;
        const ly = labelsClose ? padTop - 2 : padTop - 28;
        const lx = Math.max(padLeft, Math.min(padLeft + plotW - tw, medX - tw / 2));
        drawRoundedRect(ctx, lx, ly, tw, 22, 6);
        ctx.fillStyle = green;
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, lx + tw / 2, ly + 11);
        ctx.restore();
      }

      // Linha da Média (tracejada)
      if (Number.isFinite(dotStats.mean)) {
        ctx.save();
        ctx.strokeStyle = blue;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.moveTo(meanX, padTop - 6);
        ctx.lineTo(meanX, axisY);
        ctx.stroke();
        ctx.setLineDash([]);

        const label = `Média ${fmt(dotStats.mean)}`;
        ctx.font = '600 12px "Instrument Sans", system-ui, sans-serif';
        const tw = ctx.measureText(label).width + 16;
        const ly = padTop - 28;
        const lx = Math.max(padLeft, Math.min(padLeft + plotW - tw, meanX - tw / 2));
        drawRoundedRect(ctx, lx, ly, tw, 22, 6);
        ctx.fillStyle = blue;
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, lx + tw / 2, ly + 11);
        ctx.restore();
      }

      // Desenhar pontos
      for (const dot of placed) {
        const isActive = dot.index === dragIndex || dot.index === hoverIndex;
        ctx.save();
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, isActive ? radius + 2.5 : radius, 0, Math.PI * 2);
        ctx.fillStyle = dot.isMode ? amber : blue;
        ctx.fill();
        ctx.lineWidth = isActive ? 3 : 2;
        ctx.strokeStyle = highContrast ? '#0f172a' : '#ffffff';
        ctx.stroke();

        if (isActive) {
          const tip = fmt(dot.value, 1);
          ctx.font = '600 11px "DM Mono", ui-monospace, monospace';
          const tw = ctx.measureText(tip).width + 12;
          drawRoundedRect(ctx, dot.x - tw / 2, dot.y - radius - 26, tw, 20, 5);
          ctx.fillStyle = ink;
          ctx.fill();
          ctx.fillStyle = bg;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tip, dot.x, dot.y - radius - 16);
        }
        ctx.restore();
      }

      if (interactive) {
        ctx.fillStyle = muted;
        ctx.font = '500 12px "Instrument Sans", system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(
          'Arraste qualquer ponto na horizontal para testar o efeito de outliers',
          padLeft,
          axisY + 32,
        );
      }
      return;
    }

    if (state.scenario === 'histogram') {
      const minX = state.histDomainMin;
      const maxX = Math.max(minX + 5, state.histDomainMax);
      const span = maxX - minX;
      const toX = (v: number) => padLeft + ((v - minX) / span) * plotW;

      const binsA = buildHistogramBins(sampleA, state.bins, minX, maxX);
      const binsB = state.showB
        ? buildHistogramBins(sampleB, state.bins, minX, maxX)
        : [];
      const binWidthVal = span / binsA.length;

      let maxCount = 1;
      for (const b of binsA) if (b.count > maxCount) maxCount = b.count;
      for (const b of binsB) if (b.count > maxCount) maxCount = b.count;

      if (state.showNormalCurve) {
        const peakA = normalPdf(state.meanA, state.meanA, state.stdA) * sampleA.length * binWidthVal;
        const peakB = state.showB
          ? normalPdf(state.meanB, state.meanB, state.stdB) * sampleB.length * binWidthVal
          : 0;
        maxCount = Math.max(maxCount, peakA, peakB);
      }
      maxCount = Math.ceil(maxCount * 1.15);

      const axisY = padTop + plotH;
      const toY = (c: number) => axisY - (c / maxCount) * plotH;

      // Grid horizontal + eixo Y
      ctx.font = '500 11px "DM Mono", ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const ySteps = 4;
      for (let i = 0; i <= ySteps; i += 1) {
        const val = (maxCount * i) / ySteps;
        const y = toY(val);
        ctx.strokeStyle = grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + plotW, y);
        ctx.stroke();

        ctx.fillStyle = muted;
        ctx.fillText(Math.round(val).toString(), padLeft - 10, y);
      }

      // Faixa [mu - sigma, mu + sigma]
      if (state.showSigmaBand) {
        const aLo = Math.max(padLeft, toX(state.meanA - state.stdA));
        const aHi = Math.min(padLeft + plotW, toX(state.meanA + state.stdA));
        ctx.fillStyle = highContrast
          ? 'rgba(56, 189, 248, 0.16)'
          : 'rgba(37, 99, 235, 0.10)';
        ctx.fillRect(aLo, padTop, Math.max(0, aHi - aLo), plotH);

        if (state.showB) {
          const bLo = Math.max(padLeft, toX(state.meanB - state.stdB));
          const bHi = Math.min(padLeft + plotW, toX(state.meanB + state.stdB));
          ctx.strokeStyle = rose;
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(bLo, padTop + 6, Math.max(0, bHi - bLo), plotH - 6);
          ctx.setLineDash([]);
        }
      }

      // Barras Grupo B (atrás, se visível)
      if (state.showB) {
        for (const b of binsB) {
          const x0 = toX(b.start) + 1;
          const x1 = toX(b.end) - 1;
          const yTop = toY(b.count);
          ctx.fillStyle = highContrast
            ? 'rgba(251, 113, 133, 0.38)'
            : 'rgba(225, 29, 72, 0.28)';
          ctx.strokeStyle = rose;
          ctx.lineWidth = 1.5;
          ctx.fillRect(x0, yTop, Math.max(1, x1 - x0), axisY - yTop);
          ctx.strokeRect(x0, yTop, Math.max(1, x1 - x0), axisY - yTop);
        }
      }

      // Barras Grupo A
      for (const b of binsA) {
        const x0 = toX(b.start) + 1;
        const x1 = toX(b.end) - 1;
        const yTop = toY(b.count);
        ctx.fillStyle = highContrast
          ? 'rgba(56, 189, 248, 0.45)'
          : 'rgba(37, 99, 235, 0.36)';
        ctx.strokeStyle = blue;
        ctx.lineWidth = 1.5;
        ctx.fillRect(x0, yTop, Math.max(1, x1 - x0), axisY - yTop);
        ctx.strokeRect(x0, yTop, Math.max(1, x1 - x0), axisY - yTop);
      }

      // Curvas normais aproximadas
      if (state.showNormalCurve) {
        const drawCurve = (mu: number, sigma: number, n: number, color: string) => {
          ctx.save();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          const steps = 140;
          for (let i = 0; i <= steps; i += 1) {
            const xVal = minX + (span * i) / steps;
            const expectedCount = normalPdf(xVal, mu, sigma) * n * binWidthVal;
            const px = toX(xVal);
            const py = toY(expectedCount);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.restore();
        };
        drawCurve(state.meanA, state.stdA, sampleA.length, blue);
        if (state.showB) drawCurve(state.meanB, state.stdB, sampleB.length, rose);
      }

      // Linhas de média
      const drawMeanLine = (mu: number, color: string, offsetY: number, tag: string) => {
        const mx = toX(mu);
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(mx, padTop);
        ctx.lineTo(mx, axisY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '600 11px "Instrument Sans", system-ui, sans-serif';
        const tw = ctx.measureText(tag).width + 12;
        const lx = Math.max(padLeft, Math.min(padLeft + plotW - tw, mx - tw / 2));
        drawRoundedRect(ctx, lx, padTop - 26 + offsetY, tw, 20, 5);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tag, lx + tw / 2, padTop - 16 + offsetY);
        ctx.restore();
      };
      drawMeanLine(state.meanA, blue, 0, `μA = ${fmt(state.meanA, 1)}`);
      if (state.showB) {
        const close = Math.abs(state.meanA - state.meanB) < span * 0.12;
        drawMeanLine(state.meanB, rose, close ? 24 : 0, `μB = ${fmt(state.meanB, 1)}`);
      }

      // Eixos X e Y
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padLeft, padTop);
      ctx.lineTo(padLeft, axisY);
      ctx.lineTo(padLeft + plotW, axisY);
      ctx.stroke();

      // Ticks eixo X
      ctx.font = '500 12px "DM Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const xTicks = width < 480 ? 5 : 10;
      for (let i = 0; i <= xTicks; i += 1) {
        const v = minX + (span * i) / xTicks;
        ctx.fillStyle = muted;
        ctx.fillText(fmt(v, 0), toX(v), axisY + 10);
      }

      // Legenda superior esquerda
      ctx.font = '600 12px "Instrument Sans", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = blue;
      ctx.fillRect(padLeft, 16, 12, 12);
      ctx.fillStyle = ink;
      ctx.fillText(
        `${state.labelA} (σ = ${fmt(state.stdA, 1)})`,
        padLeft + 18,
        22,
      );

      if (state.showB) {
        const secondX = padLeft + Math.min(260, plotW * 0.5);
        ctx.fillStyle = rose;
        ctx.fillRect(secondX, 16, 12, 12);
        ctx.fillStyle = ink;
        ctx.fillText(
          `${state.labelB} (σ = ${fmt(state.stdB, 1)})`,
          secondX + 18,
          22,
        );
      }
      return;
    }

    // Cenário 3: Gráficos & Armadilhas (bar | line | pie)
    const cats = state.categories;
    ctx.fillStyle = ink;
    ctx.font = '600 14px "Instrument Sans", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(state.chartTitle, padLeft, 16);

    if (state.chartType === 'pie') {
      const total = cats.reduce((acc, c) => acc + Math.max(0, c.value), 0) || 1;
      const cx = width * 0.38;
      const cy = height * 0.54;
      const r = Math.min(plotW * 0.28, plotH * 0.44, 150);

      let startAngle = -Math.PI / 2;
      cats.forEach((cat) => {
        const frac = Math.max(0, cat.value) / total;
        const sweep = frac * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, startAngle + sweep);
        ctx.closePath();
        ctx.fillStyle = cat.color;
        ctx.fill();
        ctx.strokeStyle = bg;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (frac >= 0.06) {
          const mid = startAngle + sweep / 2;
          const lx = cx + Math.cos(mid) * (r * 0.65);
          const ly = cy + Math.sin(mid) * (r * 0.65);
          ctx.fillStyle = '#ffffff';
          ctx.font = '700 12px "DM Mono", ui-monospace, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${Math.round(frac * 100)}%`, lx, ly);
        }
        startAngle += sweep;
      });

      // Legenda à direita
      const legendX = Math.max(cx + r + 36, width * 0.62);
      let legendY = padTop + 20;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      cats.forEach((cat) => {
        const pct = ((Math.max(0, cat.value) / total) * 100).toFixed(1);
        ctx.fillStyle = cat.color;
        ctx.fillRect(legendX, legendY - 6, 14, 14);
        ctx.fillStyle = ink;
        ctx.font = '600 13px "Instrument Sans", system-ui, sans-serif';
        ctx.fillText(`${cat.label}`, legendX + 22, legendY);
        ctx.fillStyle = muted;
        ctx.font = '500 12px "DM Mono", ui-monospace, monospace';
        ctx.fillText(
          `${cat.value}${state.chartUnit} (${pct}%)`,
          legendX + 22,
          legendY + 18,
        );
        legendY += 44;
      });
      return;
    }

    // Barras ou Linhas com controle de Eixo Y truncado
    const vals = cats.map((c) => c.value);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const rawSpan = Math.max(1, maxVal - minVal);
    const yMin = state.startYAtZero
      ? 0
      : Math.max(0, Math.floor(minVal - rawSpan * 0.25));
    const yMax = Math.ceil(maxVal + Math.max(2, (maxVal - yMin) * 0.14));
    const ySpan = Math.max(1, yMax - yMin);

    const axisY = padTop + plotH;
    const toY = (v: number) => axisY - ((v - yMin) / ySpan) * plotH;

    // Aviso de eixo truncado no topo direito
    if (!state.startYAtZero && yMin > 0) {
      const warnText = `⚠ Eixo Y truncado (começa em ${yMin}${state.chartUnit})`;
      ctx.font = '600 12px "Instrument Sans", system-ui, sans-serif';
      const tw = ctx.measureText(warnText).width + 18;
      const wx = padLeft + plotW - tw;
      drawRoundedRect(ctx, wx, 12, tw, 24, 6);
      ctx.fillStyle = highContrast ? '#78350f' : '#fef3c7';
      ctx.fill();
      ctx.strokeStyle = amber;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = highContrast ? '#fde68a' : '#92400e';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(warnText, wx + tw / 2, 24);
    }

    // Grid horizontal + ticks Y
    ctx.font = '500 12px "DM Mono", ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i += 1) {
      const val = yMin + (ySpan * i) / yTicks;
      const y = toY(val);
      ctx.strokeStyle = grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();

      ctx.fillStyle = muted;
      ctx.fillText(`${fmt(val, 0)}${state.chartUnit}`, padLeft - 10, y);
    }

    // Eixos
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, axisY);
    ctx.lineTo(padLeft + plotW, axisY);
    ctx.stroke();

    // Marca de quebra no eixo Y quando truncado
    if (!state.startYAtZero && yMin > 0) {
      ctx.strokeStyle = amber;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(padLeft - 6, axisY - 12);
      ctx.lineTo(padLeft + 6, axisY - 8);
      ctx.lineTo(padLeft - 6, axisY - 4);
      ctx.stroke();
    }

    const slotW = plotW / Math.max(1, cats.length);

    if (state.chartType === 'bar') {
      const barW = Math.min(72, slotW * 0.56);
      cats.forEach((cat, i) => {
        const cx = padLeft + slotW * (i + 0.5);
        const topY = toY(cat.value);
        drawRoundedRect(ctx, cx - barW / 2, topY, barW, Math.max(2, axisY - topY), 6);
        ctx.fillStyle = cat.color;
        ctx.fill();

        ctx.fillStyle = ink;
        ctx.font = '700 12px "DM Mono", ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${cat.value}${state.chartUnit}`, cx, topY - 6);

        ctx.fillStyle = muted;
        ctx.font = '600 12px "Instrument Sans", system-ui, sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText(cat.label, cx, axisY + 12);
      });
    } else {
      // Line chart
      ctx.strokeStyle = blue;
      ctx.lineWidth = 3;
      ctx.beginPath();
      cats.forEach((cat, i) => {
        const cx = padLeft + slotW * (i + 0.5);
        const cy = toY(cat.value);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();

      cats.forEach((cat, i) => {
        const cx = padLeft + slotW * (i + 0.5);
        const cy = toY(cat.value);
        ctx.beginPath();
        ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = cat.color;
        ctx.fill();
        ctx.strokeStyle = bg;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = ink;
        ctx.font = '700 12px "DM Mono", ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${cat.value}${state.chartUnit}`, cx, cy - 10);

        ctx.fillStyle = muted;
        ctx.font = '600 12px "Instrument Sans", system-ui, sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText(cat.label, cx, axisY + 12);
      });
    }
  }, [size, state, dotStats, sampleA, sampleB, dragIndex, hoverIndex, highContrast, interactive]);

  const getPointerCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const findNearestDot = (x: number, y: number): number | null => {
    let best: number | null = null;
    let bestDist = 20;
    for (const dot of dotPositionsRef.current) {
      const dist = Math.hypot(dot.x - x, dot.y - y);
      if (dist < bestDist) {
        bestDist = dist;
        best = dot.index;
      }
    }
    return best;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive || state.scenario !== 'dotplot' || !onChangeDotValue) return;
    const { x, y } = getPointerCoords(e);
    const hit = findNearestDot(x, y);
    if (hit !== null) {
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragIndex(hit);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive || state.scenario !== 'dotplot') return;
    const { x, y } = getPointerCoords(e);
    if (dragIndex !== null && onChangeDotValue) {
      const { left, right, min, max } = plotBoundsRef.current;
      const ratio = Math.max(0, Math.min(1, (x - left) / Math.max(1, right - left)));
      const nextVal = Math.round((min + ratio * (max - min)) * 10) / 10;
      onChangeDotValue(dragIndex, nextVal);
      return;
    }
    setHoverIndex(findNearestDot(x, y));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragIndex !== null) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      setDragIndex(null);
    }
  };

  return (
    <div className={`stats-stage-wrap ${highContrast ? 'is-hc' : ''}`}>
      <div className="stats-canvas-host" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className={`stats-canvas ${
            interactive && state.scenario === 'dotplot' && (hoverIndex !== null || dragIndex !== null)
              ? 'is-grabbable'
              : ''
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            setHoverIndex(null);
            setDragIndex(null);
          }}
        />
      </div>

      {/* Cards de telemetria ao vivo */}
      {state.scenario === 'dotplot' && (
        <div className="stats-kpi-bar">
          <div className="stats-kpi is-blue">
            <span>Média (x̄)</span>
            <strong>{fmt(dotStats.mean)}</strong>
          </div>
          <div className="stats-kpi is-green">
            <span>Mediana (Md)</span>
            <strong>{fmt(dotStats.median)}</strong>
          </div>
          <div className="stats-kpi is-amber">
            <span>Moda (Mo)</span>
            <strong>
              {dotStats.mode.kind === 'amodal'
                ? 'Amodal'
                : dotStats.mode.values.map((v) => fmt(v, 1)).join(', ')}
            </strong>
          </div>
          <div className="stats-kpi">
            <span>Amplitude</span>
            <strong>{fmt(dotStats.range)}</strong>
          </div>
          <div className="stats-kpi">
            <span>Desvio Padrão (σ)</span>
            <strong>{fmt(dotStats.stdDev)}</strong>
          </div>
        </div>
      )}

      {state.scenario === 'histogram' && (
        <div className="stats-kpi-bar">
          <div className="stats-kpi is-blue">
            <span>{state.labelA}</span>
            <strong>
              μ = {fmt(state.meanA, 1)} · σ = {fmt(state.stdA, 1)}
            </strong>
          </div>
          {state.showB && (
            <div className="stats-kpi is-rose">
              <span>{state.labelB}</span>
              <strong>
                μ = {fmt(state.meanB, 1)} · σ = {fmt(state.stdB, 1)}
              </strong>
            </div>
          )}
          <div className="stats-kpi">
            <span>Razão de dispersão (σB / σA)</span>
            <strong>
              {state.showB && state.stdA > 0
                ? `${fmt(state.stdB / state.stdA, 2)}×`
                : '—'}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}

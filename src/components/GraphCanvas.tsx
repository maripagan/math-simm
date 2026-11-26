import { useEffect, useMemo, useRef, useState } from 'react';
import { ActiveCurve, AuxDef } from '../engine/evaluator';
import { buildPlot, pickHover, PlotItem, Pt, Size, SnapTarget } from '../engine/plot';
import {
  computeGridStep,
  formatAxisNumber,
  screenToWorldX,
  screenToWorldY,
  worldToScreenX,
  worldToScreenY,
} from '../engine/viewport';
import { RenderOverlay, Viewport } from '../types';

interface GraphCanvasProps {
  curves: ActiveCurve[];
  defs: AuxDef[];
  scope: Record<string, unknown>;
  viewport: Viewport;
  onViewportChange: (vp: Viewport) => void;
  renderOverlay?: RenderOverlay;
  /** Optional interactive drag handler in world coordinates. Return true to consume drag instead of panning. */
  onDragWorld?: (wx: number, wy: number, phase: 'down' | 'move') => boolean;
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1);
  const headLen = Math.min(12, Math.max(6, len * 0.25));

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  if (len > 4) {
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLen * Math.cos(angle - Math.PI / 6),
      y2 - headLen * Math.sin(angle - Math.PI / 6),
    );
    ctx.lineTo(
      x2 - headLen * Math.cos(angle + Math.PI / 6),
      y2 - headLen * Math.sin(angle + Math.PI / 6),
    );
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawPolyline(ctx: CanvasRenderingContext2D, segments: Pt[][]) {
  ctx.beginPath();
  for (const seg of segments) {
    if (seg.length === 0) continue;
    ctx.moveTo(seg[0].sx, seg[0].sy);
    for (let i = 1; i < seg.length; i++) ctx.lineTo(seg[i].sx, seg[i].sy);
  }
  ctx.stroke();
}

function drawMarker(
  ctx: CanvasRenderingContext2D,
  at: Pt,
  color: string,
  radius: number,
  ring: number,
  label: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(at.sx, at.sy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = ring;
  ctx.stroke();
  ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = '#e2e8f0';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(label, at.sx + 8, at.sy - 6);
}

function drawItem(
  ctx: CanvasRenderingContext2D,
  item: PlotItem,
  origin: Pt,
  size: Size,
) {
  const { width, height } = size;
  switch (item.kind) {
    case 'trail':
      ctx.save();
      ctx.strokeStyle = item.color;
      ctx.lineWidth = item.width;
      ctx.globalAlpha = item.alpha;
      drawPolyline(ctx, item.segments);
      ctx.restore();
      return;
    case 'particle':
      if (item.velocity) {
        drawArrow(
          ctx,
          item.at.sx,
          item.at.sy,
          item.velocity.sx,
          item.velocity.sy,
          '#fbbf24',
        );
      }
      drawMarker(ctx, item.at, item.color, 5.5, 1.8, item.label);
      return;
    case 'phasor':
      if (item.projection) {
        ctx.save();
        ctx.strokeStyle = item.color;
        ctx.globalAlpha = 0.35;
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(item.at.sx, item.at.sy);
        ctx.lineTo(item.at.sx, origin.sy);
        ctx.moveTo(item.at.sx, item.at.sy);
        ctx.lineTo(origin.sx, item.at.sy);
        ctx.stroke();
        ctx.restore();
      }
      drawArrow(ctx, origin.sx, origin.sy, item.at.sx, item.at.sy, item.color);
      drawMarker(ctx, item.at, item.color, 5, 1.5, item.label);
      return;
    case 'vline': {
      const { sx } = item;
      if (item.fill) {
        ctx.save();
        ctx.fillStyle = item.color;
        ctx.globalAlpha = 0.2;
        if (item.fill === 'right') {
          const xStart = Math.max(0, sx);
          if (xStart < width) ctx.fillRect(xStart, 0, width - xStart, height);
        } else {
          const xEnd = Math.min(width, sx);
          if (xEnd > 0) ctx.fillRect(0, 0, xEnd, height);
        }
        ctx.restore();
      }
      if (sx >= -2 && sx <= width + 2) {
        ctx.save();
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2.4;
        if (item.strict) ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, height);
        ctx.stroke();
        ctx.restore();
      }
      return;
    }
    case 'function': {
      if (item.fill) {
        const edgeY = item.fill === 'above' ? 0 : height;
        ctx.save();
        ctx.fillStyle = item.color;
        ctx.globalAlpha = 0.2;
        for (const seg of item.re) {
          if (seg.length < 2) continue;
          ctx.beginPath();
          ctx.moveTo(seg[0].sx, edgeY);
          for (const pt of seg) {
            ctx.lineTo(pt.sx, Math.min(Math.max(pt.sy, -height), height * 2));
          }
          ctx.lineTo(seg[seg.length - 1].sx, edgeY);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.save();
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2.4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      if (item.strict) ctx.setLineDash([7, 5]);
      drawPolyline(ctx, item.re);
      ctx.restore();
      if (item.im.length > 0) {
        ctx.save();
        ctx.strokeStyle = item.color;
        ctx.globalAlpha = 0.78;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 4]);
        drawPolyline(ctx, item.im);
        ctx.restore();
      }
      return;
    }
  }
}

function drawHover(
  ctx: CanvasRenderingContext2D,
  snap: SnapTarget,
  size: Size,
) {
  const { width, height } = size;
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.25)';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(snap.sx, 0);
  ctx.lineTo(snap.sx, height);
  ctx.moveTo(0, snap.sy);
  ctx.lineTo(width, snap.sy);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = snap.color;
  ctx.beginPath();
  ctx.arc(snap.sx, snap.sy, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
  const textW = ctx.measureText(snap.label).width;
  const boxW = textW + 16;
  const boxH = 26;
  const boxX = Math.min(Math.max(snap.sx + 12, 8), width - boxW - 8);
  const boxY = Math.max(snap.sy - 34, 8);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.strokeStyle = snap.color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(snap.label, boxX + 8, boxY + boxH / 2);
}

export function GraphCanvas({
  curves,
  defs,
  scope,
  viewport,
  onViewportChange,
  renderOverlay,
  onDragWorld,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [mousePos, setMousePos] = useState<{ sx: number; sy: number } | null>(
    null,
  );
  const dragRef = useRef<{
    active: boolean;
    mode: 'pan' | 'interact';
    startX: number;
    startY: number;
    origCenterX: number;
    origCenterY: number;
  } | null>(null);

  // Observe container resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSize({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const plot = useMemo(
    () => buildPlot(curves, defs, scope, viewport, size),
    [curves, defs, scope, viewport, size],
  );
  const hover = useMemo(
    () =>
      mousePos ? pickHover(plot, curves, scope, viewport, size, mousePos) : null,
    [plot, curves, scope, viewport, size, mousePos],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
  }, [size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = size;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, width, height);

    const xMin = screenToWorldX(0, viewport, width);
    const xMax = screenToWorldX(width, viewport, width);
    const yMin = screenToWorldY(height, viewport, height);
    const yMax = screenToWorldY(0, viewport, height);

    const majorStep = computeGridStep(viewport.scale);
    const minorStep = majorStep / 5;

    // Minor grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const startMinorX = Math.floor(xMin / minorStep) * minorStep;
    for (let wx = startMinorX; wx <= xMax; wx += minorStep) {
      const sx = worldToScreenX(wx, viewport, width);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
    }
    const startMinorY = Math.floor(yMin / minorStep) * minorStep;
    for (let wy = startMinorY; wy <= yMax; wy += minorStep) {
      const sy = worldToScreenY(wy, viewport, height);
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
    }
    ctx.stroke();

    // Major grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const startMajorX = Math.floor(xMin / majorStep) * majorStep;
    for (let wx = startMajorX; wx <= xMax; wx += majorStep) {
      const sx = worldToScreenX(wx, viewport, width);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
    }
    const startMajorY = Math.floor(yMin / majorStep) * majorStep;
    for (let wy = startMajorY; wy <= yMax; wy += majorStep) {
      const sy = worldToScreenY(wy, viewport, height);
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
    }
    ctx.stroke();

    // Main Axes
    const originX = worldToScreenX(0, viewport, width);
    const originY = worldToScreenY(0, viewport, height);
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (originX >= 0 && originX <= width) {
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, height);
    }
    if (originY >= 0 && originY <= height) {
      ctx.moveTo(0, originY);
      ctx.lineTo(width, originY);
    }
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const labelY = Math.min(Math.max(originY + 6, 6), height - 18);
    for (let wx = startMajorX; wx <= xMax; wx += majorStep) {
      if (Math.abs(wx) < majorStep * 1e-4) continue;
      const sx = worldToScreenX(wx, viewport, width);
      ctx.fillText(formatAxisNumber(wx), sx, labelY);
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const labelX = Math.min(Math.max(originX - 6, 36), width - 6);
    for (let wy = startMajorY; wy <= yMax; wy += majorStep) {
      if (Math.abs(wy) < majorStep * 1e-4) continue;
      const sy = worldToScreenY(wy, viewport, height);
      ctx.fillText(formatAxisNumber(wy), labelX, sy);
    }

    // Axis name indicators (Re / Im when Argand-Gauss z-curves are present)
    ctx.fillStyle = plot.hasZ ? '#38bdf8' : '#64748b';
    ctx.font = '600 12px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(
      plot.hasZ ? 'Re (x)' : 'x',
      width - 10,
      Math.min(Math.max(originY - 6, 20), height - 10),
    );
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(
      plot.hasZ ? 'Im (y)' : 'y',
      Math.min(Math.max(originX + 8, 10), width - 54),
      10,
    );

    for (const item of plot.items) {
      drawItem(ctx, item, plot.origin, size);
    }

    if (renderOverlay) {
      ctx.save();
      renderOverlay(ctx, {
        width,
        height,
        viewport,
        scope,
        toScreenX: (wx: number) => worldToScreenX(wx, viewport, width),
        toScreenY: (wy: number) => worldToScreenY(wy, viewport, height),
      });
      ctx.restore();
    }

    for (const pt of plot.notable) {
      const sx = worldToScreenX(pt.x, viewport, width);
      const sy = worldToScreenY(pt.y, viewport, height);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0b1120';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if (hover) drawHover(ctx, hover, size);
  }, [plot, hover, renderOverlay, scope, viewport, size]);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const wxBefore = screenToWorldX(sx, viewport, size.width);
    const wyBefore = screenToWorldY(sy, viewport, size.height);

    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const nextScale = Math.min(Math.max(viewport.scale * factor, 4), 2000);

    const nextCenterX = wxBefore - (sx - size.width / 2) / nextScale;
    const nextCenterY = wyBefore + (sy - size.height / 2) / nextScale;

    onViewportChange({
      centerX: nextCenterX,
      centerY: nextCenterY,
      scale: nextScale,
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const wx = screenToWorldX(sx, viewport, size.width);
    const wy = screenToWorldY(sy, viewport, size.height);

    if (onDragWorld && onDragWorld(wx, wy, 'down')) {
      dragRef.current = {
        active: true,
        mode: 'interact',
        startX: e.clientX,
        startY: e.clientY,
        origCenterX: viewport.centerX,
        origCenterY: viewport.centerY,
      };
      return;
    }

    dragRef.current = {
      active: true,
      mode: 'pan',
      startX: e.clientX,
      startY: e.clientY,
      origCenterX: viewport.centerX,
      origCenterY: viewport.centerY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    setMousePos({ sx, sy });

    if (dragRef.current?.active) {
      if (dragRef.current.mode === 'interact' && onDragWorld) {
        const wx = screenToWorldX(sx, viewport, size.width);
        const wy = screenToWorldY(sy, viewport, size.height);
        onDragWorld(wx, wy, 'move');
        return;
      }
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      onViewportChange({
        ...viewport,
        centerX: dragRef.current.origCenterX - dx / viewport.scale,
        centerY: dragRef.current.origCenterY + dy / viewport.scale,
      });
    }
  };

  const handleMouseUp = () => {
    if (dragRef.current) dragRef.current.active = false;
  };

  return (
    <div ref={containerRef} className="canvas-container">
      <canvas
        ref={canvasRef}
        className="graph-canvas"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setMousePos(null);
        }}
      />
      <button
        className="reset-view-btn"
        onClick={() => onViewportChange({ centerX: 0, centerY: 0, scale: 60 })}
        title="Centralizar origem (0, 0)"
      >
        Resetar Zoom
      </button>
    </div>
  );
}

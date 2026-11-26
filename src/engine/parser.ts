import { parse, EvalFunction, MathNode } from 'mathjs';

const RESERVED_SYMBOLS = new Set([
  'x',
  't',
  'e',
  'pi',
  'tau',
  'phi',
  'i',
  'Infinity',
  'NaN',
  'true',
  'false',
]);

export type RelationOp = '=' | '>' | '>=' | '<' | '<=';
export type RelationAxis = 'y' | 'x' | 'z' | 'parametric' | 'def';

export interface ComplexValue {
  re: number;
  im: number;
}

export interface ParsedFormula {
  compiled: EvalFunction | null;
  /** Second compiled expression for parametric curves (x(t), y(t)) */
  compiledY: EvalFunction | null;
  latex: string;
  parameters: string[];
  error: string | null;
  relation: RelationOp;
  axis: RelationAxis;
  usesTime: boolean;
  /** Variable name when axis === 'def' (e.g. "Z", "w0") or label for z-curves (e.g. "zV") */
  definedName: string | null;
}

function normalizeOp(op: string): RelationOp {
  if (op === '≥' || op === '>=') return '>=';
  if (op === '≤' || op === '<=') return '<=';
  if (op === '>') return '>';
  if (op === '<') return '<';
  return '=';
}

function flipOp(op: RelationOp): RelationOp {
  if (op === '>') return '<';
  if (op === '<') return '>';
  if (op === '>=') return '<=';
  if (op === '<=') return '>=';
  return '=';
}

function opToTex(op: RelationOp): string {
  if (op === '>=') return '\\ge';
  if (op === '<=') return '\\le';
  return op;
}

/**
 * Splits a top-level "(exprX, exprY)" tuple respecting nested parentheses.
 */
function splitParametricTuple(str: string): [string, string] | null {
  const s = str.trim();
  if (!s.startsWith('(') || !s.endsWith(')')) return null;

  let depth = 0;
  let commaIdx = -1;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0 && i < s.length - 1) return null; // closed before end
    } else if (ch === ',' && depth === 1) {
      if (commaIdx !== -1) return null; // more than 2 elements
      commaIdx = i;
    }
  }
  if (depth !== 0 || commaIdx === -1) return null;

  const left = s.slice(1, commaIdx).trim();
  const right = s.slice(commaIdx + 1, -1).trim();
  if (!left || !right) return null;
  return [left, right];
}

/**
 * Converts friendly Unicode math symbols (π, τ, φ, √, ∛, ², ³, ×, ÷)
 * into valid mathjs syntax while preserving implicit multiplication.
 */
function normalizeMathSymbols(expr: string): string {
  let s = expr
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3');

  // Square root and cube root: √(...) -> sqrt(...), √x -> sqrt(x), ∛(...) -> cbrt(...)
  s = s.replace(/√\s*\(/g, 'sqrt(');
  s = s.replace(/√\s*([a-zA-Z0-9_.πτφ]+)/g, 'sqrt($1)');
  s = s.replace(/∛\s*\(/g, 'cbrt(');
  s = s.replace(/∛\s*([a-zA-Z0-9_.πτφ]+)/g, 'cbrt($1)');

  const greekConstants: Array<[string, string]> = [
    ['π', 'pi'],
    ['τ', 'tau'],
    ['φ', 'phi'],
  ];

  for (const [symbol, name] of greekConstants) {
    s = s.replace(new RegExp(`([0-9a-zA-Z_)])\\s*${symbol}`, 'g'), `$1*${name}`);
    s = s.replace(new RegExp(`${symbol}\\s*([0-9a-zA-Z_(])`, 'g'), `${name}*$1`);
    s = s.replace(new RegExp(symbol, 'g'), name);
  }

  return s;
}

function collectSymbols(
  node: MathNode,
  paramsSet: Set<string>,
): { usesTime: boolean } {
  let usesTime = false;
  node.traverse((child, _path, parent) => {
    if (child.type === 'SymbolNode') {
      const sym = child as MathNode & { name: string };
      const isFunctionCall =
        parent?.type === 'FunctionNode' &&
        (parent as MathNode & { fn?: MathNode }).fn === child;
      if (!isFunctionCall) {
        if (sym.name === 't') usesTime = true;
        if (!RESERVED_SYMBOLS.has(sym.name)) {
          paramsSet.add(sym.name);
        }
      }
    }
  });
  return { usesTime };
}

function parseRelationAndLhs(raw: string): {
  rhs: string;
  lhsTex: string;
  relation: RelationOp;
  axis: RelationAxis;
  definedName: string | null;
} {
  const trimmed = raw.trim();

  // 1. Parametric tuple: (x(t), y(t)) or p(t) = (x(t), y(t))
  const paramWithLhs = trimmed.match(
    /^([a-zA-Z][a-zA-Z0-9_]*(?:\s*\(\s*t\s*\))?)\s*=\s*(\(.+\))$/,
  );
  if (paramWithLhs && splitParametricTuple(paramWithLhs[2])) {
    return {
      rhs: paramWithLhs[2].trim(),
      lhsTex: `${paramWithLhs[1]} = `,
      relation: '=',
      axis: 'parametric',
      definedName: paramWithLhs[1].replace(/\s*\(\s*t\s*\)$/, ''),
    };
  }
  if (splitParametricTuple(trimmed)) {
    return {
      rhs: trimmed,
      lhsTex: '',
      relation: '=',
      axis: 'parametric',
      definedName: null,
    };
  }

  // 2. Argand-Gauss complex curve/phasor: z = expr, z(t) = expr, zV(t) = expr (lowercase z)
  const zMatch = trimmed.match(/^(z[a-zA-Z0-9_]*)(\s*\(\s*t\s*\))?\s*=\s*(.+)$/);
  if (zMatch) {
    return {
      rhs: zMatch[3].trim(),
      lhsTex: `${zMatch[1]}${zMatch[2] ?? ''} = `,
      relation: '=',
      axis: 'z',
      definedName: zMatch[1],
    };
  }

  // 3. y [op] expr OR f(x) [op] expr
  const yMatch = trimmed.match(
    /^(y|f\s*\(\s*x(?:\s*,\s*t)?\s*\))\s*(>=|<=|≥|≤|>|<|=)\s*(.+)$/i,
  );
  if (yMatch) {
    const relation = normalizeOp(yMatch[2]);
    return {
      rhs: yMatch[3].trim(),
      lhsTex: `${yMatch[1]} ${opToTex(relation)} `,
      relation,
      axis: 'y',
      definedName: null,
    };
  }

  // 4. x [op] expr (vertical line or half-plane)
  const xMatch = trimmed.match(/^x\s*(>=|<=|≥|≤|>|<|=)\s*(.+)$/i);
  if (xMatch) {
    const relation = normalizeOp(xMatch[1]);
    return {
      rhs: xMatch[2].trim(),
      lhsTex: `x ${opToTex(relation)} `,
      relation,
      axis: 'x',
      definedName: null,
    };
  }

  // 5. Reversed: expr [op] y OR expr [op] x
  const revMatch = trimmed.match(/^(.+?)\s*(>=|<=|≥|≤|>|<)\s*(y|x)$/i);
  if (revMatch) {
    const axis = revMatch[3].toLowerCase() as 'y' | 'x';
    const relation = flipOp(normalizeOp(revMatch[2]));
    return {
      rhs: revMatch[1].trim(),
      lhsTex: `${axis} ${opToTex(relation)} `,
      relation,
      axis,
      definedName: null,
    };
  }

  // 6. Auxiliary variable definition: Z = R + i*(w*L - 1/(w*C)), tauRC = R * C, p = a*(1-ecc^2)
  const defMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
  if (defMatch) {
    const varName = defMatch[1];
    if (!RESERVED_SYMBOLS.has(varName)) {
      return {
        rhs: defMatch[2].trim(),
        lhsTex: `${varName} = `,
        relation: '=',
        axis: 'def',
        definedName: varName,
      };
    }
  }

  return {
    rhs: trimmed,
    lhsTex: 'y = ',
    relation: '=',
    axis: 'y',
    definedName: null,
  };
}

export function parseFormula(raw: string): ParsedFormula {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      compiled: null,
      compiledY: null,
      latex: '',
      parameters: [],
      error: null,
      relation: '=',
      axis: 'y',
      usesTime: false,
      definedName: null,
    };
  }

  const { rhs, lhsTex, relation, axis, definedName } = parseRelationAndLhs(trimmed);
  if (!rhs) {
    return {
      compiled: null,
      compiledY: null,
      latex: '',
      parameters: [],
      error: 'Expressão incompleta',
      relation,
      axis,
      usesTime: false,
      definedName,
    };
  }

  try {
    if (axis === 'parametric') {
      const tuple = splitParametricTuple(rhs);
      if (!tuple) {
        return {
          compiled: null,
          compiledY: null,
          latex: '',
          parameters: [],
          error: 'Formato paramétrico inválido. Use (x(t), y(t))',
          relation: '=',
          axis: 'parametric',
          usesTime: false,
          definedName,
        };
      }
      const nodeX = parse(normalizeMathSymbols(tuple[0]));
      const nodeY = parse(normalizeMathSymbols(tuple[1]));
      const paramsSet = new Set<string>();
      const infoX = collectSymbols(nodeX, paramsSet);
      const infoY = collectSymbols(nodeY, paramsSet);

      let latex = '';
      try {
        latex = `${lhsTex}\\left(${nodeX.toTex({ parenthesis: 'auto' })},\\; ${nodeY.toTex({ parenthesis: 'auto' })}\\right)`;
      } catch {
        latex = trimmed;
      }

      return {
        compiled: nodeX.compile(),
        compiledY: nodeY.compile(),
        latex,
        parameters: Array.from(paramsSet).sort(),
        error: null,
        relation: '=',
        axis: 'parametric',
        usesTime: infoX.usesTime || infoY.usesTime,
        definedName,
      };
    }

    const normalized = normalizeMathSymbols(rhs);
    const node: MathNode = parse(normalized);
    const compiled = node.compile();

    const paramsSet = new Set<string>();
    const { usesTime } = collectSymbols(node, paramsSet);

    let latex = '';
    try {
      latex = `${lhsTex}${node.toTex({ parenthesis: 'auto' })}`;
    } catch {
      latex = trimmed;
    }

    return {
      compiled,
      compiledY: null,
      latex,
      parameters: Array.from(paramsSet).sort(),
      error: null,
      relation,
      axis,
      usesTime,
      definedName,
    };
  } catch (err) {
    return {
      compiled: null,
      compiledY: null,
      latex: '',
      parameters: [],
      error: err instanceof Error ? err.message : 'Erro de sintaxe',
      relation,
      axis,
      usesTime: false,
      definedName,
    };
  }
}

export function evaluateRaw(
  compiled: EvalFunction,
  scope: Record<string, unknown>,
): unknown {
  try {
    return compiled.evaluate(scope);
  } catch {
    return null;
  }
}

/**
 * Evaluates a compiled expression into a complex number { re, im }.
 * Real numbers return { re: val, im: 0 }.
 */
export function evaluateComplex(
  compiled: EvalFunction,
  scope: Record<string, unknown>,
): ComplexValue | null {
  try {
    const val = compiled.evaluate(scope);
    if (typeof val === 'number' && Number.isFinite(val)) {
      return { re: val, im: 0 };
    }
    if (
      typeof val === 'object' &&
      val !== null &&
      're' in val &&
      'im' in val
    ) {
      const re = Number((val as { re: unknown }).re);
      const im = Number((val as { im: unknown }).im);
      if (Number.isFinite(re) && Number.isFinite(im)) {
        return { re, im };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Real-only evaluation helper (used for roots/intersections and x = const boundaries).
 */
export function evaluateCompiled(
  compiled: EvalFunction,
  scope: Record<string, unknown>,
): number | null {
  const c = evaluateComplex(compiled, scope);
  if (!c) return null;
  if (Math.abs(c.im) > 1e-7) return null;
  return c.re;
}

export function formatComplex(re: number, im: number, digits = 2): string {
  const r = Math.abs(re) < 1e-9 ? 0 : re;
  const i = Math.abs(im) < 1e-9 ? 0 : im;
  if (i === 0) return r.toFixed(digits);
  if (r === 0) return `${i.toFixed(digits)}i`;
  const sign = i >= 0 ? '+' : '-';
  return `${r.toFixed(digits)} ${sign} ${Math.abs(i).toFixed(digits)}i`;
}

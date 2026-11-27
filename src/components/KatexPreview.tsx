import katex from 'katex';
import { useMemo } from 'react';

interface KatexPreviewProps {
  latex: string;
  as?: 'div' | 'span';
}

export function KatexPreview({ latex, as: Element = 'div' }: KatexPreviewProps) {
  const html = useMemo(() => {
    if (!latex) return '';
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      return '';
    }
  }, [latex]);

  if (!html) return null;

  return (
    <Element
      className="katex-preview"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

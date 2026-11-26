import katex from 'katex';
import { useMemo } from 'react';

interface KatexPreviewProps {
  latex: string;
}

export function KatexPreview({ latex }: KatexPreviewProps) {
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
    <div
      className="katex-preview"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

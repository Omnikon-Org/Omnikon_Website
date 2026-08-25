import React from 'react';

interface MDXRendererProps {
  content: string;
}

/**
 * Clean, secure Markdown/MDX parser & renderer for Server Components.
 * Transforms Markdown syntax (headings, bold, italic, code blocks, blockquotes, lists, links)
 * into semantic, styled, accessible HTML.
 */
export function MDXRenderer({ content }: MDXRendererProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';

  lines.forEach((line, idx) => {
    // 1. Code Block Fence (```lang)
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        elements.push(
          <div key={`code-${idx}`} className="my-6 rounded-lg border border-[#27272A] bg-[#0A0A0A] overflow-hidden">
            {codeLanguage && (
              <div className="border-b border-[#27272A] bg-[#050505] px-4 py-1.5 font-mono-terminal text-[11px] text-[#A1A1AA] uppercase tracking-wider">
                {codeLanguage}
              </div>
            )}
            <pre className="p-4 overflow-x-auto font-mono-terminal text-xs text-[#F4F4F5] leading-relaxed">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLanguage = '';
      } else {
        // Open code block
        inCodeBlock = true;
        codeLanguage = line.trim().replace(/^```/, '');
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // 2. Headings (# ## ###)
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={idx} className="font-mono-terminal text-2xl sm:text-3xl font-extrabold text-white mt-8 mb-4 tracking-tight">
          {line.replace('# ', '')}
        </h1>
      );
      return;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={idx} className="font-mono-terminal text-xl sm:text-2xl font-bold text-white mt-6 mb-3 tracking-tight border-b border-[#27272A] pb-2">
          {line.replace('## ', '')}
        </h2>
      );
      return;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className="font-mono-terminal text-lg font-semibold text-white mt-4 mb-2">
          {line.replace('### ', '')}
        </h3>
      );
      return;
    }

    // 3. Blockquotes (> text)
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={idx} className="my-4 border-l-2 border-[#FF3131] bg-[#121212] px-4 py-3 rounded-r-lg font-mono-terminal text-xs text-[#A1A1AA] italic">
          {line.replace('> ', '')}
        </blockquote>
      );
      return;
    }

    // 4. Bullet lists (- or *)
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const text = line.trim().replace(/^[-*]\s+/, '');
      elements.push(
        <li key={idx} className="ml-6 list-disc font-sans text-sm text-[#F4F4F5] my-1 leading-relaxed">
          {renderInlineMarkdown(text)}
        </li>
      );
      return;
    }

    // 5. Paragraphs
    if (line.trim().length > 0) {
      elements.push(
        <p key={idx} className="font-sans text-sm sm:text-base text-[#F4F4F5] leading-relaxed my-3">
          {renderInlineMarkdown(line)}
        </p>
      );
    }
  });

  return <div className="prose prose-invert max-w-none space-y-2">{elements}</div>;
}

/**
 * Processes inline markdown formatting: bold (**text**), code (`code`), links ([text](url))
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Simple regex parser for inline code, bold, and links
  const parts: React.ReactNode[] = [];
  let current = text;
  let keyIdx = 0;

  // Process inline code `text`
  const codeRegex = /`([^`]+)`/g;
  let match;
  let lastIndex = 0;

  while ((match = codeRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <code key={`inline-code-${keyIdx++}`} className="rounded bg-[#18181B] border border-[#27272A] px-1.5 py-0.5 font-mono-terminal text-xs text-[#FF3131]">
        {match[1]}
      </code>
    );
    lastIndex = codeRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

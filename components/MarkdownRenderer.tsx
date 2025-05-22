import React from 'react';
import ReactMarkdown, { Options as ReactMarkdownOptions } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { MedicalTerm } from '../types';

// Function to escape special characters for regex
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Core highlighting logic
export const processTextForHighlighting = (
  textNodeValue: string,
  glossary: MedicalTerm[] | null,
  onTermClick: (term: MedicalTerm) => void
): React.ReactNode[] => {
  if (!glossary || glossary.length === 0 || !textNodeValue) {
    return [textNodeValue];
  }

  let parts: (string | React.ReactElement)[] = [textNodeValue];
  const sortedGlossary = [...glossary].sort((a, b) => b.term.length - a.term.length);

  sortedGlossary.forEach(termObj => {
    const newParts: (string | React.ReactElement)[] = [];
    const termRegex = new RegExp(`\\b(${escapeRegExp(termObj.term)})\\b`, 'gi');

    parts.forEach(part => {
      if (typeof part === 'string') {
        const subParts = part.split(termRegex);
        subParts.forEach((subPart, index) => {
          if (index % 2 === 1) { // This is a matched term
            newParts.push(
              <span
                key={`${termObj.term}-${Math.random()}`}
                className="text-accent-purple font-semibold cursor-pointer hover:underline"
                title={termObj.definition}
                onClick={(e) => {
                    e.stopPropagation();
                    onTermClick(termObj);
                }}
                tabIndex={0}
                onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        onTermClick(termObj);
                    }
                }}
                role="button"
                aria-label={`Definition for ${termObj.term}`}
              >
                {subPart}
              </span>
            );
          } else if (subPart) {
            newParts.push(subPart);
          }
        });
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;
  });
  return parts;
};

interface CustomMarkdownProps {
  markdownContent: string;
  glossary?: MedicalTerm[] | null;
  onTermClick?: (term: MedicalTerm) => void;
  className?: string;
  // Allow passing other react-markdown props if needed via components prop
  components?: ReactMarkdownOptions['components'];
}

export const CustomMarkdown: React.FC<CustomMarkdownProps> = ({
  markdownContent,
  glossary,
  onTermClick,
  className,
  components: additionalComponents
}) => {
  const createRenderer = (elementType: keyof JSX.IntrinsicElements) => {
    const Element = elementType;
    return ({ node, children, ...props }: any) => {
      const processedChildren = React.Children.map(children, child => {
        if (typeof child === 'string' && glossary && onTermClick) {
          return processTextForHighlighting(child, glossary, onTermClick);
        }
        return child;
      });
      // @ts-ignore
      return <Element {...props}>{processedChildren}</Element>;
    };
  };

  const componentsConfig: ReactMarkdownOptions['components'] = { ...additionalComponents };

  if (glossary && onTermClick) {
    componentsConfig.p = createRenderer('p');
    componentsConfig.li = createRenderer('li');
    // Add more elements if needed for highlighting, e.g., h1-h6, table cells
    // componentsConfig.h1 = createRenderer('h1');
    // componentsConfig.h2 = createRenderer('h2');
    // componentsConfig.td = createRenderer('td');
  }
  
  // Default styling for common markdown elements
  const defaultComponents: ReactMarkdownOptions['components'] = {
    h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-4" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-xl font-semibold my-3" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-lg font-semibold my-2" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc list-inside pl-4 my-2 space-y-1" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal list-inside pl-4 my-2 space-y-1" {...props} />,
    p: ({node, ...props}) => <p className="my-2 leading-relaxed" {...props} />,
    strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
    em: ({node, ...props}) => <em className="italic" {...props} />,
    a: ({node, ...props}) => <a className="text-accent-purple hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
    ...componentsConfig // User-defined highlighting components take precedence
  };


  return (
    <div className={className}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={defaultComponents}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

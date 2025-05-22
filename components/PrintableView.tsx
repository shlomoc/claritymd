import React from 'react';
import { MedicalTerm, QAPair, PrintSelections, Source } from '../types';
import { CustomMarkdown } from './MarkdownRenderer';

interface PrintableViewProps {
  originalDocText: string | null;
  translatedDocText: string | null;
  glossary: MedicalTerm[] | null;
  qaHistory: QAPair[];
  selections: PrintSelections;
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

export const PrintableView: React.FC<PrintableViewProps> = ({
  originalDocText,
  translatedDocText,
  glossary,
  qaHistory,
  selections,
}) => {
  const currentDate = formatDate(new Date());

  const renderSources = (sources?: Source[]) => {
    if (!sources || sources.length === 0) return null;
    return (
      <div className="print-sources mt-1">
        <h5 style={{ fontSize: '10pt', fontWeight: 'bold', marginTop: '5px', marginBottom: '2px' }}>Sources:</h5>
        <ul style={{ listStyle: 'none', paddingLeft: '0', fontSize: '9pt' }}>
          {sources.map((source, idx) => (
            <li key={`source-${idx}`} className="no-print-link-url">
              <a href={source.uri} target="_blank" rel="noopener noreferrer">
                {source.title || source.uri}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div id="printable-area">
      <h1>ClarityMD Report</h1>
      <p><em>Date Generated: {currentDate}</em></p>

      {selections.includeOriginal && originalDocText && (
        <div className="print-section page-break-before">
          <h2>Original Document Text</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '10pt', border: '1px solid #eee', padding: '10px', backgroundColor: '#f9f9f9' }}>
            {originalDocText}
          </pre>
        </div>
      )}

      {selections.includeTranslation && translatedDocText && (
        <div className="print-section page-break-before">
          <h2>Plain Language Translation</h2>
          <CustomMarkdown markdownContent={translatedDocText} className="prose-print" />
        </div>
      )}

      {selections.includeGlossary && glossary && glossary.length > 0 && (
        <div className="print-section page-break-before">
          <h2>Glossary of Medical Terms</h2>
          {glossary.map((term, index) => (
            <div key={`glossary-print-${index}`} className="glossary-item-print" style={{ marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px dotted #eee' }}>
              <h4 style={{ fontWeight: 'bold', fontSize: '12pt' }}>{term.term}</h4>
              <p style={{ fontSize: '11pt', margin: '0' }}>{term.definition}</p>
            </div>
          ))}
        </div>
      )}

      {selections.includeQA && qaHistory && qaHistory.length > 0 && (
        <div className="print-section page-break-before">
          <h2>Questions & Answers</h2>
          {qaHistory.map((item) => (
            <div key={`qa-print-${item.id}`} className="qa-pair-print" style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #ddd' }}>
              {!item.isBot && (
                <p style={{ fontWeight: 'bold', fontSize: '11pt', color: '#555' }}>
                  <strong>You asked:</strong> {item.question}
                </p>
              )}
              {item.isBot && (
                <div style={{ marginTop: '5px' }}>
                   <p style={{ fontWeight: 'bold', fontSize: '11pt', color: '#0056b3', marginBottom:'3px' }}>
                    <strong>ClarityMD answered (re: "{item.question}"):</strong>
                  </p>
                  <CustomMarkdown markdownContent={item.answer} className="prose-print-qa" />
                  {renderSources(item.sources)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {( !selections.includeOriginal && !selections.includeTranslation && !selections.includeGlossary && !selections.includeQA) && (
        <p>No content selected for the report.</p>
      )}

      <div className="print-disclaimer page-break-avoid">
        <p>
          <strong>Disclaimer:</strong> This information is for general knowledge only and should not be considered medical advice. 
          Please consult with a healthcare professional for any medical concerns.
        </p>
        <p>&copy; {new Date().getFullYear()} ClarityMD. Powered by AI.</p>
      </div>
    </div>
  );
};

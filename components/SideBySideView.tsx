
import React, { useState } from 'react';
import { MedicalTerm } from '../types';
import { CustomMarkdown } from './MarkdownRenderer'; // processTextForHighlighting is used within CustomMarkdown

interface SideBySideViewProps {
  displayedOriginalText: string; // Changed from originalText
  translatedText: string;
  glossary: MedicalTerm[] | null;
}

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

export const SideBySideView: React.FC<SideBySideViewProps> = ({ displayedOriginalText, translatedText, glossary }) => {
  const [activeDefinition, setActiveDefinition] = useState<MedicalTerm | null>(null);

  const handleTermClick = (term: MedicalTerm) => {
    setActiveDefinition(term);
  };

  const handleCloseDefinition = () => {
    setActiveDefinition(null);
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-700 mb-3">Document Comparison</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h4 className="text-lg font-medium text-gray-600 mb-2 border-b pb-2">Original Document (Doctor-Speak)</h4>
          <div className="text-sm text-gray-700 leading-relaxed max-h-96 overflow-y-auto p-2 bg-white rounded">
            <CustomMarkdown
              markdownContent={displayedOriginalText}
              glossary={glossary}
              onTermClick={handleTermClick}
              className="prose prose-sm max-w-none" 
            />
          </div>
        </div>
        <div className="bg-teal-50 p-4 rounded-lg shadow border border-primary-teal">
          <h4 className="text-lg font-medium text-primary-teal mb-2 border-b border-teal-200 pb-2">Plain Language Version (Plain-Speak)</h4>
          <div className="text-sm text-gray-800 leading-relaxed max-h-96 overflow-y-auto p-2 bg-white rounded">
            <CustomMarkdown 
              markdownContent={translatedText} 
              glossary={glossary} 
              onTermClick={handleTermClick}
              className="prose prose-sm max-w-none"
            />
          </div>
        </div>
      </div>

      {activeDefinition && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-md border border-accent-purple relative" role="dialog" aria-modal="true" aria-labelledby="definition-title">
          <div className="flex justify-between items-center mb-2">
            <h4 id="definition-title" className="text-lg font-semibold text-accent-purple">{activeDefinition.term}</h4>
            <button 
                onClick={handleCloseDefinition} 
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                aria-label="Close definition"
            >
              <CloseIcon />
            </button>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{activeDefinition.definition}</p>
        </div>
      )}
    </div>
  );
};

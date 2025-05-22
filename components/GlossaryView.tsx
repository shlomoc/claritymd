
import React from 'react';
import { MedicalTerm } from '../types';

interface GlossaryViewProps {
  terms: MedicalTerm[];
}

export const GlossaryView: React.FC<GlossaryViewProps> = ({ terms }) => {
  if (!terms || terms.length === 0) {
    // Return a message if no terms, consistent with App.tsx logic
    return null; 
  }

  return (
    <div className="mt-6"> {/* Ensure consistent margin */}
      <h3 className="text-xl font-semibold text-gray-700 mb-3">Medical Terms Explained</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg shadow">
        {terms.map((item, index) => (
          <div key={index} className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
            <h4 className="font-semibold text-primary-teal">{item.term}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{item.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

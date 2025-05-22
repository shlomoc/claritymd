import React from 'react';
import { PrintSelections } from '../types';

interface PrintOptionsModalProps {
  isOpen: boolean;
  selections: PrintSelections;
  onSelectionChange: (selection: keyof PrintSelections) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

// Checkbox Icons
const CheckboxCheckedIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z" clipRule="evenodd" />
  </svg>
);

const CheckboxUncheckedIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" strokeWidth="1.5" stroke="currentColor" className={className || "w-5 h-5"}>
    <circle cx="10" cy="10" r="7.25" strokeLinejoin="round" strokeLinecap="round"/>
  </svg>
);


export const PrintOptionsModal: React.FC<PrintOptionsModalProps> = ({
  isOpen,
  selections,
  onSelectionChange,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const CheckboxItem: React.FC<{
    label: string;
    value: keyof PrintSelections;
    checked: boolean;
  }> = ({ label, value, checked }) => (
    <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-100 rounded-md">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onSelectionChange(value)}
        className="sr-only" // Hide actual checkbox, style custom one
      />
      {checked ? <CheckboxCheckedIcon className="w-6 h-6 text-primary-teal" /> : <CheckboxUncheckedIcon className="w-6 h-6 text-gray-400" />}
      <span className="text-gray-700">{label}</span>
    </label>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-md transform transition-all duration-300 ease-in-out scale-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create PDF Report</h2>
        <div className="space-y-4 mb-8">
          <CheckboxItem label="Original Document Text" value="includeOriginal" checked={selections.includeOriginal} />
          <CheckboxItem label="Plain Language Translation" value="includeTranslation" checked={selections.includeTranslation} />
          <CheckboxItem label="Glossary of Medical Terms" value="includeGlossary" checked={selections.includeGlossary} />
          <CheckboxItem label="Full Q&A History" value="includeQA" checked={selections.includeQA} />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-primary-teal text-white font-semibold rounded-md hover:bg-teal-700 transition-colors"
          >
            Generate & Print PDF
          </button>
        </div>
      </div>
    </div>
  );
};

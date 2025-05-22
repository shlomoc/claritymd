import React, { useState, useCallback, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf.mjs";


// Set the worker source for pdf.js. This is crucial for the library to function.
// Using the esm.sh CDN path for the worker.
const PDF_WORKER_SRC = 'https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.mjs';
GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;

interface DocumentUploaderProps {
  onProcessDocument: (text: string) => void;
  isLoading: boolean; // This prop now refers to AI processing in App.tsx
}

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.32 5.75 5.75 0 0 1 4.966 7.287" />
    </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);


export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onProcessDocument, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setFileError(null);
      } else {
        setSelectedFile(null);
        setFileError('Invalid file type. Please upload a PDF file.');
      }
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  const handleAnalyzeFile = useCallback(async () => {
    if (!selectedFile || isParsing || isLoading) {
      return;
    }

    setIsParsing(true);
    setFileError(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = getDocument({ data: arrayBuffer });
      const pdfDocument = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
        if (i < pdfDocument.numPages) {
          fullText += '\n\n'; // Add double newline as page separator
        }
      }
      onProcessDocument(fullText.trim());
    } catch (error: any) {
      console.error('Error parsing PDF:', error);
      setFileError(`Failed to parse PDF: ${error.message || 'Unknown error'}. Please ensure it's a valid, text-based PDF.`);
    } finally {
      setIsParsing(false);
    }
  }, [selectedFile, isParsing, isLoading, onProcessDocument]);

  const buttonDisabled = isParsing || isLoading || !selectedFile;
  let buttonText = 'Analyze Document';
  if (isParsing) {
    buttonText = 'Parsing PDF...';
  } else if (isLoading) {
    // isLoading from App.tsx (AI processing)
    buttonText = 'Processing...';
  }

  return (
    <div className="space-y-4">
      <label
        htmlFor="pdf-upload"
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer 
                   ${isParsing || isLoading ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'} 
                   ${fileError ? 'border-red-400' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon className={`w-10 h-10 mb-3 ${fileError ? 'text-red-500' : 'text-gray-400'}`} />
          {!selectedFile && (
            <>
              <p className={`mb-2 text-sm ${fileError ? 'text-red-600' : 'text-gray-500'}`}>
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className={`text-xs ${fileError ? 'text-red-500' : 'text-gray-400'}`}>PDF files only</p>
            </>
          )}
          {selectedFile && !fileError && (
            <p className="text-sm text-gray-700 font-medium">{selectedFile.name}</p>
          )}
          {fileError && (
             <p className="text-sm text-red-600 mt-1 px-2 text-center">{fileError}</p>
          )}
        </div>
        <input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          disabled={isParsing || isLoading}
        />
      </label>

      {selectedFile && (
        <div className="flex items-center justify-between p-2 bg-teal-50 border border-primary-teal rounded-md text-sm">
            <span className="text-primary-teal font-medium truncate" title={selectedFile.name}>
                Selected: {selectedFile.name}
            </span>
            <button 
                onClick={clearSelectedFile} 
                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                disabled={isParsing || isLoading}
                aria-label="Clear selected file"
            >
                <XCircleIcon className="w-5 h-5"/>
            </button>
        </div>
      )}
      
      <button
        onClick={handleAnalyzeFile}
        disabled={buttonDisabled}
        className="w-full sm:w-auto px-6 py-3 bg-primary-teal text-white font-semibold rounded-md shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-primary-teal focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 ease-in-out flex items-center justify-center"
      >
        {isParsing || isLoading ? (
          <>
            <LoadingSpinner size="sm" color="text-white" />
            <span className="ml-2">{buttonText}</span>
          </>
        ) : (
          buttonText
        )}
      </button>
    </div>
  );
};
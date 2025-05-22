
import React, { useState, useCallback, useEffect } from 'react';
import { DocumentUploader } from './components/DocumentUploader';
import { SideBySideView } from './components/SideBySideView';
import { GlossaryView } from './components/GlossaryView';
import { QASession } from './components/QASession';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Section } from './components/Section';
import { PrintOptionsModal } from './components/PrintOptionsModal';
import { PrintableView } from './components/PrintableView';
import { MedicalTerm, QAPair, PrintSelections } from './types';
import { translateText, generateGlossary, getAnswer, reformatDocumentText } from './services/geminiService';

// Icons
const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
  </svg>
);

const LightBulbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.355a7.5 7.5 0 0 1-4.5 0m4.5 0v-.75A7.5 7.5 0 0 0 12 6V5.25a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75V6m0 0a7.5 7.5 0 0 0 3.75 2.065M12 6v7.5a7.5 7.5 0 0 0 3.75 2.065m0 0A7.5 7.5 0 0 1 12 18c-2.276 0-4.227-.998-5.568-2.578m11.136-2.065A7.525 7.525 0 0 0 12 6.002V5.25a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75V6M3.75 15.75c0-.098.015-.194.043-.288M12 18.75h.008v.008H12v-.008Z" />
  </svg>
);

const QuestionMarkCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
  </svg>
);

const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
</svg>
);

const PrintIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0c1.273 0 2.36-.936 2.36-2.209v-2.789c0-1.273-.936-2.209-2.36-2.209H6.34c-1.273 0-2.36.936-2.36 2.209v2.789c0 1.273.936 2.209 2.36 2.209Zm.707-9.495A1.125 1.125 0 1 0 13.5 3.75V6.108c0 .621.504 1.125 1.125 1.125h3.75c.621 0 1.125-.504 1.125-1.125V3.75a1.125 1.125 0 0 0-.707-.995h0Z" />
  </svg>
);


const App: React.FC = () => {
  const [originalDocText, setOriginalDocText] = useState<string>('');
  const [reformattedOriginalDocText, setReformattedOriginalDocText] = useState<string | null>(null);
  const [translatedDocText, setTranslatedDocText] = useState<string | null>(null);
  const [glossary, setGlossary] = useState<MedicalTerm[] | null>(null);
  const [qaHistory, setQaHistory] = useState<QAPair[]>([]);

  const [isLoadingReformatting, setIsLoadingReformatting] = useState<boolean>(false);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState<boolean>(false);
  const [isLoadingGlossary, setIsLoadingGlossary] = useState<boolean>(false);
  const [isLoadingQA, setIsLoadingQA] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState<boolean>(false);

  // Print state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [printSelections, setPrintSelections] = useState<PrintSelections>({
    includeOriginal: true,
    includeTranslation: true,
    includeGlossary: true,
    includeQA: true,
  });
  const [isPrinting, setIsPrinting] = useState<boolean>(false);


  useEffect(() => {
    if (!process.env.API_KEY) {
      setIsApiKeyMissing(true);
    }
  }, []);

  const handleProcessDocument = useCallback(async (text: string) => {
    if (isApiKeyMissing) {
      setError("API_KEY environment variable is not set. Please ensure it is configured for the application to function.");
      return;
    }
    setOriginalDocText(text); // Raw text for processing
    setReformattedOriginalDocText(null); // Will be set after reformatting
    setTranslatedDocText(null);
    setGlossary(null);
    setQaHistory([]);
    setError(null);
    setIsLoadingReformatting(true);
    setIsLoadingTranslation(true);
    setIsLoadingGlossary(true);

    let accumulatedError = "";

    try {
      const reformattingPromise = reformatDocumentText(text).then(result => {
        setReformattedOriginalDocText(result);
        setIsLoadingReformatting(false);
      }).catch(reformattingError => {
        console.error('Reformatting Error:', reformattingError);
        // Fallback to original text for display if reformatting fails
        setReformattedOriginalDocText(text); 
        accumulatedError += `Failed to reformat original document: ${(reformattingError as Error).message}\n`;
        setIsLoadingReformatting(false);
      });

      const translationPromise = translateText(text).then(result => {
        setTranslatedDocText(result);
      }).catch(translationError => {
        console.error('Translation Error:', translationError);
        accumulatedError += `Failed to translate document: ${(translationError as Error).message}\n`;
      });

      const glossaryPromise = generateGlossary(text).then(result => {
        setGlossary(result);
      }).catch(glossaryError => {
        console.error('Glossary Error:', glossaryError);
        accumulatedError += `Failed to generate glossary: ${(glossaryError as Error).message}\n`;
      });
      
      await Promise.allSettled([reformattingPromise, translationPromise, glossaryPromise]);

    } catch (e: any) { // Should not be reached if individual promises handle errors
      console.error('General Processing Error:', e);
      accumulatedError += (e.message || 'An unexpected error occurred during document processing.') + '\n';
    } finally {
      setIsLoadingTranslation(false); // These will be false if their promises resolved/rejected
      setIsLoadingGlossary(false);
      // isLoadingReformatting is set within its own promise chain
      if (accumulatedError) {
        setError(accumulatedError.trim());
      }
    }
  }, [isApiKeyMissing]);

  const handleAskQuestion = useCallback(async (question: string) => {
    if (isApiKeyMissing) {
      setError("API_KEY environment variable is not set. Please ensure it is configured for the application to function.");
      return;
    }
    if (!originalDocText) {
      setError("Please process a document before asking questions.");
      return;
    }
    setError(null);
    setIsLoadingQA(true);

    const userQAPair: QAPair = { id: `user-${Date.now()}`, question, answer: '', isBot: false };
    setQaHistory(prev => [...prev, userQAPair]);

    try {
      const result = await getAnswer(question, originalDocText); // Q&A uses raw original text
      const botQAPair: QAPair = { id: `bot-${Date.now()}`, question, answer: result.text, sources: result.sources, isBot: true };
      setQaHistory(prev => [...prev, botQAPair]);
    } catch (e: any) {
      console.error('Q&A Error:', e);
      const errorQAPair: QAPair = { id: `error-${Date.now()}`, question, answer: `Error: ${e.message || 'Failed to get an answer.'}`, isBot: true };
      setQaHistory(prev => [...prev, errorQAPair]);
      setError(`Failed to get answer: ${e.message}`);
    } finally {
      setIsLoadingQA(false);
    }
  }, [originalDocText, isApiKeyMissing]);

  const togglePrintModal = () => setIsPrintModalOpen(!isPrintModalOpen);

  const handlePrintSelectionChange = (selection: keyof PrintSelections) => {
    setPrintSelections(prev => ({ ...prev, [selection]: !prev[selection] }));
  };

  const handleConfirmPrint = () => {
    setIsPrintModalOpen(false);
    setIsPrinting(true);
  };

  useEffect(() => {
    if (isPrinting) {
      const timer = setTimeout(() => {
        window.print();
        setIsPrinting(false); 
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPrinting]);

  const overallIsLoading = isLoadingReformatting || isLoadingTranslation || isLoadingGlossary;

  if (isPrinting) {
    return (
      <PrintableView
        originalDocText={originalDocText} // Print raw original text
        translatedDocText={translatedDocText}
        glossary={glossary}
        qaHistory={qaHistory}
        selections={printSelections}
      />
    );
  }

  return (
    <div className="min-h-screen bg-secondary-gray text-gray-800 font-sans p-4 md:p-8 flex flex-col">
      <header className="mb-8 text-center flex justify-between items-center">
        <div></div> 
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-teal">ClarityMD</h1>
          <p className="text-lg text-gray-600 mt-2">Your guide to understanding medical documents.</p>
        </div>
        <button
          onClick={togglePrintModal}
          className="p-2 text-primary-teal hover:text-teal-700 transition-colors"
          aria-label="Print or Save Report"
          title="Print or Save Report"
          disabled={!originalDocText}
        >
          <PrintIcon className="w-7 h-7" />
        </button>
      </header>

      {isApiKeyMissing && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center max-w-4xl mx-auto">
          <AlertTriangleIcon className="w-6 h-6 mr-3 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">API Key Missing</h3>
            <p className="text-sm">The <code>API_KEY</code> environment variable is not configured. ClarityMD features relying on the API will not function. Please ensure this environment variable is properly set in the execution environment.</p>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto space-y-8 w-full flex-grow">
        <Section title="Upload Your Medical Document" icon={<DocumentTextIcon className="w-8 h-8"/>}>
          <DocumentUploader onProcessDocument={handleProcessDocument} isLoading={overallIsLoading && !!originalDocText} />
        </Section>

        {error && (
          <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
            <h3 className="font-bold">Error</h3>
            <pre className="whitespace-pre-wrap text-sm">{error}</pre>
          </div>
        )}
        
        {originalDocText && overallIsLoading && !(reformattedOriginalDocText && translatedDocText && glossary) && (
          <div className="flex justify-center items-center p-10">
            <LoadingSpinner />
            <p className="ml-4 text-lg text-gray-600">Analyzing your document...</p>
          </div>
        )}
        
        {originalDocText && (reformattedOriginalDocText || translatedDocText || glossary) && !overallIsLoading && (
          <Section title="Simplified View & Glossary" icon={<LightBulbIcon className="w-8 h-8"/>}>
            <div className="space-y-6">
              {(isLoadingReformatting || isLoadingTranslation) && !(reformattedOriginalDocText && translatedDocText) && <div className="flex items-center"><LoadingSpinner size="sm"/> <span className="ml-2">Preparing document views...</span></div>}
              {(reformattedOriginalDocText || originalDocText) && translatedDocText && (
                <SideBySideView 
                  displayedOriginalText={reformattedOriginalDocText || originalDocText} 
                  translatedText={translatedDocText} 
                  glossary={glossary} 
                />
              )}
              {isLoadingGlossary && !glossary && <div className="flex items-center mt-4"><LoadingSpinner size="sm"/> <span className="ml-2">Generating glossary...</span></div>}
              {glossary && glossary.length > 0 && (
                <GlossaryView terms={glossary} />
              )}
              {glossary && glossary.length === 0 && !isLoadingGlossary && (
                <p className="text-gray-600 mt-4">No specific medical terms requiring explanation were identified in this document.</p>
              )}
            </div>
          </Section>
        )}

        {originalDocText && (reformattedOriginalDocText || translatedDocText || glossary) && !overallIsLoading && (
          <Section title="Ask Clarifying Questions" icon={<QuestionMarkCircleIcon className="w-8 h-8"/>}>
            <QASession
              qaHistory={qaHistory}
              onAskQuestion={handleAskQuestion}
              isLoading={isLoadingQA}
              disabled={isApiKeyMissing || !originalDocText}
            />
          </Section>
        )}
      </main>

      <footer className="mt-12 py-6 border-t border-gray-300 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} ClarityMD. Powered by AI.</p>
        <p className="mt-2 max-w-3xl mx-auto px-4">
          This information is for general knowledge only and should not be considered medical advice. 
          Please consult with a healthcare professional for any medical concerns.
        </p>
      </footer>

      {isPrintModalOpen && (
        <PrintOptionsModal
          isOpen={isPrintModalOpen}
          selections={printSelections}
          onSelectionChange={handlePrintSelectionChange}
          onConfirm={handleConfirmPrint}
          onCancel={togglePrintModal}
        />
      )}
    </div>
  );
};

export default App;

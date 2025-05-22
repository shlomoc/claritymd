import React, { useState, useRef, useEffect } from 'react';
import { QAPair, Source } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { CustomMarkdown } from './MarkdownRenderer'; // Import CustomMarkdown

interface QASessionProps {
  qaHistory: QAPair[];
  onAskQuestion: (question: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const LinkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
);

export const QASession: React.FC<QASessionProps> = ({ qaHistory, onAskQuestion, isLoading, disabled }) => {
  const [question, setQuestion] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading && !disabled) {
      onAskQuestion(question.trim());
      setQuestion('');
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [qaHistory]);

  const getHostname = (uri: string): string => {
    try {
      const url = new URL(uri);
      return url.hostname;
    } catch (error) {
      // If URI is not a valid URL, return the original URI
      return uri;
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-grow overflow-y-auto p-4 bg-gray-50 rounded-t-lg shadow space-y-4 mb-px">
        {qaHistory.length === 0 && !disabled && (
            <p className="text-center text-gray-500">Ask any questions you have about the document.</p>
        )}
        {qaHistory.length === 0 && disabled && (
            <p className="text-center text-gray-500">Process a document to enable Q&A.</p>
        )}
        {qaHistory.map((item) => (
          <div key={item.id} className={`flex ${item.isBot ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-[80%] p-3 rounded-xl shadow ${
                item.isBot
                  ? 'bg-white text-gray-700 rounded-bl-none border border-gray-200'
                  : 'bg-accent-purple text-white rounded-br-none'
              }`}
            >
              {item.isBot ? (
                <CustomMarkdown markdownContent={item.answer} className="text-sm leading-relaxed qa-answer-markdown" />
              ) : (
                <p className="text-sm whitespace-pre-wrap">{item.question}</p>
              )}
              {item.isBot && item.sources && item.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <h5 className="text-xs font-semibold text-gray-500 mb-1">Sources:</h5>
                  <ul className="space-y-1">
                    {item.sources.map((source, idx) => (
                      <li key={idx} className="text-xs">
                        <a
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={source.uri}
                          className="text-accent-purple hover:text-purple-700 hover:underline flex items-center transition-colors"
                        >
                          <LinkIcon className="w-3 h-3 mr-1 flex-shrink-0" /> 
                          <span>{source.title && source.title.trim() !== "" ? source.title : getHostname(source.uri)}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex p-4 bg-white border-t border-gray-200 rounded-b-lg shadow-md">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={disabled ? "Process a document first..." : "Type your question..."}
          className="flex-grow p-3 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-teal focus:border-primary-teal transition-shadow disabled:bg-gray-100"
          disabled={isLoading || disabled}
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim() || disabled}
          className="px-6 py-3 bg-primary-teal text-white font-semibold rounded-r-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-primary-teal focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 ease-in-out flex items-center justify-center"
        >
          {isLoading ? <LoadingSpinner size="sm" color="text-white" /> : 'Ask'}
        </button>
      </form>
    </div>
  );
};

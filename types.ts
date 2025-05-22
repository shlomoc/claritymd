export interface MedicalTerm {
  term: string;
  definition: string;
}

export interface Source {
  uri: string;
  title: string;
}

export interface QAPair {
  id: string;
  question: string;
  answer: string;
  sources?: Source[];
  isBot: boolean; // true for AI answers, false for user questions
}

export interface PrintSelections {
  includeOriginal: boolean;
  includeTranslation: boolean;
  includeGlossary: boolean;
  includeQA: boolean;
}

declare module 'pdfjs-dist/build/pdf.mjs' {
  export function getDocument(params: { data: ArrayBuffer }): {
    promise: Promise<{
      numPages: number;
      getPage: (pageNumber: number) => Promise<{
        getTextContent: () => Promise<{
          items: Array<{ str?: string }>;
        }>;
      }>;
    }>;
  };

  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
} 
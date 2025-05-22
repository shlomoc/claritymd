# ClarityMD

ClarityMD is an application that translates medical documents from complex "doctor-speak" into plain, easy-to-understand language.

## Core Features

- **Document Upload**: Upload medical documents for translation
- **Plain Language Translation**: AI-powered translation of medical jargon into plain language
- **Side-by-Side View**: See original and simplified versions side-by-side
- **Interactive Glossary**: Access an AI-generated glossary of medical terms found in your document
- **Private Q&A**: Ask clarifying questions about your translated document, with all conversations kept private in your browser

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```
   npm install
   ```

2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key

3. Run the app:
   ```
   npm run dev
   ```

## Tech Stack

- Frontend: React with TypeScript
- AI Translation: Google Gemini API
- Styling: Custom CSS with a focus on readability and accessibility

## Design
- **UI/UX**: Clean, intuitive layout focused on readability and ease of navigation

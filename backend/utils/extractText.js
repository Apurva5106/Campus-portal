// Extracts raw text from an uploaded resume file (PDF or plain text based)
const fs = require('fs');
const path = require('path');

const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (ext === '.pdf') {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text || '';
    }
    // For .txt (and a naive fallback for .doc/.docx -- for production use a
    // proper docx parser like `mammoth`), just read raw bytes as text.
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error('Text extraction failed:', err.message);
    return '';
  }
};

module.exports = extractTextFromFile;

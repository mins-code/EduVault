const pdfParse = require('pdf-parse');

/**
 * Detects category based on text content using permissive OR logic
 */
const detectCategory = (text) => {
    const lowerText = text.toLowerCase();

    // Projects: 'project' OR 'implementation' OR 'github'
    if (lowerText.includes('project') || lowerText.includes('implementation') || lowerText.includes('github')) {
        return 'Projects';
    }

    // Internships: 'internship' OR 'completion' OR 'training'
    if (lowerText.includes('internship') || lowerText.includes('completion') || lowerText.includes('training')) {
        return 'Internships';
    }

    // Certifications: 'certificate' OR 'participation'
    if (lowerText.includes('certificate') || lowerText.includes('participation')) {
        return 'Certifications';
    }

    return null;
};

/**
 * Extracts title from text (first non-empty line)
 */
const extractTitle = (text) => {
    const lines = text.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length > 0) {
            // Limit title length to 100 characters
            return trimmed.substring(0, 100);
        }
    }
    return null;
};

/**
 * Extracts description with robust fallback
 */
const extractDescription = (text) => {
    if (!text || text.trim().length === 0) return null;

    const cleanText = text.replace(/\s+/g, ' ').trim();

    // Try sentence-based extraction first
    const sentenceRegex = /[^.!?]+[.!?]+/g;
    const sentences = cleanText.match(sentenceRegex) || [];

    // Filter for meaningful sentences (at least 10 chars)
    const meaningfulSentences = sentences
        .map(s => s.trim())
        .filter(s => s.length >= 10)
        .slice(0, 3);

    if (meaningfulSentences.length > 0) {
        return meaningfulSentences.join(' ').substring(0, 500);
    }

    // Fallback: Use first 300 characters of raw text if no sentences found
    // This ensures we never return null if there is text
    return cleanText.substring(0, 300);
};

/**
 * Main function to extract content from PDF buffer
 */
const extractPDFContent = async (buffer) => {
    console.log('🔍 extractPDFContent called');
    console.log('📦 Buffer type:', typeof buffer);
    console.log('📦 Buffer length:', buffer?.length);

    try {
        console.log('⏳ Calling pdf-parse...');
        const data = await pdfParse(buffer);

        console.log('✅ pdf-parse returned successfully');
        console.log('📄 Pages:', data.numpages);
        console.log('📝 Text type:', typeof data.text);
        console.log('📝 Text length:', data.text?.length);

        const text = data.text || '';

        console.log('📝 Raw PDF Text Length:', text.length);
        console.log('📝 First 500 chars:', text.substring(0, 500));

        if (!text || text.trim().length === 0) {
            console.warn('⚠️ PDF has no selectable text (likely scanned).');
            return {
                derivedTitle: null,
                derivedDescription: null,
                suggestedCategory: null,
                extractedText: ''
            };
        }

        const title = extractTitle(text);
        const description = extractDescription(text);
        const category = detectCategory(text);

        console.log('🏷️ Extracted title:', title);
        console.log('📋 Extracted description length:', description?.length);
        console.log('📁 Detected category:', category);

        return {
            derivedTitle: title,
            derivedDescription: description,
            suggestedCategory: category,
            extractedText: text
        };

    } catch (error) {
        console.error('❌ Error parsing PDF:', error.message);
        console.error('❌ Error stack:', error.stack);
        return {
            derivedTitle: null,
            derivedDescription: null,
            suggestedCategory: null,
            extractedText: ''
        };
    }
};

module.exports = {
    extractPDFContent,
    detectCategory,
    extractTitle,
    extractDescription
};

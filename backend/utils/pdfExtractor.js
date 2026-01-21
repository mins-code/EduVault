const pdfParse = require('pdf-parse');

/**
 * Extract content from PDF buffer
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<Object>} Extracted title, description, and suggested category
 */
async function extractPDFContent(buffer) {
    try {
        const data = await pdfParse(buffer);
        const text = data.text;

        // Extract title (first non-empty line)
        const derivedTitle = extractTitle(text);

        // Detect category based on keywords
        const suggestedCategory = detectCategory(text);

        // Extract description (first 3 sentences with key keywords)
        const derivedDescription = extractDescription(text);

        return {
            derivedTitle,
            derivedDescription,
            suggestedCategory,
            fullText: text.substring(0, 500) // First 500 chars for debugging
        };
    } catch (error) {
        console.error('PDF extraction error:', error);
        return {
            derivedTitle: null,
            derivedDescription: null,
            suggestedCategory: null,
            error: error.message
        };
    }
}

/**
 * Extract title from PDF text (first non-empty line)
 */
function extractTitle(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    if (lines.length === 0) return null;

    // Get first non-empty line, limit to 100 characters
    let title = lines[0];
    if (title.length > 100) {
        title = title.substring(0, 97) + '...';
    }

    return title;
}

/**
 * Detect category based on keywords in PDF text
 */
function detectCategory(text) {
    const lowerText = text.toLowerCase();

    // Project keywords
    if (lowerText.includes('project') ||
        lowerText.includes('implementation') ||
        lowerText.includes('developed') ||
        lowerText.includes('built')) {
        return 'Projects';
    }

    // Internship keywords
    if (lowerText.includes('internship') ||
        lowerText.includes('company') ||
        lowerText.includes('intern at') ||
        lowerText.includes('work experience')) {
        return 'Internships';
    }

    // Certification keywords
    if (lowerText.includes('certificate') ||
        lowerText.includes('completion') ||
        lowerText.includes('certified') ||
        lowerText.includes('award')) {
        return 'Certifications';
    }

    // Default
    return 'Extracurriculars';
}

/**
 * Extract description from PDF text
 * Finds first 3 sentences containing key keywords
 */
function extractDescription(text) {
    // Keywords to look for
    const keywords = ['purpose', 'objective', 'goal', 'aim', 'designed', 'developed',
        'implemented', 'created', 'built', 'project', 'system', 'application'];

    // Split into sentences (basic splitting)
    const sentences = text
        .replace(/\n/g, ' ')
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 20); // Filter out very short sentences

    // Find sentences with keywords
    const relevantSentences = sentences.filter(sentence => {
        const lowerSentence = sentence.toLowerCase();
        return keywords.some(keyword => lowerSentence.includes(keyword));
    });

    // Take first 3 relevant sentences
    let description = relevantSentences.slice(0, 3).join('. ');

    // If no relevant sentences found, take first 3 sentences
    if (!description) {
        description = sentences.slice(0, 3).join('. ');
    }

    // Add period if missing
    if (description && !description.endsWith('.')) {
        description += '.';
    }

    // Limit to 300 characters
    if (description && description.length > 300) {
        description = description.substring(0, 297) + '...';
    }

    return description || null;
}

module.exports = { extractPDFContent };

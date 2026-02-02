const axios = require('axios')

/**
 * Judge0 Service
 * Handles code execution via Judge0 API
 */

// Language ID mapping for Judge0
const LANGUAGE_IDS = {
    javascript: 63,  // Node.js
    python: 71,      // Python 3
    java: 62,
    cpp: 54,
    c: 50
}

/**
 * Get Judge0 language ID from language name
 * @param {string} language - Language name
 * @returns {number} Judge0 language ID
 */
function getLanguageId(language) {
    const langId = LANGUAGE_IDS[language.toLowerCase()]
    if (!langId) {
        throw new Error(`Unsupported language: ${language}`)
    }
    return langId
}

/**
 * Submit code to Judge0 for execution
 * @param {string} code - Source code to execute
 * @param {number} languageId - Judge0 language ID
 * @param {string} stdin - Standard input
 * @param {string} expectedOutput - Expected output for comparison
 * @returns {Promise<Object>} Submission result with token
 */
async function submitCode(code, languageId, stdin = '', expectedOutput = '') {
    try {
        const options = {
            method: 'POST',
            url: `${process.env.JUDGE0_API_URL}/submissions`,
            params: {
                base64_encoded: 'false',
                wait: 'false',
                fields: '*'
            },
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
                'X-RapidAPI-Host': process.env.JUDGE0_API_HOST
            },
            data: {
                language_id: languageId,
                source_code: code,
                stdin: stdin,
                expected_output: expectedOutput
            }
        }

        const response = await axios.request(options)
        return response.data
    } catch (error) {
        console.error('❌ Error submitting code to Judge0:', error.message)
        throw new Error('Failed to submit code for execution')
    }
}

/**
 * Get submission result from Judge0
 * @param {string} token - Submission token
 * @returns {Promise<Object>} Execution result
 */
async function getSubmissionResult(token) {
    try {
        const options = {
            method: 'GET',
            url: `${process.env.JUDGE0_API_URL}/submissions/${token}`,
            params: {
                base64_encoded: 'false',
                fields: '*'
            },
            headers: {
                'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
                'X-RapidAPI-Host': process.env.JUDGE0_API_HOST
            }
        }

        const response = await axios.request(options)
        return response.data
    } catch (error) {
        console.error('❌ Error getting submission result:', error.message)
        throw new Error('Failed to get execution result')
    }
}

/**
 * Poll for submission result with timeout
 * @param {string} token - Submission token
 * @param {number} maxAttempts - Maximum polling attempts
 * @param {number} interval - Polling interval in ms
 * @returns {Promise<Object>} Final execution result
 */
async function pollSubmissionResult(token, maxAttempts = 10, interval = 1000) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const result = await getSubmissionResult(token)

        // Status IDs: 1=In Queue, 2=Processing, 3=Accepted, 4+=Error/Failed
        if (result.status.id > 2) {
            return result
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, interval))
    }

    throw new Error('Execution timeout: Result not available')
}

/**
 * Execute code with multiple test cases
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @param {Array} testCases - Array of test cases {input, expectedOutput, description}
 * @returns {Promise<Object>} Execution results for all test cases
 */
async function executeWithTests(code, language, testCases) {
    try {
        const languageId = getLanguageId(language)
        const results = []

        console.log(`🧪 Executing code with ${testCases.length} test cases...`)

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i]
            console.log(`   Test ${i + 1}/${testCases.length}: ${testCase.description || 'Running...'}`)

            // Submit code with test case
            const submission = await submitCode(
                code,
                languageId,
                testCase.input || '',
                testCase.expectedOutput || ''
            )

            // Poll for result
            const result = await pollSubmissionResult(submission.token)

            // Parse result
            const testResult = {
                testName: testCase.description || `Test Case ${i + 1}`,
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput: result.stdout || '',
                passed: result.status.id === 3, // Status 3 = Accepted
                statusId: result.status.id,
                statusDescription: result.status.description,
                time: result.time,
                memory: result.memory,
                error: result.stderr || result.compile_output || null
            }

            results.push(testResult)

            console.log(`   ${testResult.passed ? '✅' : '❌'} ${testResult.statusDescription}`)
        }

        return {
            results,
            totalTests: testCases.length,
            passedTests: results.filter(r => r.passed).length,
            allPassed: results.every(r => r.passed)
        }

    } catch (error) {
        console.error('❌ Error executing tests:', error.message)
        throw error
    }
}

/**
 * Verify all tests passed (100% requirement)
 * @param {Object} executionResults - Results from executeWithTests
 * @returns {boolean} True if all tests passed
 */
function verifyAllTestsPassed(executionResults) {
    return executionResults.allPassed &&
        executionResults.passedTests === executionResults.totalTests
}

/**
 * Get Judge0 status description
 * @param {number} statusId - Judge0 status ID
 * @returns {string} Human-readable status
 */
function getStatusDescription(statusId) {
    const statuses = {
        1: 'In Queue',
        2: 'Processing',
        3: 'Accepted',
        4: 'Wrong Answer',
        5: 'Time Limit Exceeded',
        6: 'Compilation Error',
        7: 'Runtime Error (SIGSEGV)',
        8: 'Runtime Error (SIGXFSZ)',
        9: 'Runtime Error (SIGFPE)',
        10: 'Runtime Error (SIGABRT)',
        11: 'Runtime Error (NZEC)',
        12: 'Runtime Error (Other)',
        13: 'Internal Error',
        14: 'Exec Format Error'
    }

    return statuses[statusId] || 'Unknown Status'
}

module.exports = {
    getLanguageId,
    submitCode,
    getSubmissionResult,
    pollSubmissionResult,
    executeWithTests,
    verifyAllTestsPassed,
    getStatusDescription,
    LANGUAGE_IDS
}

/**
 * Browser-Based Code Execution Engine
 * Free alternative to Judge0 - runs JavaScript in browser
 */

import api from '../api'

/**
 * Execute code locally in browser
 * @param {string} code - User's code
 * @param {Array} testCases - Test cases to run
 * @param {string} language - Programming language (only 'javascript' supported)
 * @returns {Promise<Object>} Execution results
 */
export async function executeCode(code, testCases, language = 'javascript') {
    // For non-JS languages, use backend Piston API
    if (language !== 'javascript') {
        console.log(`🚀 [BACKEND] Executing ${language} code via Piston API...`)

        try {
            const startTime = Date.now()

            // Make API call to backend
            const response = await api.post('/api/execute', {
                code,
                language,
                testCases
            })

            const { results, passed, passedTests, totalTests, executionTime } = response.data

            console.log(`✅ [BACKEND] Execution complete: ${passedTests}/${totalTests} passed`)

            // Format results to match UI expectations
            const formattedResults = results.map((result, index) => ({
                testName: testCases[index]?.description || `Test Case ${result.testCase}`,
                input: result.input,
                expectedOutput: result.expectedOutput,
                actualOutput: result.actualOutput,
                passed: result.passed,
                statusId: result.passed ? 3 : (result.error ? 7 : 4),
                statusDescription: result.error
                    ? 'Runtime Error'
                    : (result.passed ? 'Accepted' : 'Wrong Answer'),
                time: '0.00',
                memory: 0,
                error: result.error || null
            }))

            return {
                results: formattedResults,
                totalTests,
                passedTests,
                allPassed: passed,
                executionTime
            }

        } catch (error) {
            console.error('❌ [BACKEND] Execution failed:', error)

            // Return structured error result
            return {
                results: testCases.map((tc, index) => ({
                    testName: tc.description || `Test Case ${index + 1}`,
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    actualOutput: '',
                    passed: false,
                    statusId: 7,
                    statusDescription: 'Backend Error',
                    time: '0.00',
                    memory: 0,
                    error: error.response?.data?.message || error.message || 'Backend execution failed'
                })),
                totalTests: testCases.length,
                passedTests: 0,
                allPassed: false,
                executionTime: 0
            }
        }
    }

    console.log(`🧪 [LOCAL] Executing code with ${testCases.length} test cases...`)

    const startTime = Date.now()
    const results = []

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i]
        console.log(`   Test ${i + 1}/${testCases.length}: ${testCase.description || 'Running...'}`)

        try {
            const result = await runTestCase(code, testCase)
            results.push(result)
            console.log(`   ${result.passed ? '✅' : '❌'} ${result.passed ? 'Passed' : 'Failed'}`)
        } catch (error) {
            results.push({
                testName: testCase.description || `Test Case ${i + 1}`,
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput: '',
                passed: false,
                statusId: 6,
                statusDescription: 'Runtime Error',
                time: '0.00',
                memory: 0,
                error: error.message
            })
            console.log(`   ❌ Error: ${error.message}`)
        }
    }

    const executionTime = Date.now() - startTime

    return {
        results,
        totalTests: testCases.length,
        passedTests: results.filter(r => r.passed).length,
        allPassed: results.every(r => r.passed),
        executionTime
    }
}

/**
 * Run a single test case
 * @param {string} code - User's code
 * @param {Object} testCase - Single test case
 * @returns {Promise<Object>} Test result
 */
async function runTestCase(code, testCase) {
    const startTime = performance.now()

    try {
        // Sanitize code
        sanitizeCode(code)

        // Wrap code with timeout protection
        const wrappedCode = wrapCodeWithTimeout(code, testCase.input)

        // Execute code
        const actualOutput = await executeWithTimeout(wrappedCode, 5000)

        // Compare output
        const passed = compareOutputs(actualOutput, testCase.expectedOutput)

        const endTime = performance.now()
        const executionTime = ((endTime - startTime) / 1000).toFixed(3)

        return {
            testName: testCase.description || 'Test Case',
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: String(actualOutput),
            passed,
            statusId: passed ? 3 : 4,
            statusDescription: passed ? 'Accepted' : 'Wrong Answer',
            time: executionTime,
            memory: 0, // Browser doesn't provide memory info
            error: null
        }

    } catch (error) {
        const endTime = performance.now()
        const executionTime = ((endTime - startTime) / 1000).toFixed(3)

        return {
            testName: testCase.description || 'Test Case',
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: '',
            passed: false,
            statusId: 7,
            statusDescription: 'Runtime Error',
            time: executionTime,
            memory: 0,
            error: error.message
        }
    }
}

/**
 * Sanitize code to prevent dangerous operations
 * @param {string} code - Code to sanitize
 * @throws {Error} If dangerous code detected
 */
function sanitizeCode(code) {
    const dangerousPatterns = [
        /eval\s*\(/,
        /Function\s*\(/,
        /XMLHttpRequest/,
        /fetch\s*\(/,
        /import\s+/,
        /require\s*\(/,
        /process\./,
        /window\./,
        /document\./,
        /localStorage/,
        /sessionStorage/,
        /indexedDB/
    ]

    for (const pattern of dangerousPatterns) {
        if (pattern.test(code)) {
            throw new Error(`Unsafe code detected: ${pattern.source}`)
        }
    }
}

/**
 * Wrap code with timeout and input injection
 * @param {string} code - User's code
 * @param {string} input - Test input
 * @returns {string} Wrapped code
 */
function wrapCodeWithTimeout(code, input) {
    // Extract function name from code
    const functionMatch = code.match(/function\s+(\w+)/)
    const functionName = functionMatch ? functionMatch[1] : 'solution'

    // Parse input - handle arrays, objects, or simple values
    let wrappedCode
    if (!input || input === '') {
        // No input - call function with no arguments
        wrappedCode = `
            ${code}
            
            // Execute function with no input
            const result = ${functionName}();
            return result;
        `
    } else if (input.startsWith('[') || input.startsWith('{')) {
        // Array or object input - parse as JSON
        let parsedInput
        try {
            parsedInput = JSON.parse(input)
        } catch {
            parsedInput = input
        }
        wrappedCode = `
            ${code}
            
            // Execute function with input
            const input = ${JSON.stringify(parsedInput)};
            const result = ${functionName}(input);
            return result;
        `
    } else {
        // Simple value
        wrappedCode = `
            ${code}
            
            // Execute function with input
            const input = ${JSON.stringify(input)};
            const result = ${functionName}(input);
            return result;
        `
    }

    console.log('🔍 [DEBUG] Wrapped code:', wrappedCode)
    return wrappedCode
}

/**
 * Execute code with timeout protection
 * @param {string} code - Code to execute
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<any>} Execution result
 */
function executeWithTimeout(code, timeout) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Execution timeout (5 seconds)'))
        }, timeout)

        try {
            // Create function from code
            const fn = new Function(`
                'use strict';
                return (function() {
                    ${code}
                })();
            `)

            // Execute
            const result = fn()

            clearTimeout(timeoutId)
            resolve(result)

        } catch (error) {
            clearTimeout(timeoutId)
            reject(error)
        }
    })
}

/**
 * Compare actual output with expected output
 * @param {any} actual - Actual output
 * @param {string} expected - Expected output
 * @returns {boolean} True if outputs match
 */
function compareOutputs(actual, expected) {
    // Convert both to strings for comparison
    const actualStr = String(actual).trim()
    const expectedStr = String(expected).trim()

    // Exact match
    if (actualStr === expectedStr) {
        return true
    }

    // Try parsing as numbers
    const actualNum = parseFloat(actualStr)
    const expectedNum = parseFloat(expectedStr)

    if (!isNaN(actualNum) && !isNaN(expectedNum)) {
        // Allow small floating point differences
        return Math.abs(actualNum - expectedNum) < 0.0001
    }

    // Case-insensitive match
    if (actualStr.toLowerCase() === expectedStr.toLowerCase()) {
        return true
    }

    return false
}

/**
 * Verify all tests passed (for badge awarding)
 * @param {Object} executionResults - Results from executeCode
 * @returns {boolean} True if all tests passed
 */
export function verifyAllTestsPassed(executionResults) {
    return executionResults.allPassed &&
        executionResults.passedTests === executionResults.totalTests
}

/**
 * Get status description from status ID
 * @param {number} statusId - Status ID
 * @returns {string} Status description
 */
export function getStatusDescription(statusId) {
    const statuses = {
        1: 'In Queue',
        2: 'Processing',
        3: 'Accepted',
        4: 'Wrong Answer',
        5: 'Time Limit Exceeded',
        6: 'Compilation Error',
        7: 'Runtime Error'
    }
    return statuses[statusId] || 'Unknown Status'
}

export default {
    executeCode,
    verifyAllTestsPassed,
    getStatusDescription
}

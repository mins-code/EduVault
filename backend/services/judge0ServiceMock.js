/**
 * Mock Judge0 Service (For Testing Without API Key)
 * This simulates code execution for testing the UI
 */

const LANGUAGE_IDS = {
    javascript: 63,
    python: 71,
    java: 62,
    cpp: 54,
    c: 50
}

function getLanguageId(language) {
    const langId = LANGUAGE_IDS[language.toLowerCase()]
    if (!langId) {
        throw new Error(`Unsupported language: ${language}`)
    }
    return langId
}

/**
 * Mock code execution - simulates Judge0 behavior
 */
async function executeWithTests(code, language, testCases) {
    console.log(`🧪 [MOCK] Executing code with ${testCases.length} test cases...`)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const results = []

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i]
        console.log(`   Test ${i + 1}/${testCases.length}: ${testCase.description || 'Running...'}`)

        // Simple mock logic - check if code contains expected output
        const passed = code.includes(testCase.expectedOutput)

        const testResult = {
            testName: testCase.description || `Test Case ${i + 1}`,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: passed ? testCase.expectedOutput : 'undefined',
            passed: passed,
            statusId: passed ? 3 : 4,
            statusDescription: passed ? 'Accepted' : 'Wrong Answer',
            time: '0.02',
            memory: 1024,
            error: null
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
}

function verifyAllTestsPassed(executionResults) {
    return executionResults.allPassed &&
        executionResults.passedTests === executionResults.totalTests
}

function getStatusDescription(statusId) {
    const statuses = {
        1: 'In Queue',
        2: 'Processing',
        3: 'Accepted',
        4: 'Wrong Answer',
        5: 'Time Limit Exceeded',
        6: 'Compilation Error'
    }
    return statuses[statusId] || 'Unknown Status'
}

// Placeholder functions (not used in mock)
function submitCode() {
    throw new Error('Mock service - use executeWithTests directly')
}

function getSubmissionResult() {
    throw new Error('Mock service - use executeWithTests directly')
}

function pollSubmissionResult() {
    throw new Error('Mock service - use executeWithTests directly')
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

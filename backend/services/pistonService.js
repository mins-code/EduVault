import axios from 'axios';

// Language configuration mapping to Piston API versions
const LANGUAGE_CONFIG = {
    javascript: { language: 'javascript', version: '18.15.0' },
    python: { language: 'python', version: '3.10.0' },
    cpp: { language: 'c++', version: '10.2.0' },
    java: { language: 'java', version: '15.0.2' },
    c: { language: 'c', version: '10.2.0' }
};

/**
 * Execute code using the Piston API
 * @param {string} code - The source code to execute
 * @param {string} language - The programming language (javascript, python, cpp, java, c)
 * @param {string} stdin - Standard input for the program
 * @returns {Promise<Object>} - The execution result from Piston API
 */
export const executeCode = async (code, language, stdin = '') => {
    try {
        const config = LANGUAGE_CONFIG[language];

        if (!config) {
            throw new Error(`Unsupported language: ${language}`);
        }

        const payload = {
            language: config.language,
            version: config.version,
            files: [{ content: code }],
            stdin: stdin
        };

        const response = await axios.post('https://emkc.org/api/v2/piston/execute', payload);
        return response.data;
    } catch (error) {
        console.error('Error executing code:', error.message);
        throw error;
    }
};

/**
 * Execute code with multiple test cases
 * @param {string} code - The source code to execute
 * @param {string} language - The programming language
 * @param {Array} testCases - Array of test case objects with { input, expectedOutput }
 * @returns {Promise<Object>} - Object containing test results, pass/fail status, and count
 */
export const executeWithTests = async (code, language, testCases) => {
    try {
        const results = [];
        let passedTests = 0;

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];

            try {
                // Execute code with the test case input
                const executionResult = await executeCode(code, language, testCase.input);

                // Check if execution had errors
                if (executionResult.run && executionResult.run.stderr) {
                    results.push({
                        testCase: i + 1,
                        input: testCase.input,
                        expectedOutput: testCase.expectedOutput,
                        actualOutput: executionResult.run.stdout || '',
                        error: executionResult.run.stderr,
                        passed: false
                    });
                } else {
                    // Compare actual output with expected output
                    const actualOutput = executionResult.run?.stdout || '';
                    const expectedOutput = testCase.expectedOutput;
                    const passed = actualOutput.trim() === expectedOutput.trim();

                    if (passed) {
                        passedTests++;
                    }

                    results.push({
                        testCase: i + 1,
                        input: testCase.input,
                        expectedOutput: expectedOutput,
                        actualOutput: actualOutput,
                        passed: passed,
                        error: null
                    });
                }
            } catch (error) {
                // Handle execution errors gracefully
                results.push({
                    testCase: i + 1,
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: '',
                    error: error.message,
                    passed: false
                });
            }
        }

        const allPassed = passedTests === testCases.length;

        return {
            results: results,
            allPassed: allPassed,
            passedTests: passedTests,
            totalTests: testCases.length
        };
    } catch (error) {
        console.error('Error executing tests:', error.message);
        throw error;
    }
};

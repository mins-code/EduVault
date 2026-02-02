/**
 * GitHub Fetcher for Exercism Challenges
 * Fetches challenges directly from Exercism JavaScript repository
 */

const GITHUB_API_BASE = 'https://api.github.com'
const EXERCISM_REPO = 'exercism/javascript'
const EXERCISES_PATH = 'exercises/concept'

/**
 * Fetch list of exercises from GitHub
 * @returns {Promise<Array>} List of exercise directories
 */
export async function fetchExerciseList() {
    try {
        const url = `${GITHUB_API_BASE}/repos/${EXERCISM_REPO}/contents/${EXERCISES_PATH}`

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        })

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`)
        }

        const data = await response.json()

        // Filter only directories
        return data.filter(item => item.type === 'dir')
    } catch (error) {
        console.error('❌ Error fetching exercise list:', error)
        throw error
    }
}

/**
 * Fetch file content from GitHub
 * @param {string} path - File path in repository
 * @returns {Promise<string>} File content
 */
async function fetchFileContent(path) {
    try {
        const url = `${GITHUB_API_BASE}/repos/${EXERCISM_REPO}/contents/${path}`

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3.raw'
            }
        })

        if (!response.ok) {
            // Don't throw, just return null for missing files
            return null
        }

        return await response.text()
    } catch (error) {
        console.warn(`⚠️  Error fetching ${path}:`, error.message)
        return null
    }
}

/**
 * Parse difficulty from config or infer from exercise
 * @param {Object} config - Exercise config
 * @returns {string} Difficulty level
 */
function parseDifficulty(config) {
    // Exercism doesn't always have difficulty, so we'll default to Medium
    // You can customize this logic based on tags or other metadata
    if (config.difficulty) {
        return config.difficulty
    }

    // Infer from blurb or default
    return 'Medium'
}

/**
 * Generate test cases from README examples
 * @param {string} readme - README content
 * @returns {Array} Test cases
 */
function generateTestCasesFromReadme(readme) {
    const testCases = []

    // Try to extract examples from README
    // Look for code blocks with examples
    const exampleRegex = /```javascript\n([\s\S]*?)```/g
    let match

    while ((match = exampleRegex.exec(readme)) !== null) {
        const example = match[1].trim()

        // Try to parse simple function calls like: functionName(input) // => output
        const callRegex = /(\w+)\((.*?)\)\s*(?:\/\/|=>)\s*(?:=>)?\s*["']?(.+?)["']?$/gm
        let callMatch

        while ((callMatch = callRegex.exec(example)) !== null) {
            testCases.push({
                input: callMatch[2].replace(/["']/g, ''),
                expectedOutput: callMatch[3].trim(),
                description: `Test: ${callMatch[0]}`,
                isHidden: false
            })
        }
    }

    // If no test cases found, create a default one
    if (testCases.length === 0) {
        testCases.push({
            input: '',
            expectedOutput: 'Hello, World!',
            description: 'Default test case',
            isHidden: false
        })
    }

    return testCases
}

/**
 * Fetch complete challenge data
 * @param {string} exerciseName - Exercise directory name (slug)
 * @returns {Promise<Object>} Challenge object
 */
export async function fetchChallenge(exerciseName) {
    try {
        console.log(`📥 Fetching challenge: ${exerciseName}`)

        // Fetch README.md
        const readmePath = `${EXERCISES_PATH}/${exerciseName}/README.md`
        const readme = await fetchFileContent(readmePath)

        if (!readme) {
            console.warn(`⚠️  Skipping ${exerciseName}: No README found`)
            return null
        }

        // Fetch .meta/config.json
        const configPath = `${EXERCISES_PATH}/${exerciseName}/.meta/config.json`
        const configText = await fetchFileContent(configPath)

        let config = {}
        if (configText) {
            try {
                config = JSON.parse(configText)
            } catch (e) {
                console.warn(`⚠️  Could not parse config for ${exerciseName}`)
            }
        }

        // Extract title from README (first # heading) or use config
        const titleMatch = readme.match(/^#\s+(.+)$/m)
        const title = config.title || (titleMatch ? titleMatch[1] : exerciseName)

        // Extract description (everything after first heading until ## or end)
        const descMatch = readme.match(/^#\s+.+?\n\n([\s\S]+?)(?:\n##|$)/m)
        const description = descMatch ? descMatch[1].trim() : readme

        // Generate test cases from README examples
        const testCases = generateTestCasesFromReadme(readme)

        // Create challenge object
        const challenge = {
            slug: exerciseName,
            title: title,
            description: readme, // Full README as description
            difficulty: parseDifficulty(config),
            language: 'javascript',
            track: 'javascript',
            starterCode: `// Solve the ${title} challenge\nfunction solution() {\n  // Your code here\n  \n}`,
            testCode: '// Test code will be generated from examples',
            testCases: testCases,
            tags: config.tags || [],
            blurb: config.blurb || description.substring(0, 150) + '...',
            authors: config.authors || ['Exercism'],
            isActive: true,
            source: 'exercism-github',
            _id: exerciseName // Use slug as temporary ID
        }

        console.log(`✅ Fetched: ${title}`)
        return challenge

    } catch (error) {
        console.warn(`⚠️  Skipping ${exerciseName}:`, error.message)
        return null
    }
}

/**
 * Fetch multiple challenges
 * @param {number} limit - Maximum number of challenges to fetch
 * @returns {Promise<Array>} Array of challenges
 */
export async function fetchChallenges(limit = 10) {
    try {
        console.log('📚 Fetching challenges from Exercism...')

        // Get list of exercises
        const exercises = await fetchExerciseList()

        console.log(`Found ${exercises.length} exercises, attempting to fetch ${Math.min(limit, exercises.length)}...`)

        // Fetch details for first N exercises
        const challengePromises = exercises
            .slice(0, limit)
            .map(exercise => fetchChallenge(exercise.name))

        const challenges = await Promise.all(challengePromises)

        // Filter out failed fetches (null values)
        const validChallenges = challenges.filter(c => c !== null)

        const skipped = challenges.length - validChallenges.length

        console.log(`✅ Successfully fetched ${validChallenges.length} challenges${skipped > 0 ? ` (skipped ${skipped} without README)` : ''}`)

        return validChallenges

    } catch (error) {
        console.error('❌ Error fetching challenges:', error)
        return []
    }
}

/**
 * Cache challenges in localStorage
 * @param {Array} challenges - Challenges to cache
 */
export function cacheChallenges(challenges) {
    try {
        const cacheData = {
            challenges,
            timestamp: Date.now(),
            expiresIn: 24 * 60 * 60 * 1000 // 24 hours
        }
        localStorage.setItem('exercism_challenges_cache', JSON.stringify(cacheData))
        console.log('💾 Cached challenges to localStorage')
    } catch (error) {
        console.error('❌ Error caching challenges:', error)
    }
}

/**
 * Get cached challenges if not expired
 * @returns {Array|null} Cached challenges or null
 */
export function getCachedChallenges() {
    try {
        const cached = localStorage.getItem('exercism_challenges_cache')
        if (!cached) return null

        const cacheData = JSON.parse(cached)
        const now = Date.now()

        // Check if cache is expired
        if (now - cacheData.timestamp > cacheData.expiresIn) {
            console.log('⏰ Cache expired')
            localStorage.removeItem('exercism_challenges_cache')
            return null
        }

        console.log('💾 Using cached challenges')
        return cacheData.challenges

    } catch (error) {
        console.error('❌ Error reading cache:', error)
        return null
    }
}

/**
 * Fetch challenges with caching
 * @param {number} limit - Maximum challenges to fetch
 * @param {boolean} forceRefresh - Force refresh from GitHub
 * @returns {Promise<Array>} Challenges
 */
export async function fetchChallengesWithCache(limit = 10, forceRefresh = false) {
    if (!forceRefresh) {
        const cached = getCachedChallenges()
        if (cached) {
            return cached
        }
    }

    const challenges = await fetchChallenges(limit)
    if (challenges.length > 0) {
        cacheChallenges(challenges)
    }

    return challenges
}

export default {
    fetchExerciseList,
    fetchChallenge,
    fetchChallenges,
    fetchChallengesWithCache,
    cacheChallenges,
    getCachedChallenges
}

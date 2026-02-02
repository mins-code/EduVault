const axios = require('axios')
const Challenge = require('../models/Challenge')

/**
 * Challenge Fetcher Utility
 * Fetches coding challenges from Exercism GitHub repositories
 * and seeds them into the MongoDB database
 */

const GITHUB_API_BASE = 'https://api.github.com/repos/exercism'
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/exercism'

/**
 * Fetch list of exercises from Exercism track
 * @param {string} track - Track name (javascript, python)
 * @returns {Promise<Array>} List of exercise slugs
 */
async function fetchExerciseList(track) {
    try {
        const url = `${GITHUB_API_BASE}/${track}/contents/exercises/practice`
        console.log(`📂 Fetching exercise list from: ${url}`)

        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        })

        // Filter for directories only
        const exercises = response.data
            .filter(item => item.type === 'dir')
            .map(item => item.name)

        console.log(`✅ Found ${exercises.length} exercises in ${track} track`)
        return exercises
    } catch (error) {
        console.error(`❌ Error fetching exercise list for ${track}:`, error.message)
        throw error
    }
}

/**
 * Fetch exercise metadata from .meta/config.json
 * @param {string} track - Track name
 * @param {string} slug - Exercise slug
 * @returns {Promise<Object>} Metadata object
 */
async function fetchExerciseMetadata(track, slug) {
    try {
        const url = `${GITHUB_RAW_BASE}/${track}/main/exercises/practice/${slug}/.meta/config.json`
        console.log(`📋 Fetching metadata for ${slug}...`)

        const response = await axios.get(url)
        return response.data
    } catch (error) {
        console.error(`❌ Error fetching metadata for ${slug}:`, error.message)
        return null
    }
}

/**
 * Fetch exercise instructions from .docs/instructions.md
 * @param {string} track - Track name
 * @param {string} slug - Exercise slug
 * @returns {Promise<string>} Instructions markdown
 */
async function fetchExerciseInstructions(track, slug) {
    try {
        const url = `${GITHUB_RAW_BASE}/${track}/main/exercises/practice/${slug}/.docs/instructions.md`
        console.log(`📖 Fetching instructions for ${slug}...`)

        const response = await axios.get(url)
        return response.data
    } catch (error) {
        console.error(`❌ Error fetching instructions for ${slug}:`, error.message)
        return 'No description available'
    }
}

/**
 * Fetch starter code file
 * @param {string} track - Track name
 * @param {string} slug - Exercise slug
 * @param {string} filename - Starter file name
 * @returns {Promise<string>} Starter code
 */
async function fetchStarterCode(track, slug, filename) {
    try {
        const url = `${GITHUB_RAW_BASE}/${track}/main/exercises/practice/${slug}/${filename}`
        console.log(`💻 Fetching starter code: ${filename}...`)

        const response = await axios.get(url)
        return response.data
    } catch (error) {
        console.error(`❌ Error fetching starter code for ${slug}:`, error.message)
        return '// Starter code not available'
    }
}

/**
 * Fetch test code file
 * @param {string} track - Track name
 * @param {string} slug - Exercise slug
 * @param {string} filename - Test file name
 * @returns {Promise<string>} Test code
 */
async function fetchTestCode(track, slug, filename) {
    try {
        const url = `${GITHUB_RAW_BASE}/${track}/main/exercises/practice/${slug}/${filename}`
        console.log(`🧪 Fetching test code: ${filename}...`)

        const response = await axios.get(url)
        return response.data
    } catch (error) {
        console.error(`❌ Error fetching test code for ${slug}:`, error.message)
        return '// Test code not available'
    }
}

/**
 * Determine difficulty based on exercise metadata
 * @param {Object} metadata - Exercise metadata
 * @returns {string} Difficulty level
 */
function determineDifficulty(metadata) {
    // Simple heuristic based on blurb length and complexity
    // Can be improved with more sophisticated analysis
    const blurbLength = metadata.blurb?.length || 0

    if (blurbLength < 50) return 'Easy'
    if (blurbLength < 100) return 'Medium'
    return 'Hard'
}

/**
 * Parse and seed a single challenge
 * @param {string} track - Track name (javascript, python)
 * @param {string} slug - Exercise slug
 * @returns {Promise<Object>} Created challenge
 */
async function parseAndSeedChallenge(track, slug) {
    try {
        console.log(`\n🌱 Seeding challenge: ${slug} (${track})`)

        // Check if already exists
        const existing = await Challenge.findOne({ slug, language: track })
        if (existing) {
            console.log(`⏭️  Challenge ${slug} already exists, skipping...`)
            return existing
        }

        // Fetch all required data
        const metadata = await fetchExerciseMetadata(track, slug)
        if (!metadata) {
            console.log(`⚠️  Skipping ${slug} - no metadata found`)
            return null
        }

        const instructions = await fetchExerciseInstructions(track, slug)

        // Get file names from metadata
        const solutionFile = metadata.files?.solution?.[0] || `${slug}.${track === 'javascript' ? 'js' : 'py'}`
        const testFile = metadata.files?.test?.[0] || `${slug}.spec.${track === 'javascript' ? 'js' : 'py'}`

        const starterCode = await fetchStarterCode(track, slug, solutionFile)
        const testCode = await fetchTestCode(track, slug, testFile)

        // Create challenge object
        const challengeData = {
            slug,
            title: slug.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            description: instructions,
            difficulty: determineDifficulty(metadata),
            language: track,
            track: track,
            starterCode,
            testCode,
            tags: metadata.practices || [],
            blurb: metadata.blurb || '',
            authors: metadata.authors || [],
            isActive: true
        }

        // Save to database
        const challenge = new Challenge(challengeData)
        await challenge.save()

        console.log(`✅ Successfully seeded: ${slug}`)
        return challenge

    } catch (error) {
        console.error(`❌ Error seeding challenge ${slug}:`, error.message)
        return null
    }
}

/**
 * Seed multiple challenges from a track
 * @param {string} track - Track name (javascript, python)
 * @param {number} limit - Maximum number of challenges to seed (default: 10)
 * @returns {Promise<Object>} Seeding results
 */
async function seedAllChallenges(track, limit = 10) {
    try {
        console.log(`\n🚀 Starting challenge seeding for ${track} track (limit: ${limit})`)

        // Fetch exercise list
        const exercises = await fetchExerciseList(track)

        // Limit the number of exercises
        const exercisesToSeed = exercises.slice(0, limit)

        console.log(`📝 Will seed ${exercisesToSeed.length} challenges`)

        const results = {
            total: exercisesToSeed.length,
            succeeded: 0,
            failed: 0,
            skipped: 0,
            challenges: []
        }

        // Seed each exercise
        for (const slug of exercisesToSeed) {
            const challenge = await parseAndSeedChallenge(track, slug)

            if (challenge) {
                if (challenge.createdAt) {
                    results.succeeded++
                } else {
                    results.skipped++
                }
                results.challenges.push(challenge)
            } else {
                results.failed++
            }

            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        console.log(`\n✨ Seeding complete!`)
        console.log(`   Succeeded: ${results.succeeded}`)
        console.log(`   Skipped: ${results.skipped}`)
        console.log(`   Failed: ${results.failed}`)

        return results

    } catch (error) {
        console.error(`❌ Error in seedAllChallenges:`, error.message)
        throw error
    }
}

module.exports = {
    fetchExerciseList,
    fetchExerciseMetadata,
    fetchExerciseInstructions,
    fetchStarterCode,
    fetchTestCode,
    parseAndSeedChallenge,
    seedAllChallenges
}

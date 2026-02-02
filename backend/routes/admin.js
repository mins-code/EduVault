const express = require('express')
const router = express.Router()
const Challenge = require('../models/Challenge')
const auth = require('../middleware/auth')

// @route   POST /api/admin/create-test-challenge
// @desc    Create a simple test challenge (for testing without Exercism)
// @access  Private (Admin)
router.post('/create-test-challenge', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            })
        }

        // Create a simple "Hello World" challenge
        const challenge = new Challenge({
            slug: 'hello-world',
            title: 'Hello World',
            description: `# Hello World

Write a function that returns the string "Hello, World!".

This is a classic first program that introduces you to the basics of programming.

## Example

\`\`\`javascript
helloWorld() // => "Hello, World!"
\`\`\``,
            difficulty: 'Easy',
            language: 'javascript',
            track: 'javascript',
            starterCode: `function helloWorld() {
  // Your code here
  
}

module.exports = helloWorld;`,
            testCode: `const helloWorld = require('./solution');

test('returns Hello, World!', () => {
  expect(helloWorld()).toBe('Hello, World!');
});`,
            testCases: [
                {
                    input: '',
                    expectedOutput: 'Hello, World!',
                    description: 'Returns the greeting',
                    isHidden: false
                }
            ],
            tags: ['strings', 'introduction'],
            blurb: 'The classical introductory exercise. Just say "Hello, World!"',
            authors: ['EduVault Team'],
            isActive: true
        })

        await challenge.save()

        console.log('✅ Test challenge created: hello-world')

        res.json({
            success: true,
            message: 'Test challenge created successfully',
            challenge
        })

    } catch (error) {
        // If duplicate, that's okay
        if (error.code === 11000) {
            return res.json({
                success: true,
                message: 'Challenge already exists'
            })
        }

        console.error('❌ Error creating test challenge:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to create test challenge',
            error: error.message
        })
    }
})

module.exports = router

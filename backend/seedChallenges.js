const mongoose = require('mongoose')
require('dotenv').config()

// Import Challenge model
const Challenge = require('./models/Challenge')

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB')
        seedChallenges()
    })
    .catch((error) => {
        console.error('❌ MongoDB connection failed:', error)
        process.exit(1)
    })

async function seedChallenges() {
    try {
        // Create Hello World challenge
        const helloWorld = new Challenge({
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
  return "Hello, World!";
}`,
            testCode: `// Test code placeholder
const helloWorld = require('./solution');
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

        await helloWorld.save()
        console.log('✅ Created: Hello World')

        // Create Two Fer challenge
        const twoFer = new Challenge({
            slug: 'two-fer',
            title: 'Two Fer',
            description: `# Two Fer

\`Two-fer\` or \`2-fer\` is short for two for one. One for you and one for me.

Given a name, return a string with the message:

\`One for name, one for me.\`

Where "name" is the given name.

However, if the name is missing, return the string:

\`One for you, one for me.\`

## Examples

\`\`\`javascript
twoFer("Alice") // => "One for Alice, one for me."
twoFer() // => "One for you, one for me."
\`\`\``,
            difficulty: 'Easy',
            language: 'javascript',
            track: 'javascript',
            starterCode: `function twoFer(name) {
  // Your code here
  
}`,
            testCode: `// Test code placeholder
const twoFer = require('./solution');
test('with a name', () => {
  expect(twoFer('Alice')).toBe('One for Alice, one for me.');
});`,
            testCases: [
                {
                    input: 'Alice',
                    expectedOutput: 'One for Alice, one for me.',
                    description: 'With a name',
                    isHidden: false
                },
                {
                    input: '',
                    expectedOutput: 'One for you, one for me.',
                    description: 'Without a name',
                    isHidden: false
                },
                {
                    input: 'Bob',
                    expectedOutput: 'One for Bob, one for me.',
                    description: 'Another name',
                    isHidden: false
                }
            ],
            tags: ['strings', 'conditionals'],
            blurb: 'Create a sentence of the form "One for X, one for me."',
            authors: ['EduVault Team'],
            isActive: true
        })

        await twoFer.save()
        console.log('✅ Created: Two Fer')

        // Create Reverse String challenge
        const reverseString = new Challenge({
            slug: 'reverse-string',
            title: 'Reverse String',
            description: `# Reverse String

Reverse a string.

For example:
- input: "robot"
- output: "tobor"

## Examples

\`\`\`javascript
reverseString("robot") // => "tobor"
reverseString("hello") // => "olleh"
reverseString("a") // => "a"
\`\`\``,
            difficulty: 'Easy',
            language: 'javascript',
            track: 'javascript',
            starterCode: `function reverseString(str) {
  // Your code here
  
}`,
            testCode: `// Test code placeholder
const reverseString = require('./solution');
test('reverse robot', () => {
  expect(reverseString('robot')).toBe('tobor');
});`,
            testCases: [
                {
                    input: 'robot',
                    expectedOutput: 'tobor',
                    description: 'Reverse "robot"',
                    isHidden: false
                },
                {
                    input: 'hello',
                    expectedOutput: 'olleh',
                    description: 'Reverse "hello"',
                    isHidden: false
                },
                {
                    input: 'a',
                    expectedOutput: 'a',
                    description: 'Single character',
                    isHidden: false
                },
                {
                    input: '',
                    expectedOutput: '',
                    description: 'Empty string',
                    isHidden: true
                }
            ],
            tags: ['strings', 'algorithms'],
            blurb: 'Reverse a string',
            authors: ['EduVault Team'],
            isActive: true
        })

        await reverseString.save()
        console.log('✅ Created: Reverse String')

        console.log('\n🎉 Successfully seeded 3 challenges!')
        console.log('You can now view them at /challenges')

        process.exit(0)

    } catch (error) {
        if (error.code === 11000) {
            console.log('⚠️  Challenges already exist in database')
        } else {
            console.error('❌ Error seeding challenges:', error)
        }
        process.exit(1)
    }
}

const mongoose = require('mongoose')
const Challenge = require('./models/Challenge')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: './.env' })

// Static Challenges Data (synced from frontend)
const CHALLENGES = [
    // --- JAVASCRIPT CHALLENGES ---
    {
        slug: 'js-hello-world',
        title: 'Hello World',
        description: '# Hello World\n\nWrite a function that returns the classic "Hello, World!" greeting.',
        difficulty: 'Easy',
        language: 'javascript',
        starterCode: 'function helloWorld() {\n  // Your code here\n  return "Hello, World!"\n}',
        testCases: [{ input: '', expectedOutput: 'Hello, World!' }],
        track: 'Basics',
        testCode: 'test',
        tags: ['strings', 'introduction'],
        blurb: 'The classical introductory exercise. Just say "Hello, World!"'
    },
    {
        slug: 'js-reverse-string',
        title: 'Reverse String',
        description: '# Reverse String\n\nWrite a function that reverses a string.',
        difficulty: 'Easy',
        language: 'javascript',
        starterCode: 'function reverseString(str) {\n  // Your code here\n}',
        testCases: [{ input: 'hello', expectedOutput: 'olleh' }],
        track: 'Algorithms',
        testCode: 'test',
        tags: ['strings', 'algorithms'],
        blurb: 'Reverse a string character by character'
    },
    {
        slug: 'js-fizzbuzz',
        title: 'FizzBuzz',
        description: '# FizzBuzz\n\nWrite a function that returns "Fizz", "Buzz", "FizzBuzz", or the number itself.',
        difficulty: 'Easy',
        language: 'javascript',
        starterCode: 'function fizzBuzz(n) {\n  // Your code here\n}',
        testCases: [{ input: '3', expectedOutput: 'Fizz' }],
        track: 'Algorithms',
        testCode: 'test',
        tags: ['logic', 'conditionals'],
        blurb: 'The classic FizzBuzz programming challenge'
    },
    {
        slug: 'js-palindrome',
        title: 'Palindrome Checker',
        description: '# Palindrome Checker\n\nCheck if a string is a palindrome.',
        difficulty: 'Easy',
        language: 'javascript',
        starterCode: 'function isPalindrome(str) {\n  // Your code here\n}',
        testCases: [{ input: 'racecar', expectedOutput: 'true' }],
        track: 'Algorithms',
        testCode: 'test',
        tags: ['strings', 'algorithms'],
        blurb: 'Determine if a string is a palindrome'
    },
    {
        slug: 'js-sum-array',
        title: 'Sum Array',
        description: '# Sum Array\n\nCalculate the sum of all numbers in an array.',
        difficulty: 'Easy',
        language: 'javascript',
        starterCode: 'function sumArray(arr) {\n  // Your code here\n}',
        testCases: [{ input: '[1, 2, 3]', expectedOutput: '6' }],
        track: 'Arrays',
        testCode: 'test',
        tags: ['arrays', 'math'],
        blurb: 'Calculate the sum of numbers in an array'
    },

    // --- PYTHON CHALLENGES ---
    {
        slug: 'py-hello-world',
        title: 'Hello World (Python)',
        description: '# Hello World\n\nWrite a function that returns the classic "Hello, World!" greeting in Python.',
        difficulty: 'Easy',
        language: 'python',
        starterCode: 'def hello_world():\n    return "Hello, World!"',
        testCases: [{ input: '', expectedOutput: 'Hello, World!' }],
        track: 'Basics',
        testCode: 'test',
        tags: ['strings', 'introduction'],
        blurb: 'The classical introductory exercise in Python.'
    },
    {
        slug: 'py-reverse-string',
        title: 'Reverse String (Python)',
        description: '# Reverse String\n\nWrite a function that reverses a string in Python.',
        difficulty: 'Easy',
        language: 'python',
        starterCode: 'def reverse_string(s):\n    pass',
        testCases: [{ input: 'hello', expectedOutput: 'olleh' }],
        track: 'Algorithms',
        testCode: 'test',
        tags: ['strings', 'algorithms'],
        blurb: 'Reverse a string using Python slicing.'
    },
    {
        slug: 'py-factorial',
        title: 'Factorial (Python)',
        description: '# Factorial\n\nCalculate the factorial of a number using Python.',
        difficulty: 'Medium',
        language: 'python',
        starterCode: 'def factorial(n):\n    pass',
        testCases: [{ input: '5', expectedOutput: '120' }],
        track: 'Math',
        testCode: 'test',
        tags: ['math', 'recursion'],
        blurb: 'Calculate the factorial of a number.'
    },
    {
        slug: 'py-palindrome',
        title: 'Palindrome Checker (Python)',
        description: '# Palindrome Checker\n\nCheck if a string is a palindrome in Python.',
        difficulty: 'Easy',
        language: 'python',
        starterCode: 'def is_palindrome(s):\n    pass',
        testCases: [{ input: 'racecar', expectedOutput: 'True' }],
        track: 'Algorithms',
        testCode: 'test',
        tags: ['strings', 'algorithms'],
        blurb: 'Determine if a string is a palindrome.'
    },
    // --- JAVA CHALLENGES ---
    {
        slug: 'java-hello-world',
        title: 'Hello World (Java)',
        description: '# Hello World\n\nWrite a method that returns the classic "Hello, World!" greeting.',
        difficulty: 'Easy',
        language: 'java',
        starterCode: 'public class Solution {\n    public static String helloWorld() {\n        return "Hello, World!";\n    }\n}',
        testCases: [{ input: '', expectedOutput: 'Hello, World!' }],
        track: 'Basics',
        testCode: 'test',
        tags: ['strings', 'introduction'],
        blurb: 'The classic Hello World in Java.'
    },
    {
        slug: 'java-add-two',
        title: 'Add Two Numbers',
        description: '# Add Two Numbers\n\nWrite a method that adds two integers.',
        difficulty: 'Easy',
        language: 'java',
        starterCode: 'public class Solution {\n    public static int add(int a, int b) {\n        return 0;\n    }\n}',
        testCases: [{ input: '1, 2', expectedOutput: '3' }],
        track: 'Math',
        testCode: 'test',
        tags: ['math', 'basics'],
        blurb: 'Add two integers in Java.'
    },
    {
        slug: 'java-max',
        title: 'Find Maximum',
        description: '# Find Maximum\n\nFind the largest number in an array.',
        difficulty: 'Medium',
        language: 'java',
        starterCode: 'public class Solution {\n    public static int findMax(int[] arr) {\n        return 0;\n    }\n}',
        testCases: [{ input: '[1, 5, 2]', expectedOutput: '5' }],
        track: 'Arrays',
        testCode: 'test',
        tags: ['arrays', 'logic'],
        blurb: 'Find the maximum value in an integer array.'
    },
    {
        slug: 'java-is-even',
        title: 'Is Even',
        description: '# Is Even\n\nCheck if a number is even.',
        difficulty: 'Easy',
        language: 'java',
        starterCode: 'public class Solution {\n    public static boolean isEven(int n) {\n        return false;\n    }\n}',
        testCases: [{ input: '4', expectedOutput: 'true' }],
        track: 'Math',
        testCode: 'test',
        tags: ['math', 'conditionals'],
        blurb: 'Determine if a number is even.'
    },
    {
        slug: 'java-string-length',
        title: 'String Length',
        description: '# String Length\n\nGet the length of a string.',
        difficulty: 'Easy',
        language: 'java',
        starterCode: 'public class Solution {\n    public static int getLength(String s) {\n        return 0;\n    }\n}',
        testCases: [{ input: 'Java', expectedOutput: '4' }],
        track: 'Strings',
        testCode: 'test',
        tags: ['strings', 'basics'],
        blurb: 'Return the length of a string.'
    },

    // --- C++ CHALLENGES ---
    {
        slug: 'cpp-hello-world',
        title: 'Hello World (C++)',
        description: '# Hello World\n\nWrite a function that returns the classic "Hello, World!" greeting.',
        difficulty: 'Easy',
        language: 'cpp',
        starterCode: '#include <string>\nstd::string helloWorld() {\n    return "Hello, World!";\n}',
        testCases: [{ input: '', expectedOutput: 'Hello, World!' }],
        track: 'Basics',
        testCode: 'test',
        tags: ['strings', 'introduction'],
        blurb: 'The classic Hello World in C++.'
    },
    {
        slug: 'cpp-add',
        title: 'Add Integers',
        description: '# Add Integers\n\nAdd two integers.',
        difficulty: 'Easy',
        language: 'cpp',
        starterCode: 'int add(int a, int b) {\n    return 0;\n}',
        testCases: [{ input: '5, 3', expectedOutput: '8' }],
        track: 'Math',
        testCode: 'test',
        tags: ['math', 'basics'],
        blurb: 'Add two integers in C++.'
    },
    {
        slug: 'cpp-multiply',
        title: 'Multiply',
        description: '# Multiply\n\nMultiply two integers.',
        difficulty: 'Easy',
        language: 'cpp',
        starterCode: 'int multiply(int a, int b) {\n    return 0;\n}',
        testCases: [{ input: '4, 2', expectedOutput: '8' }],
        track: 'Math',
        testCode: 'test',
        tags: ['math', 'basics'],
        blurb: 'Multiply two integers in C++.'
    },
    {
        slug: 'cpp-is-positive',
        title: 'Is Positive',
        description: '# Is Positive\n\nCheck if a number is positive.',
        difficulty: 'Easy',
        language: 'cpp',
        starterCode: 'bool isPositive(int n) {\n    return false;\n}',
        testCases: [{ input: '5', expectedOutput: 'true' }],
        track: 'Logic',
        testCode: 'test',
        tags: ['math', 'conditionals'],
        blurb: 'Check if a number is positive.'
    },
    {
        slug: 'cpp-absolute',
        title: 'Absolute Value',
        description: '# Absolute Value\n\nReturn the absolute value of an integer.',
        difficulty: 'Easy',
        language: 'cpp',
        starterCode: 'int absolute(int n) {\n    return 0;\n}',
        testCases: [{ input: '-5', expectedOutput: '5' }],
        track: 'Math',
        testCode: 'test',
        tags: ['math', 'basics'],
        blurb: 'Calculate absolute value.'
    }
]

const seedChallenges = async () => {
    try {
        console.log('Connecting to MongoDB...', process.env.MONGO_URI ? 'URI found' : 'URI missing')
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is not defined')
        }
        await mongoose.connect(process.env.MONGO_URI)
        console.log('✅ Connected to MongoDB')

        console.log('Clearing existing challenges...')
        // Remove only the static challenges to avoid wiping other user data if any
        const slugs = CHALLENGES.map(c => c.slug)
        await Challenge.deleteMany({ slug: { $in: slugs } })

        console.log('Seeding new static challenges...')
        await Challenge.insertMany(CHALLENGES)

        console.log('✅ Successfully seeded challenges!')
        process.exit(0)
    } catch (error) {
        console.error('❌ Error seeding challenges:')
        console.error(JSON.stringify(error, null, 2))
        // Also print message if available
        if (error.message) console.error(error.message)
        process.exit(1)
    }
}

seedChallenges()

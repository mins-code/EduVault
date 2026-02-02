/**
 * Static Coding Challenges
 * Ready-to-use challenges for EduVault
 */

export const CHALLENGES = [
    // --- JAVASCRIPT CHALLENGES ---
    {
        slug: 'js-hello-world',
        title: 'Hello World',
        description: `# Hello World

Write a function that returns the classic "Hello, World!" greeting.

## Instructions
Create a function called \`helloWorld\` that returns the string "Hello, World!".

## Example
\`\`\`javascript
helloWorld() // => "Hello, World!"
\`\`\``,
        difficulty: 'Easy',
        language: 'javascript',
        starterCode: `function helloWorld() {
  // Your code here
  return "Hello, World!"
}`,
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
        _id: 'js-hello-world'
    },
    {
        slug: 'js-reverse-string',
        title: 'Reverse String',
        description: `# Reverse String

Write a function that reverses a string.

## Instructions
Create a function called \`reverseString\` that takes a string as input and returns it reversed.

## Examples
\`\`\`javascript
reverseString("hello") // => "olleh"
reverseString("world") // => "dlrow"
\`\`\``,
        difficulty: 'Easy',
        language: 'javascript',
        starterCode: `function reverseString(str) {
  // Your code here
  
}`,
        testCases: [
            {
                input: 'hello',
                expectedOutput: 'olleh',
                description: 'Reverses "hello"',
                isHidden: false
            },
            {
                input: 'world',
                expectedOutput: 'dlrow',
                description: 'Reverses "world"',
                isHidden: false
            }
        ],
        tags: ['strings', 'algorithms'],
        blurb: 'Reverse a string character by character',
        _id: 'js-reverse-string'
    },
    {
        slug: 'js-fizzbuzz',
        title: 'FizzBuzz',
        description: `# FizzBuzz

Write a function that returns "Fizz", "Buzz", "FizzBuzz", or the number itself.

## Instructions
Create a function called \`fizzBuzz\` that:
- Returns "Fizz" if the number is divisible by 3
- Returns "Buzz" if the number is divisible by 5
- Returns "FizzBuzz" if divisible by both 3 and 5
- Returns the number as a string otherwise

## Examples
\`\`\`javascript
fizzBuzz(3)  // => "Fizz"
fizzBuzz(5)  // => "Buzz"
fizzBuzz(15) // => "FizzBuzz"
fizzBuzz(7)  // => "7"
\`\`\``,
        difficulty: 'Easy',
        language: 'javascript',
        starterCode: `function fizzBuzz(n) {
  // Your code here
  
}`,
        testCases: [
            {
                input: '3',
                expectedOutput: 'Fizz',
                description: 'Returns "Fizz" for 3',
                isHidden: false
            },
            {
                input: '5',
                expectedOutput: 'Buzz',
                description: 'Returns "Buzz" for 5',
                isHidden: false
            },
            {
                input: '15',
                expectedOutput: 'FizzBuzz',
                description: 'Returns "FizzBuzz" for 15',
                isHidden: false
            },
            {
                input: '7',
                expectedOutput: '7',
                description: 'Returns "7" for 7',
                isHidden: false
            }
        ],
        tags: ['logic', 'conditionals'],
        blurb: 'The classic FizzBuzz programming challenge',
        _id: 'js-fizzbuzz'
    },
    {
        slug: 'js-palindrome',
        title: 'Palindrome Checker',
        description: `# Palindrome Checker

Check if a string is a palindrome (reads the same forwards and backwards).

## Instructions
Create a function called \`isPalindrome\` that returns true if the string is a palindrome, false otherwise.
Ignore spaces and case.

## Examples
\`\`\`javascript
isPalindrome("racecar") // => true
isPalindrome("hello")   // => false
\`\`\``,
        difficulty: 'Easy',
        language: 'javascript',
        starterCode: `function isPalindrome(str) {
  // Your code here
  
}`,
        testCases: [
            {
                input: 'racecar',
                expectedOutput: 'true',
                description: 'Detects palindrome "racecar"',
                isHidden: false
            },
            {
                input: 'hello',
                expectedOutput: 'false',
                description: 'Detects non-palindrome "hello"',
                isHidden: false
            }
        ],
        tags: ['strings', 'algorithms'],
        blurb: 'Determine if a string is a palindrome',
        _id: 'js-palindrome'
    },
    {
        slug: 'js-sum-array',
        title: 'Sum Array',
        description: `# Sum Array

Calculate the sum of all numbers in an array.

## Instructions
Create a function called \`sumArray\` that takes an array of numbers and returns their sum.

## Examples
\`\`\`javascript
sumArray([1, 2, 3, 4]) // => 10
sumArray([10, 20])     // => 30
\`\`\``,
        difficulty: 'Easy',
        language: 'javascript',
        starterCode: `function sumArray(arr) {
  // Your code here
  
}`,
        testCases: [
            {
                input: '[1, 2, 3, 4]',
                expectedOutput: '10',
                description: 'Sums [1,2,3,4]',
                isHidden: false
            },
            {
                input: '[10, 20]',
                expectedOutput: '30',
                description: 'Sums [10,20]',
                isHidden: false
            }
        ],
        tags: ['arrays', 'math'],
        blurb: 'Calculate the sum of numbers in an array',
        _id: 'js-sum-array'
    },

    // --- PYTHON CHALLENGES ---
    {
        slug: 'py-hello-world',
        title: 'Hello World (Python)',
        description: `# Hello World

Write a function that returns the classic "Hello, World!" greeting.

## Instructions
Create a function called \`hello_world\` that returns the string "Hello, World!".

## Example
\`\`\`python
hello_world() # => "Hello, World!"
\`\`\``,
        difficulty: 'Easy',
        language: 'python',
        starterCode: `def hello_world():
    # Your code here
    return "Hello, World!"`,
        testCases: [
            {
                input: '',
                expectedOutput: 'Hello, World!',
                description: 'Returns the greeting',
                isHidden: false
            }
        ],
        tags: ['strings', 'introduction'],
        blurb: 'The classical introductory exercise in Python.',
        _id: 'py-hello-world'
    },
    {
        slug: 'py-reverse-string',
        title: 'Reverse String (Python)',
        description: `# Reverse String

Write a function that reverses a string.

## Instructions
Create a function called \`reverse_string\` that takes a string as input and returns it reversed.

## Examples
\`\`\`python
reverse_string("hello") # => "olleh"
reverse_string("world") # => "dlrow"
\`\`\``,
        difficulty: 'Easy',
        language: 'python',
        starterCode: `def reverse_string(s):
    # Your code here
    pass`,
        testCases: [
            {
                input: 'hello',
                expectedOutput: 'olleh',
                description: 'Reverses "hello"',
                isHidden: false
            }
        ],
        tags: ['strings', 'algorithms'],
        blurb: 'Reverse a string using Python slicing or loop.',
        _id: 'py-reverse-string'
    },
    {
        slug: 'py-factorial',
        title: 'Factorial (Python)',
        description: `# Factorial

Calculate the factorial of a number using Python.

## Instructions
Create a function called \`factorial\` that calculates n! (n factorial).
factorial(5) = 5 × 4 × 3 × 2 × 1 = 120

## Examples
\`\`\`python
factorial(5) # => 120
factorial(3) # => 6
\`\`\``,
        difficulty: 'Medium',
        language: 'python',
        starterCode: `def factorial(n):
    # Your code here
    pass`,
        testCases: [
            {
                input: '5',
                expectedOutput: '120',
                description: 'Calculates 5!',
                isHidden: false
            }
        ],
        tags: ['math', 'recursion'],
        blurb: 'Calculate the factorial of a number.',
        _id: 'py-factorial'
    },
    {
        slug: 'py-palindrome',
        title: 'Palindrome Checker (Python)',
        description: `# Palindrome Checker

Check if a string is a palindrome in Python.

## Instructions
Create a function called \`is_palindrome\` that returns True if the string is a palindrome, False otherwise.

## Examples
\`\`\`python
is_palindrome("racecar") # => True
is_palindrome("hello")   # => False
\`\`\``,
        difficulty: 'Easy',
        language: 'python',
        starterCode: `def is_palindrome(s):
    # Your code here
    pass`,
        testCases: [
            {
                input: 'racecar',
                expectedOutput: 'True',
                description: 'Detects palindrome "racecar"',
                isHidden: false
            }
        ],
        tags: ['strings', 'algorithms'],
        blurb: 'Determine if a string is a palindrome.',
        _id: 'py-palindrome'
    },
    {
        slug: 'py-sum-list',
        title: 'Sum List (Python)',
        description: `# Sum List

Calculate the sum of all numbers in a list.

## Instructions
Create a function called \`sum_list\` that takes a list of numbers and returns their sum.

## Examples
\`\`\`python
sum_list([1, 2, 3, 4]) # => 10
sum_list([10, 20])     # => 30
\`\`\``,
        difficulty: 'Easy',
        language: 'python',
        starterCode: `def sum_list(nums):
    # Your code here
    pass`,
        testCases: [
            {
                input: '[1, 2, 3, 4]',
                expectedOutput: '10',
                description: 'Sums [1,2,3,4]',
                isHidden: false
            }
        ],
        tags: ['lists', 'math'],
        blurb: 'Calculate the sum of numbers in a list.',
        _id: 'py-sum-list'
    },

    // --- JAVA CHALLENGES ---
    {
        slug: 'java-hello-world',
        title: 'Hello World (Java)',
        description: `# Hello World

Write a method that returns the classic "Hello, World!" greeting.

## Instructions
Complete the method \`helloWorld\` to return "Hello, World!".

## Example
\`\`\`java
helloWorld(); // => "Hello, World!"
\`\`\``,
        difficulty: 'Easy',
        language: 'java',
        starterCode: `public class Solution {
    public static String helloWorld() {
        // Your code here
        return "Hello, World!";
    }
}`,
        testCases: [
            {
                input: '',
                expectedOutput: 'Hello, World!',
                description: 'Returns the greeting',
                isHidden: false
            }
        ],
        tags: ['strings', 'introduction'],
        blurb: 'The classic Hello World in Java.',
        _id: 'java-hello-world'
    },
    {
        slug: 'java-add-two',
        title: 'Add Two Numbers (Java)',
        description: `# Add Two Numbers

Write a method that adds two integers.

## Instructions
Complete the method \`add\` that takes two integers \`a\` and \`b\` and returns their sum.

## Example
\`\`\`java
add(1, 2); // => 3
\`\`\``,
        difficulty: 'Easy',
        language: 'java',
        starterCode: `public class Solution {
    public static int add(int a, int b) {
        // Your code here
        return 0;
    }
}`,
        testCases: [
            {
                input: '1, 2',
                expectedOutput: '3',
                description: 'Adds 1 and 2',
                isHidden: false
            }
        ],
        tags: ['math', 'basics'],
        blurb: 'Add two integers in Java.',
        _id: 'java-add-two'
    },
    {
        slug: 'java-max',
        title: 'Find Maximum (Java)',
        description: `# Find Maximum

Find the largest number in an array.

## Instructions
Complete the method \`findMax\` that takes an integer array and returns the largest element.

## Example
\`\`\`java
findMax(new int[]{1, 5, 2}); // => 5
\`\`\``,
        difficulty: 'Medium',
        language: 'java',
        starterCode: `public class Solution {
    public static int findMax(int[] arr) {
        // Your code here
        return 0;
    }
}`,
        testCases: [
            {
                input: '[1, 5, 2]',
                expectedOutput: '5',
                description: 'Finds max',
                isHidden: false
            }
        ],
        tags: ['arrays', 'logic'],
        blurb: 'Find the maximum value in an integer array.',
        _id: 'java-max'
    },
    {
        slug: 'java-is-even',
        title: 'Is Even (Java)',
        description: `# Is Even

Check if a number is even.

## Instructions
Complete the method \`isEven\` that returns true if n is even, false otherwise.

## Example
\`\`\`java
isEven(4); // => true
isEven(3); // => false
\`\`\``,
        difficulty: 'Easy',
        language: 'java',
        starterCode: `public class Solution {
    public static boolean isEven(int n) {
        // Your code here
        return false;
    }
}`,
        testCases: [
            {
                input: '4',
                expectedOutput: 'true',
                description: 'Check even',
                isHidden: false
            }
        ],
        tags: ['math', 'conditionals'],
        blurb: 'Determine if a number is even in Java.',
        _id: 'java-is-even'
    },
    {
        slug: 'java-string-length',
        title: 'String Length (Java)',
        description: `# String Length

Get the length of a string.

## Instructions
Complete the method \`getLength\` that returns the length of a string.

## Example
\`\`\`java
getLength("Java"); // => 4
\`\`\``,
        difficulty: 'Easy',
        language: 'java',
        starterCode: `public class Solution {
    public static int getLength(String s) {
        // Your code here
        return 0;
    }
}`,
        testCases: [
            {
                input: 'Java',
                expectedOutput: '4',
                description: 'Check length',
                isHidden: false
            }
        ],
        tags: ['strings', 'basics'],
        blurb: 'Return the length of a string.',
        _id: 'java-string-length'
    },

    // --- C++ CHALLENGES ---
    {
        slug: 'cpp-hello-world',
        title: 'Hello World (C++)',
        description: `# Hello World

Write a function that returns the classic "Hello, World!" greeting.

## Instructions
Return the string "Hello, World!" from the function \`helloWorld\`.

## Example
\`\`\`cpp
helloWorld(); // => "Hello, World!"
\`\`\``,
        difficulty: 'Easy',
        language: 'cpp',
        starterCode: `#include <string>

std::string helloWorld() {
    // Your code here
    return "Hello, World!";
}`,
        testCases: [
            {
                input: '',
                expectedOutput: 'Hello, World!',
                description: 'Returns the greeting',
                isHidden: false
            }
        ],
        tags: ['strings', 'introduction'],
        blurb: 'The classic Hello World in C++.',
        _id: 'cpp-hello-world'
    },
    {
        slug: 'cpp-add',
        title: 'Add Integers (C++)',
        description: `# Add Integers

Add two integers.

## Instructions
Return the sum of integers a and b.

## Example
\`\`\`cpp
add(5, 3); // => 8
\`\`\``,
        difficulty: 'Easy',
        language: 'cpp',
        starterCode: `int add(int a, int b) {
    // Your code here
    return 0;
}`,
        testCases: [
            {
                input: '5, 3',
                expectedOutput: '8',
                description: 'Adds 5 and 3',
                isHidden: false
            }
        ],
        tags: ['math', 'basics'],
        blurb: 'Add two integers in C++.',
        _id: 'cpp-add'
    },
    {
        slug: 'cpp-multiply',
        title: 'Multiply (C++)',
        description: `# Multiply

Multiply two integers.

## Instructions
Return the product of integers a and b.

## Example
\`\`\`cpp
multiply(4, 2); // => 8
\`\`\``,
        difficulty: 'Easy',
        language: 'cpp',
        starterCode: `int multiply(int a, int b) {
    // Your code here
    return 0;
}`,
        testCases: [
            {
                input: '4, 2',
                expectedOutput: '8',
                description: 'Multiplies 4 and 2',
                isHidden: false
            }
        ],
        tags: ['math', 'basics'],
        blurb: 'Multiply two integers in C++.',
        _id: 'cpp-multiply'
    },
    {
        slug: 'cpp-is-positive',
        title: 'Is Positive (C++)',
        description: `# Is Positive

Check if a number is positive.

## Instructions
Return true if n > 0, else false.

## Example
\`\`\`cpp
isPositive(5); // => true
isPositive(-1); // => false
\`\`\``,
        difficulty: 'Easy',
        language: 'cpp',
        starterCode: `bool isPositive(int n) {
    // Your code here
    return false;
}`,
        testCases: [
            {
                input: '5',
                expectedOutput: 'true',
                description: 'Check positive',
                isHidden: false
            }
        ],
        tags: ['math', 'conditionals'],
        blurb: 'Check if a number is positive.',
        _id: 'cpp-is-positive'
    },
    {
        slug: 'cpp-absolute',
        title: 'Absolute Value (C++)',
        description: `# Absolute Value

Return the absolute value of an integer.

## Instructions
Implement \`absolute\` to return |n|.

## Example
\`\`\`cpp
absolute(-5); // => 5
absolute(5); // => 5
\`\`\``,
        difficulty: 'Easy',
        language: 'cpp',
        starterCode: `int absolute(int n) {
    // Your code here
    return 0;
}`,
        testCases: [
            {
                input: '-5',
                expectedOutput: '5',
                description: 'Absolute of -5',
                isHidden: false
            }
        ],
        tags: ['math', 'basics'],
        blurb: 'Calculate absolute value.',
        _id: 'cpp-absolute'
    }
]

export default CHALLENGES

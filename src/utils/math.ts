export const add = (a: number, b: number): number => a + b;

export const subtract = (a: number, b: number): number => a - b;

export const multiply = (a: number, b: number): number => a * b;

export const divide = (a: number, b: number): number => {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
};

export const power = (base: number, exponent: number): number => {
  return Math.pow(base, exponent);
};

export const square = (n: number): number => {
  return n * n;
};

// The following functions are intentionally left untested to demonstrate partial coverage

export const factorial = (n: number): number => {
  if (n < 0) {
    throw new Error('Factorial of negative number is undefined');
  }
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * factorial(n - 1);
};

export const isPrime = (num: number): boolean => {
  if (num <= 1) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;

  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false;
  }
  return true;
};

/**
 * Calculates the Greatest Common Divisor (GCD) of two numbers
 * using the Euclidean algorithm.
 *
 * The GCD is the largest positive integer that divides both numbers
 * without a remainder. This function uses recursion to efficiently
 * compute the result.
 *
 * @param a - The first positive integer
 * @param b - The second positive integer
 * @returns The greatest common divisor of a and b
 * @throws Error if either input is negative
 *
 * @example
 * gcd(48, 18) // returns 6
 * gcd(100, 25) // returns 25
 * gcd(17, 19) // returns 1 (coprime numbers)
 */
export const gcd = (a: number, b: number): number => {
  // Validate inputs - GCD is only defined for non-negative integers
  if (a < 0 || b < 0) {
    throw new Error('GCD is not defined for negative numbers');
  }

  // Base case: if b is 0, the GCD is a
  if (b === 0) {
    return a;
  }

  // Recursive case: apply Euclidean algorithm
  // gcd(a, b) = gcd(b, a mod b)
  return gcd(b, a % b);
};

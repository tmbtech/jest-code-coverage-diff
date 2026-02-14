import { add, subtract, multiply, divide, power, square } from './math';

describe('Math utilities', () => {
  describe('add', () => {
    it('adds two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('adds negative numbers', () => {
      expect(add(-2, -3)).toBe(-5);
    });
  });

  describe('subtract', () => {
    it('subtracts two numbers', () => {
      expect(subtract(5, 3)).toBe(2);
    });

    it('subtracts with negative result', () => {
      expect(subtract(3, 5)).toBe(-2);
    });
  });

  describe('multiply', () => {
    it('multiplies two numbers', () => {
      expect(multiply(4, 5)).toBe(20);
    });

    it('multiplies by zero', () => {
      expect(multiply(4, 0)).toBe(0);
    });
  });

  describe('divide', () => {
    it('divides two numbers', () => {
      expect(divide(10, 2)).toBe(5);
    });

    it('throws error when dividing by zero', () => {
      expect(() => divide(10, 0)).toThrow('Division by zero');
    });

    it('divides with decimal result', () => {
      expect(divide(7, 2)).toBe(3.5);
    });
  });

  describe('power', () => {
    it('calculates power correctly', () => {
      expect(power(2, 3)).toBe(8);
    });

    it('handles power of zero', () => {
      expect(power(5, 0)).toBe(1);
    });

    it('handles power of one', () => {
      expect(power(5, 1)).toBe(5);
    });
  });

  describe('square', () => {
    it('squares a positive number', () => {
      expect(square(5)).toBe(25);
    });

    it('squares a negative number', () => {
      expect(square(-4)).toBe(16);
    });

    it('squares zero', () => {
      expect(square(0)).toBe(0);
    });

    it('squares a decimal number', () => {
      expect(square(2.5)).toBe(6.25);
    });
  });

  // factorial and isPrime are intentionally not tested
  // This demonstrates partial coverage (~60%)
  // Future PRs can add tests for these functions to show coverage improvement
});

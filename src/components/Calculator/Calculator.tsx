import { useState } from 'react';
import styles from './Calculator.module.css';

export type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

export const Calculator = () => {
  const [num1, setNum1] = useState<string>('');
  const [num2, setNum2] = useState<string>('');
  const [operation, setOperation] = useState<Operation>('add');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  const calculate = () => {
    setError('');
    setResult(null);

    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);

    if (isNaN(n1) || isNaN(n2)) {
      setError('Please enter valid numbers');
      return;
    }

    let calculatedResult: number;

    switch (operation) {
      case 'add':
        calculatedResult = n1 + n2;
        break;
      case 'subtract':
        calculatedResult = n1 - n2;
        break;
      case 'multiply':
        calculatedResult = n1 * n2;
        break;
      case 'divide':
        if (n2 === 0) {
          setError('Cannot divide by zero');
          return;
        }
        calculatedResult = n1 / n2;
        break;
    }

    setResult(calculatedResult);
  };

  return (
    <div className={styles.calculator}>
      <h2>Calculator</h2>
      <div className={styles.inputs}>
        <input
          type="number"
          value={num1}
          onChange={(e) => setNum1(e.target.value)}
          placeholder="Number 1"
          aria-label="First number"
        />
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value as Operation)}
          aria-label="Operation"
        >
          <option value="add">+</option>
          <option value="subtract">-</option>
          <option value="multiply">×</option>
          <option value="divide">÷</option>
        </select>
        <input
          type="number"
          value={num2}
          onChange={(e) => setNum2(e.target.value)}
          placeholder="Number 2"
          aria-label="Second number"
        />
      </div>
      <button onClick={calculate}>Calculate</button>
      {result !== null && (
        <div className={styles.result} data-testid="result">
          Result: {result}
        </div>
      )}
      {error && (
        <div className={styles.error} data-testid="error">
          {error}
        </div>
      )}
    </div>
  );
};

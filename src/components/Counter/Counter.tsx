import { useState } from 'react';
import styles from './Counter.module.css';

export const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div className={styles.counter}>
      <h2>Counter: {count}</h2>
      <div className={styles.buttons}>
        <button onClick={() => setCount(count - 1)} aria-label="decrement">-</button>
        <button onClick={() => setCount(0)} aria-label="reset">Reset</button>
        <button onClick={() => setCount(count + 1)} aria-label="increment">+</button>
      </div>
    </div>
  );
};

import React from 'react';
import { useCounterContext } from './CounterContext';

export default function Clicker(props) {
  const { counter, setCounter } = useCounterContext();

  const onClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setCounter(counter + 1);
  };

  return (
    <div>
      <div onClick={onClick}>Increase Counter, {props.info}</div>
      <div>Counter: {counter}</div>
    </div>
  );
}

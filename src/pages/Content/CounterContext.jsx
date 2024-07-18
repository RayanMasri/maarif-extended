import React, { useState, createContext, useContext } from 'react';

const CounterContext = createContext({
  counter: 0,
  setCounter: (main) => {},
});

export function CounterContextProvider(props) {
  const [counter, setCounter] = useState(0);

  return (
    <CounterContext.Provider value={{ counter, setCounter }}>
      {props.children}
    </CounterContext.Provider>
  );
}

export const useCounterContext = () => useContext(CounterContext);

import React, { useState, createContext, useContext, useMemo } from 'react';

const object = {
  selected: [],
  maximum: 1, // To prevent confusin when comparing length to maximum initially in Header
  data: null,
  download: {
    status: false,
    requested: [],
  },
};

const MainContext = createContext({
  main: object,
  setMain: (main) => {},
});

export function MainContextProvider(props) {
  const [main, setMain] = useState(object);
  // const store = React.useMemo(() => ({ main, setMain }), [main]);

  // const mainMemo = useMemo(
  //   () => ({
  //     main,
  //     setMain,
  //   }),
  //   []
  // );

  return (
    <MainContext.Provider value={{ main, setMain }}>
      {/* <MainContext.Provider value={mainMemo}> */}
      {props.children}
    </MainContext.Provider>
  );
}

export const useMainContext = () => useContext(MainContext);

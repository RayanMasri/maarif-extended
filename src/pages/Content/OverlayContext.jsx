import React, { useState, createContext, useContext, useMemo } from 'react';

const object = {
  download: {
    status: false,
    requested: [],
  },
  progress: {
    value: 0,
    message: '',
  },
};

const OverlayContext = createContext({
  overlay: object,
  setOverlay: (overlay) => {},
});

export function OverlayContextProvider(props) {
  const [overlay, setOverlay] = useState(object);
  // const store = React.useMemo(() => ({ overlay, setOverlay }), [overlay]);

  // const overlayMemo = useMemo(
  //   () => ({
  //     overlay,
  //     setOverlay,
  //   }),
  //   []
  // );

  return (
    <OverlayContext.Provider value={{ overlay, setOverlay }}>
      {/* <OverlayContext.Provider value={overlayMemo}> */}
      {props.children}
    </OverlayContext.Provider>
  );
}

export const useOverlayContext = () => useContext(OverlayContext);

import React from 'react';
import { useMainContext } from '../MainContext';
import { useOverlayContext } from '../OverlayContext';

const useRequestHook = () => {
  const { main, setMain } = useMainContext();
  const { overlay, setOverlay } = useOverlayContext();

  const requestDownload = (indices) => {
    let requested = [];

    for (let index of indices) {
      requested.push({
        ...main.data[index],
        index: index,
      });
    }

    setOverlay({
      ...overlay,
      download: {
        status: true,
        requested: requested,
      },
    });
  };

  return {
    requestDownload,
  };
};

export default useRequestHook;

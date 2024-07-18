import React from 'react';
import { MainContextProvider } from './MainContext';
import { OverlayContextProvider } from './OverlayContext';
import MockTable from './MockTable';
import Overlay from './components/Overlay';
import Hidden from './components/Hidden';

export default function App(props) {
  return (
    <MainContextProvider>
      <OverlayContextProvider>
        <Hidden />
        <Overlay />
        <MockTable data={props.data} />
      </OverlayContextProvider>
    </MainContextProvider>
  );
}

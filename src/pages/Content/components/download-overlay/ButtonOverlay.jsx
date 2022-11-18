import React from 'react';
import Button from '@mui/material/Button';

export function ButtonOverlay(props) {
  return (
    <Button
      className="overlay-btn"
      sx={{
        width: '150px',
        fontSize: '14px',
        borderRadius: '0px',
        ...props.sx,
      }}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
}

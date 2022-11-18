import React from 'react';

export function Label(props) {
  return (
    <div
      style={{
        color: 'black',
        fontSize: '16px',
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
}

import React from 'react';

export function Container(props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
}

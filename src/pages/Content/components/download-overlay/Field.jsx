import React, { useState } from 'react';
import Menu from './Menu.jsx';
import { Container } from './Container';
import { Label } from './Label';
import calculateTextWidth from 'calculate-text-width';

// {readState != 'Plan to read' ? (
//   <div className="model-container-bookmark model-container-data-bottom-composite">
//     <img src={require('../../assets/img/bookmark.svg')} />
//     <input
//       type="number"
//       value={state.read}
//       style={{
//         width: calculateTextWidth(
//           isNaN(state.read) ? ' ' : state.read.toString(),
//           'normal 500 13px Janna LT'
//         ),
//         fontSize: 13,
//       }}
//       onChange={onReadCountChange}
//       onBlur={onBlur}
//       onKeyDown={onKeyDown}
//     />
//     {/* <div>9999</div> */}
//   </div>
// ) : (
//   ''
// )}
export function Field(props) {
  return (
    !props.hidden && (
      <Container style={props.style}>
        <Label style={{ marginRight: '5px' }}>{props.children}</Label>
        <input
          type="text"
          value={props.value}
          style={{
            width: calculateTextWidth(props.value, 'normal 500 14px Arial'),
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            textDecoration: 'underline',
            color: '#8D8D8D',
            fontFamily: 'Arial',
            padding: '0px',
            backgroundColor: 'transparent',
            marginBottom: '2px',
          }}
          onChange={(event) => props.onChange(event.target.value)}
        ></input>
        {props.postfix && (
          <div
            style={{
              color: 'black',
              fontFamily: 'Arial',
              fontStyle: 'italic',
              fontSize: '14px',
              marginBottom: '2px',
            }}
          >
            &nbsp;{props.postfix}
          </div>
        )}
      </Container>
    )
  );
}

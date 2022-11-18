import React from 'react';
import Menu from './Menu.jsx';
import { Container } from './Container';
import { Label } from './Label';

export function Dropdown(props) {
  return (
    !props.hidden && (
      <Container style={props.style}>
        <Label style={{ marginRight: '5px', whiteSpace: 'nowrap' }}>
          {props.children}
        </Label>
        <Menu
          id={props.id}
          options={props.options}
          default={props.default}
          value={props.value}
          width="265px"
          onChange={props.onChange}
        />
      </Container>
    )
  );
}

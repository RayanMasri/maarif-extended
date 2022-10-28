import React from 'react';
import Checkbox from '@mui/material/Checkbox';
import { Container } from './Container';
import { Label } from './Label';

export function Option(props) {
  return (
    <Container style={props.style}>
      <Checkbox
        sx={{
          width: 24,
          height: 24,
        }}
        checked={props.checked}
        onChange={props.onChange}
      />
      <Label
        style={{
          marginLeft: '5px',
          marginTop: '3px',
        }}
      >
        {props.children}
      </Label>
    </Container>
  );
}

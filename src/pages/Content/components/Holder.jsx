import React, { useState, useRef, useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import IconButton from '@mui/material/IconButton';

const iconSize = 20;

export default function Holder(props) {
  const [state, setState] = useState({
    open: true,
    height: 'max-content',
  });

  const main = useRef(null);

  const updateHeight = (ms = 0) => {
    setTimeout(
      function () {
        setState({
          ...state,
          height: document.querySelector(`#${props.id}-main > div`)
            .clientHeight,
        });
      },
      ms == 0 ? 0 : 100 * ms + 100
    );
  };

  useEffect(() => {
    updateHeight();
  }, []);

  const toggleOpen = () => {
    let after = !state.open;

    setState({
      ...state,
      open: after,
      height: main.current.children[0].clientHeight,
    });
  };
  const dropDownInteract = (target) => {
    if (target.id != props.id) {
      let hierarchy = target.getAttribute('hierarchy');
      let diff = parseInt(hierarchy) - props.hierarchy;
      updateHeight(diff);
    }
  };
  return (
    <div
      style={{
        width: '100%',
      }}
      onMouseDown={function (event) {
        let holder =
          event.target.parentElement.parentElement.querySelector(
            '.holder-arrow-icon'
          );

        if (holder != undefined) {
          dropDownInteract(holder);
        }
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '5px',
          marginBottom: props.noNameMargin ? '0px' : '5px',
        }}
      >
        {/* <div>{`${props.name} -> ${state.height}`}</div> */}
        <div
          style={{
            marginRight: 5,
            fontSize: 12,
            color: '#8D8D8D',
            textTransform: 'uppercase',
          }}
        >
          {props.name}
        </div>

        <div
          style={{
            width: 'max-content',
            height: 'max-content',
          }}
          onClick={toggleOpen}
        >
          {state.open ? (
            <KeyboardArrowDownIcon
              className="holder-arrow-icon"
              id={props.id}
              hierarchy={props.hierarchy}
              sx={{
                color: '#8D8D8D',
                width: iconSize,
                height: iconSize,
              }}
            />
          ) : (
            <KeyboardArrowUpIcon
              className="holder-arrow-icon"
              id={props.id}
              hierarchy={props.hierarchy}
              sx={{
                color: '#8D8D8D',
                width: iconSize,
                height: iconSize,
              }}
            />
          )}
        </div>
      </div>
      <div
        style={{
          height: state.open ? state.height : '0px',
          transition: '0.1s ease-in-out',
          overflow: 'hidden',
          marginBottom: state.open ? '10px' : '0px',
        }}
        id={`${props.id}-main`}
        ref={main}
      >
        <div
          style={{
            height: 'max-content',
          }}
        >
          {props.children}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import QuizIcon from '@mui/icons-material/Quiz';

// import IconButton from './IconButton.jsx';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
// import jsPDF from '../jspdf.umd.js';
import useUtilityHook from '../hooks/UtilityHook.jsx';
import { useMainContext } from '../MainContext';

export default function RowTools(props) {
  const { main, setMain } = useMainContext();
  let [state, setState] = useState({
    checked: false,
    indeterminate: false,
  });

  // let pdf = new jsPDF('p', 'mm', [612, 792]);

  // useEffect(() => {
  //   console.log(
  //     `${props.index} changed to ${window.extension.exams[props.index]}`
  //   );
  // }, [JSON.stringify(window.extension.exams)]);

  const onChange = (event, value) => {
    setState({
      checked: value,
      indeterminate: false,
    });

    console.log(`${props.index} set to ${value}`);
    if (value && !main.selected.includes(props.index)) {
      console.log(
        `Not in main, changing from ${JSON.stringify(
          main.selected
        )} to ${JSON.stringify([props.index].concat(main.selected))}`
      );
      setMain({
        ...main,
        selected: [props.index].concat(main.selected),
      });
    }

    // props.onChange(value, props.index);
  };

  const checked = () => {
    // console.log(`${props.index} checking if checked...`);
    // console.log(main.selected);

    return main.selected.includes(props.index);
  };

  const toggle = () => {
    let status = checked();
    console.log(
      `Toggling ${props.index}, current status: ${
        status ? 'Checked' : 'Unchecked'
      }`
    );

    // If enabled, disable
    if (status) {
      console.log('Disabling...');
      let old = Array.from(main.selected);
      main.selected.splice(
        main.selected.findIndex((item) => item == props.index),
        1
      );
      console.log(
        `Changing main.selected from (${old.length}) ${JSON.stringify(
          old
        )} to (${main.selected.length}) ${JSON.stringify(main.selected)}`
      );
      setMain({
        ...main,
        selected: main.selected,
      });
    } else {
      console.log('Enabling...');

      let changed = [props.index].concat(main.selected);

      console.log(
        `Changing main.selected from (${main.selected.length}) ${JSON.stringify(
          main.selected
        )} to (${changed.length}) ${JSON.stringify(changed)}`
      );
      // If disabled, enable
      setMain({
        ...main,
        selected: changed,
      });
    }
  };

  const onRequest = (event) => {
    document.dispatchEvent(
      new CustomEvent(event, { detail: { exams: [props.index] } })
    );
  };

  return (
    <td
      className={props.className}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        backgroundImage: 'none',
      }}
      index={props.index}
    >
      {/* <Checkbox onChange={props.onChange} /> */}
      <Checkbox
        // onChange={(event, value) => props.onChange(value, props.index)}
        // checked={props.checked}
        checked={checked()}
        onMouseEnter={(event) => {
          if (event.buttons == 1) toggle();
        }}
        onMouseDown={toggle}
      />

      <IconButton onClick={() => onRequest('request-retake')}>
        <QuizIcon sx={{ width: 24, height: 24 }} />
      </IconButton>

      {/* <IconButton onClick={onRequestDownload}> */}
      <IconButton onClick={() => onRequest('request-download')}>
        <DownloadRoundedIcon sx={{ width: 24, height: 24 }} />
      </IconButton>
    </td>
  );
}
